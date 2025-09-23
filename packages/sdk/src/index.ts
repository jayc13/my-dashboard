/**
 * @my-dashboard/sdk
 * 
 * TypeScript SDK for My Dashboard API - Cypress test results dashboard
 * 
 * This package provides a comprehensive TypeScript SDK for interacting with the My Dashboard API,
 * including methods for E2E test reports, applications, notifications, pull requests, and more.
 * 
 * @example
 * ```typescript
 * import { MyDashboardAPI } from '@my-dashboard/sdk';
 * 
 * const api = new MyDashboardAPI({
 *   baseUrl: 'http://localhost:3000',
 *   apiKey: process.env.MY_DASHBOARD_API_KEY!,
 *   retries: 3
 * });
 * 
 * // Get all E2E reports
 * const reports = await api.getE2EReports();
 * 
 * // Get applications
 * const apps = await api.getApplications();
 * 
 * // Create a notification
 * await api.createNotification({
 *   title: 'Test Alert',
 *   message: 'This is a test notification',
 *   type: 'info'
 * });
 * ```
 */

// Main SDK client
export { MyDashboardAPI } from './client';

// Base client for extending
export { BaseClient } from './base-client';

// Individual services for advanced usage
export { E2EService } from './services/e2e-service';
export { ApplicationsService } from './services/applications-service';
export { NotificationsService } from './services/notifications-service';
export { PullRequestsService } from './services/pull-requests-service';
export { AuthService } from './services/auth-service';
export { 
  FCMService, 
  JiraService, 
  TodosService, 
  HealthService 
} from './services/additional-services';

// Error classes
export { APIError, NetworkError, ConfigurationError } from './errors';

// Default export for convenience
export { MyDashboardAPI as default } from './client';
