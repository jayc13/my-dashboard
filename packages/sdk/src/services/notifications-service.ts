/**
 * Notifications Service
 * 
 * Provides methods for managing system notifications and alerts.
 */

import { BaseClient } from '../base-client';
import { 
  NotificationQueryParams,
  Notification,
  CreateNotificationRequest,
} from '../types';

/**
 * Notifications management service
 */
export class NotificationsService extends BaseClient {
  /**
   * Get notifications with optional filtering
   * @param options Query parameters for filtering notifications
   * @returns Promise resolving to array of notifications
   */
  public async getNotifications(options: NotificationQueryParams = {}): Promise<Notification[]> {
    return this.request<Notification[]>('/api/notifications', {
      method: 'GET',
      params: options,
    });
  }

  /**
   * Create a new notification
   * @param notification Notification data
   * @returns Promise resolving to created notification
   */
  public async createNotification(notification: CreateNotificationRequest): Promise<Notification> {
    return this.request<Notification>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Promise resolving to success confirmation
   */
  public async markNotificationAsRead(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  /**
   * Delete a notification
   * @param id Notification ID
   * @returns Promise resolving to deletion confirmation
   */
  public async deleteNotification(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  }
}
