/**
 * SDK Configuration and Request/Response Types
 * 
 * This module contains all interface definitions related to SDK configuration,
 * request options, and SDK-specific query parameters.
 */

/**
 * SDK Configuration interface
 */
export interface SDKConfig {
  /** Base URL of the My Dashboard API */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum number of retry attempts (default: 3) */
  retries?: number;
  /** Custom user agent string */
  userAgent?: string;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: string;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request timeout override */
  timeout?: number;
}

/**
 * Query parameters for notifications endpoint
 */
export interface NotificationQueryParams extends Record<string, string | number | boolean | undefined> {
  /** Maximum number of notifications to return */
  limit?: number;
  /** Filter by notification type */
  type?: string;
  /** Return only unread notifications */
  unread_only?: boolean;
}

/**
 * Query parameters for E2E reports endpoint
 */
export interface E2EReportsQueryParams extends Record<string, string | number | boolean | undefined> {
  /** Filter by specific date (YYYY-MM-DD format) */
  date?: string;
  /** Filter by report date */
  reportDate?: string;
}

/**
 * Input for creating applications
 */
export interface CreateApplicationRequest {
  name: string;
  code: string;
  pipeline_url?: string;
  e2e_trigger_configuration?: string;
  watching?: boolean;
}

/**
 * Input for updating applications
 */
export interface UpdateApplicationRequest {
  name?: string;
  code?: string;
  pipeline_url?: string;
  e2e_trigger_configuration?: string;
  watching?: boolean;
}

/**
 * Input for creating notifications
 */
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  link?: string;
}

/**
 * Input for adding pull requests
 */
export interface AddPullRequestRequest {
  pull_request_number: number;
  repository: string;
}
