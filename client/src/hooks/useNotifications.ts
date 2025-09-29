import { useCallback } from 'react';
import { useSDKData, useSDKMutation } from './useSDKData';
import { useSDK } from '../contexts/useSDK';
import type { 
  Notification,
  NotificationQueryParams,
} from '@my-dashboard/types';

/**
 * Hook for notifications data
 */
export function useNotifications(options?: { enabled?: boolean; refetchInterval?: number }) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<Notification[]> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.notifications.getNotifications();
  }, [api]);

  return useSDKData(fetcher, options);
}

/**
 * Hook for notifications data with query parameters
 */
export function useNotificationsWithParams(params: NotificationQueryParams = {}, options?: { enabled?: boolean; refetchInterval?: number }) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<Notification[]> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.notifications.getNotifications(params);
  }, [api, params]);

  return useSDKData(fetcher, options);
}

/**
 * Hook for marking notification as read
 */
export function useMarkNotificationAsRead() {
  const { api } = useSDK();

  const mutationFn = useCallback(async (id: number): Promise<{ success: boolean }> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.notifications.markNotificationAsRead(id);
  }, [api]);

  return useSDKMutation(mutationFn);
}

/**
 * Hook for deleting notification
 */
export function useDeleteNotification() {
  const { api } = useSDK();

  const mutationFn = useCallback(async (id: number): Promise<{ success: boolean }> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.notifications.deleteNotification(id);
  }, [api]);

  return useSDKMutation(mutationFn);
}
