import { useCallback } from 'react';
import { useSDKData, useSDKMutation } from './useSDKData';
import { useSDK } from '../contexts/useSDK';
import type { 
  Application, 
  ApplicationDetails,
} from '@my-dashboard/types';

/**
 * Hook for apps data
 */
export function useApps(options?: { enabled?: boolean; refetchInterval?: number }) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<Application[]> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.applications.getApplications();
  }, [api]);

  return useSDKData(fetcher, options);
}

/**
 * Hook for single app data
 */
export function useApp(id: number, options?: { enabled?: boolean; refetchInterval?: number }) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<ApplicationDetails> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.applications.getApplication(id);
  }, [api, id]);

  return useSDKData(fetcher, { ...options, enabled: options?.enabled !== false && !!id });
}

/**
 * Hook for creating apps
 */
export function useCreateApp() {
  const { api } = useSDK();

  const mutationFn = useCallback(async (data: Application): Promise<Application> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.applications.createApplication(data);
  }, [api]);

  return useSDKMutation(mutationFn);
}

/**
 * Hook for updating apps
 */
export function useUpdateApp() {
  const { api } = useSDK();

  const mutationFn = useCallback(async ({ id, data }: { id: number; data: Application }): Promise<Application> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.applications.updateApplication(id, data);
  }, [api]);

  return useSDKMutation(mutationFn);
}

/**
 * Hook for deleting apps
 */
export function useDeleteApp() {
  const { api } = useSDK();

  const mutationFn = useCallback(async (id: number): Promise<{ success: boolean }> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.applications.deleteApplication(id);
  }, [api]);

  return useSDKMutation(mutationFn);
}
