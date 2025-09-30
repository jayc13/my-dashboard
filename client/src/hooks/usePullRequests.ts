import { useCallback } from 'react';
import { useSDKData, useSDKMutation } from './useSDKData';
import { useSDK } from '../contexts/useSDK';
import type { 
  PullRequest,
  GithubPullRequestDetails,
  AddPullRequestRequest,
} from '@my-dashboard/types';

/**
 * Hook for pull requests data
 */
export function usePullRequests(options?: { enabled?: boolean; refetchInterval?: number }) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<PullRequest[]> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.pullRequests.getPullRequests();
  }, [api]);

  return useSDKData(fetcher, options);
}

/**
 * Hook for pull request details
 */
export function usePullRequestDetails(id: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<GithubPullRequestDetails> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.pullRequests.getPullRequestDetails(id);
  }, [api, id]);

  return useSDKData(fetcher, { ...options, enabled: options?.enabled !== false && !!id });
}

/**
 * Hook for adding pull requests
 */
export function useAddPullRequest() {
  const { api } = useSDK();

  const mutationFn = useCallback(async (data: AddPullRequestRequest): Promise<PullRequest> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.pullRequests.addPullRequest(data);
  }, [api]);

  return useSDKMutation(mutationFn);
}

/**
 * Hook for deleting pull requests
 */
export function useDeletePullRequest() {
  const { api } = useSDK();

  const mutationFn = useCallback(async (id: string): Promise<{ success: boolean }> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.pullRequests.deletePullRequest(id);
  }, [api]);

  return useSDKMutation(mutationFn);
}
