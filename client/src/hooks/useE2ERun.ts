import { useCallback } from 'react';
import { useSDKData } from './useSDKData';
import { useSDK } from '../contexts/useSDK';
import type { DetailedE2EReport, DetailedE2EReportOptions } from '@my-dashboard/types';


interface UseE2ERunReportOptions {
  enabled?: boolean;
  refetchInterval?: number;
  params?: DetailedE2EReportOptions;
}

/**
 * Hook for apps data
 */
export function useE2ERunReport(options?: UseE2ERunReportOptions) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<DetailedE2EReport> => {
    if (!api) {
      throw new Error('API not available');
    }

    return api.e2e.getE2EReport(options?.params);
  }, [api]);

  return useSDKData(fetcher, options);
}
