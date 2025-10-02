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
 * Input for adding pull requests
 */
export interface AddPullRequestRequest {
  pullRequestNumber: number;
  repository: string;
}
