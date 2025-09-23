/**
 * Additional Services
 * 
 * Provides methods for FCM, JIRA, To-Do Lists, and Health Check endpoints.
 */

import { BaseClient } from '../base-client';
import { 
  FCMTokenRequest,
  FCMTokenResponse,
  FCMTestNotificationRequest,
  FCMTestNotificationResponse,
  FCMTokensResponse,
  JiraTicket,
  JiraIssuesResponse,
  ToDoItem,
  TodoRequest,
} from '../types';

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

  /**
   * Unregister a device token
   * @param tokenRequest FCM token unregistration request
   * @returns Promise resolving to unregistration response
   */
  public async unregisterFCMToken(tokenRequest: FCMTokenRequest): Promise<FCMTokenResponse> {
    return this.request<FCMTokenResponse>('/api/fcm/unregister-token', {
      method: 'POST',
      body: JSON.stringify(tokenRequest),
    });
  }

  /**
   * Send a test notification to all registered devices
   * @param notification Test notification request
   * @returns Promise resolving to test notification response
   */
  public async sendTestNotification(notification: FCMTestNotificationRequest): Promise<FCMTestNotificationResponse> {
    return this.request<FCMTestNotificationResponse>('/api/fcm/test-notification', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  /**
   * Get all registered FCM tokens (for debugging)
   * @returns Promise resolving to FCM tokens response
   */
  public async getFCMTokens(): Promise<FCMTokensResponse> {
    return this.request<FCMTokensResponse>('/api/fcm/tokens', {
      method: 'GET',
    });
  }
}

/**
 * JIRA integration service
 */
export class JiraService extends BaseClient {
  /**
   * Get JIRA issues using JQL query
   * @param jql JQL (JIRA Query Language) query string
   * @returns Promise resolving to JIRA issues response
   */
  public async getJiraIssues(jql: string): Promise<JiraIssuesResponse> {
    return this.request<JiraIssuesResponse>('/api/jira', {
      method: 'GET',
      params: { jql },
    });
  }

  /**
   * Get manual QA tasks from JIRA
   * @returns Promise resolving to array of JIRA tickets
   */
  public async getManualQATasks(): Promise<JiraTicket[]> {
    return this.request<JiraTicket[]>('/api/jira/manual_qa', {
      method: 'GET',
    });
  }

  /**
   * Get my assigned JIRA tickets
   * @returns Promise resolving to array of JIRA tickets
   */
  public async getMyJiraTickets(): Promise<JiraTicket[]> {
    return this.request<JiraTicket[]>('/api/jira/my_tickets', {
      method: 'GET',
    });
  }
}

/**
 * To-Do Lists service
 */
export class TodosService extends BaseClient {
  /**
   * Get all to-do items
   * @returns Promise resolving to array of to-do items
   */
  public async getTodos(): Promise<ToDoItem[]> {
    return this.request<ToDoItem[]>('/api/to_do_list', {
      method: 'GET',
    });
  }

  /**
   * Get to-do item by ID
   * @param id To-do item ID
   * @returns Promise resolving to to-do item
   */
  public async getTodo(id: number): Promise<ToDoItem> {
    return this.request<ToDoItem>(`/api/to_do_list/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new to-do item
   * @param todo To-do item data
   * @returns Promise resolving to creation response
   */
  public async createTodo(todo: TodoRequest): Promise<ToDoItem> {
    return this.request<ToDoItem>('/api/to_do_list', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  /**
   * Update a to-do item
   * @param id To-do item ID
   * @param updates To-do item updates
   * @returns Promise resolving to updated to-do item
   */
  public async updateTodo(id: number, updates: TodoRequest): Promise<ToDoItem> {
    return this.request<ToDoItem>(`/api/to_do_list/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a to-do item
   * @param id To-do item ID
   * @returns Promise resolving to deletion confirmation
   */
  public async deleteTodo(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/to_do_list/${id}`, {
      method: 'DELETE',
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
