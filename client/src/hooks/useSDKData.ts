import { useState, useEffect, useCallback } from 'react';
import { useSDK } from '../contexts/useSDK';

interface UseSDKDataOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseSDKDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
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
  const { enabled = true, refetchInterval } = options;

  const [data, setData] = useState<T | null>(null);
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
      setError(error);
      // eslint-disable-next-line no-console
      console.error('SDK data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [api, isReady, enabled, fetcher]);

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
  error: Error | null;
  reset: () => void;
} {
  const { api, isReady } = useSDK();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    if (!isReady || !api) {
      throw new Error('SDK not ready');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, isReady, mutationFn]);

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
