import { useCallback, useEffect, useState } from 'react';
import { useSDK } from '../contexts/useSDK';
import { useAuth } from '../contexts/useAuth';
import { APIError } from '@my-dashboard/sdk';

/**
 * Options for SDK data fetching hooks
 */
export interface UseSDKDataOptions {
  /** Whether the hook should fetch data. Default: true */
  enabled?: boolean;
  /** Interval in milliseconds to refetch data. If not provided, no automatic refetching occurs */
  refetchInterval?: number;
  /** Whether to refetch data when the browser tab becomes visible. Default: true */
  refetchOnVisibilityChange?: boolean;
}

/**
 * Result returned by SDK data fetching hooks
 */
export interface UseSDKDataResult<T> {
  /** The fetched data, undefined if not yet fetched, null if no data */
  data: T | null | undefined;
  /** Whether the data is currently being fetched */
  loading: boolean;
  /** Error that occurred during fetching, if any */
  error: Error | null;
  /** Function to manually refetch the data */
  refetch: () => Promise<void>;
}

/**
 * Generic hook for SDK data fetching with loading, error, and refetch functionality
 */
export function useSDKData<T>(
  fetcher: () => Promise<T>,
  options: UseSDKDataOptions = {},
): UseSDKDataResult<T> {
  const { api, isReady } = useSDK();
  const { logout } = useAuth();
  const { enabled = true, refetchInterval, refetchOnVisibilityChange = true } = options;

  // Undefined means not yet fetched, null means no data
  const [data, setData] = useState<T | undefined | null>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!isReady || !api || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');

      // Handle 401 errors by logging out the user
      if (err instanceof APIError && err.status === 401) {
        logout();
        return; // Don't set error state as user will be redirected to login
      }

      setError(error);
    } finally {
      setLoading(false);
    }
  }, [api, isReady, enabled, fetcher, logout]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) {
      return;
    }

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [fetchData, refetchInterval, enabled]);

  // Refetch on tab becoming active
  useEffect(() => {
    if (!refetchOnVisibilityChange || !enabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch, refetchOnVisibilityChange, enabled]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for mutation operations with loading and error states
 */
export function useSDKMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
): {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: APIError | Error | null;
  reset: () => void;
} {
  const { api, isReady } = useSDK();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (!isReady || !api) {
        throw new Error('SDK not ready');
      }

      setLoading(true);
      setError(null);

      try {
        return await mutationFn(variables);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');

        // Handle 401 errors by logging out the user
        if (err instanceof APIError && err.status === 401) {
          logout();
          throw err; // Still throw the error for the caller to handle
        }

        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api, isReady, mutationFn, logout],
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
}
