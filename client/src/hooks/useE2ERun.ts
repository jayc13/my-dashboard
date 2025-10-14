import { useCallback, useMemo } from 'react';
import { useSDKData, useSDKMutation, type UseSDKDataOptions } from './useSDKData';
import { useSDK } from '../contexts/useSDK';
import type {
  DetailedE2EReport,
  DetailedE2EReportOptions,
  E2EManualRun,
  E2EReportDetail,
} from '@my-dashboard/types';

interface UseE2ERunReportOptions extends UseSDKDataOptions {
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
  const baseParams = useMemo(() => options?.params, [JSON.stringify(options?.params)]);

  const fetcher = useCallback(async (): Promise<DetailedE2EReport> => {
    if (!api) {
      throw new Error('API not available');
    }

    return api.getE2EReport(baseParams);
  }, [api, baseParams]);

  const result = useSDKData(fetcher, options);

  // Override refetch to accept force parameter
  const refetch = useCallback(
    async (force?: boolean) => {
      if (!api) {
        throw new Error('API not available');
      }

      const params = {
        ...baseParams,
        force,
      };

      // Manually fetch with force parameter
      const data = await api.getE2EReport(params);

      // Trigger the original refetch to update state
      await result.refetch();

      return data;
    },
    [api, baseParams, result],
  );

  return {
    ...result,
    refetch,
  };
}

/**
 * Hook for creating manual runs
 */
export function useTriggerManualRun() {
  const { api } = useSDK();

  const mutationFn = useCallback(
    async (appId: number): Promise<E2EManualRun> => {
      if (!api) {
        throw new Error('API not available');
      }
      return api.triggerManualRun(appId);
    },
    [api],
  );

  return useSDKMutation(mutationFn);
}

/**
 * Hook for creating manual runs
 */
export function useGetAppLastStatus() {
  const { api } = useSDK();

  const mutationFn = useCallback(
    async (data: { summaryId: number; appId: number }): Promise<E2EReportDetail> => {
      if (!api) {
        throw new Error('API not available');
      }
      return api.getAppLastStatus(data.summaryId, data.appId);
    },
    [api],
  );

  return useSDKMutation(mutationFn);
}
