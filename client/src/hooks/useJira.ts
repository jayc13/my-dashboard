import { useCallback } from 'react';
import { useSDKData, type UseSDKDataOptions } from './useSDKData';
import { useSDK } from '../contexts/useSDK';
import {
  type JiraIssuesResponse,
} from '@my-dashboard/types';

/**
 * Hook for my assigned JIRA tickets
 */
export function useMyJiraTickets(options?: UseSDKDataOptions) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<JiraIssuesResponse> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.jira.getMyJiraTickets();
  }, [api]);

  return useSDKData(fetcher, options);
}

export function useManualQATasks(options?: UseSDKDataOptions) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<JiraIssuesResponse> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.jira.getManualQATasks();
  }, [api]);

  return useSDKData(fetcher, { ...options, enabled: options?.enabled !== false });
}
