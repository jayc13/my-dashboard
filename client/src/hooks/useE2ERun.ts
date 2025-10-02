import { useCallback, useMemo } from 'react';
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

  // Memoize params using JSON stringification to create a stable reference
  // This prevents infinite re-renders when params object is recreated with same values
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const params = useMemo(() => options?.params, [JSON.stringify(options?.params)]);

  const fetcher = useCallback(async (): Promise<DetailedE2EReport> => {
    if (!api) {
      throw new Error('API not available');
    }

    return api.e2e.getE2EReport(params);
  }, [api, params]);

  return useSDKData(fetcher, options);
}
