/**
 * Additional Services
 * 
 * Provides methods for FCM, JIRA, To-Do Lists, and Health Check endpoints.
 */

import { BaseClient } from '../base-client';
import { 
  FCMTokenRequest,
  FCMTokenResponse,
  JiraIssuesResponse,
} from '@my-dashboard/types';

/**
 * Firebase Cloud Messaging service
 */
export class FCMService extends BaseClient {
  /**
   * Register a device token for push notifications
   * @param tokenRequest FCM token registration request
   * @returns Promise resolving to registration response
   */
  public async registerFCMToken(tokenRequest: FCMTokenRequest): Promise<FCMTokenResponse> {
    return this.request<FCMTokenResponse>('/api/fcm/register-token', {
      method: 'POST',
      body: JSON.stringify(tokenRequest),
    });
  }
}

/**
 * JIRA integration service
 */
export class JiraService extends BaseClient {

  /**
   * Get manual QA tasks from JIRA
   * @returns Promise resolving to array of JIRA tickets
   */
  public async getManualQATasks(): Promise<JiraIssuesResponse> {
    return this.request<JiraIssuesResponse>('/api/jira/manual_qa', {
      method: 'GET',
    });
  }

  /**
   * Get my assigned JIRA tickets
   * @returns Promise resolving to array of JIRA tickets
   */
  public async getMyJiraTickets(): Promise<JiraIssuesResponse> {
    return this.request<JiraIssuesResponse>('/api/jira/my_tickets', {
      method: 'GET',
    });
  }
}

/**
 * Health check service
 */
export class HealthService extends BaseClient {
  /**
   * Check API health status
   * @returns Promise resolving to health check response
   */
  public async getHealthStatus(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health', {
      method: 'GET',
      headers: {
        // Health endpoint doesn't require API key
        'x-api-key': '',
      },
    });
  }
}
