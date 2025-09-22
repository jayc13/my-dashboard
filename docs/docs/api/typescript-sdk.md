# TypeScript SDK

The My Dashboard TypeScript SDK provides a comprehensive client library for interacting with the My Dashboard API. It offers type-safe methods for all API endpoints with built-in error handling, retry logic, and authentication.

## Installation

```bash
npm install @my-dashboard/sdk
```

## Quick Start

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 3
});

// Get all E2E reports
const reports = await api.getE2EReports();

// Get applications
const apps = await api.getApplications();

// Create a notification
await api.createNotification({
  title: 'Test Alert',
  message: 'This is a test notification',
  type: 'info'
});
```

## Configuration

The SDK requires a configuration object with the following properties:

```typescript
interface SDKConfig {
  /** Base URL of the My Dashboard API */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom User-Agent header (default: auto-generated) */
  userAgent?: string;
}
```

### Environment Variables

For security, it's recommended to use environment variables:

```bash
# .env file
MY_DASHBOARD_BASE_URL=https://your-dashboard.example.com
MY_DASHBOARD_API_KEY=your-secret-api-key
```

```typescript
const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 3,
  timeout: 30000
});
```

## Architecture

The SDK is organized using a service composition pattern:

- **BaseClient**: Core HTTP functionality with retry logic and error handling
- **MyDashboardAPI**: Main client that composes all services
- **Individual Services**: Specialized services for different API domains

### Service Architecture

```typescript
// Main client with all services
const api = new MyDashboardAPI(config);

// Access individual services
api.e2e.getE2EReports();
api.applications.getApplications();
api.notifications.getNotifications();
api.pullRequests.getPullRequests();
api.auth.validateApiKey();
api.fcm.registerFCMToken();
api.jira.getJiraIssues();
api.todos.getTodos();
api.health.getHealthStatus();
```

## Services Overview

### E2E Service

Handles E2E test reports and manual runs:

```typescript
// Get all E2E reports with filtering
const reports = await api.e2e.getE2EReports({
  date: '2024-01-15',
  limit: 10
});

// Get specific project report
const projectReport = await api.e2e.getProjectReport('my-project', '2024-01-15');

// Get project status
const status = await api.e2e.getProjectStatus('my-project');

// Create manual run
const manualRun = await api.e2e.createE2EManualRun({
  appId: 1,
  environment: 'staging',
  branch: 'main'
});
```

### Applications Service

Manages application CRUD operations:

```typescript
// Get all applications
const apps = await api.applications.getApplications();

// Get application by ID
const app = await api.applications.getApplication(1);

// Get application by code
const appByCode = await api.applications.getApplicationByCode('my-app');

// Create new application
const newApp = await api.applications.createApplication({
  name: 'New App',
  code: 'new-app',
  description: 'A new application'
});

// Update application
const updatedApp = await api.applications.updateApplication(1, {
  name: 'Updated App Name'
});

// Delete application
await api.applications.deleteApplication(1);
```

### Notifications Service

Handles notification management:

```typescript
// Get notifications with filtering
const notifications = await api.notifications.getNotifications({
  limit: 20,
  type: 'error',
  unread_only: true
});

// Create notification
const notification = await api.notifications.createNotification({
  title: 'Build Failed',
  message: 'The build for project X has failed',
  type: 'error'
});

// Mark as read
await api.notifications.markNotificationAsRead(notification.id);

// Delete notification
await api.notifications.deleteNotification(notification.id);
```

### Pull Requests Service

Manages GitHub pull request tracking:

```typescript
// Get all pull requests
const prs = await api.pullRequests.getPullRequests();

// Add new pull request
const newPR = await api.pullRequests.addPullRequest({
  url: 'https://github.com/owner/repo/pull/123',
  title: 'Feature: Add new functionality',
  author: 'developer'
});

// Get PR details from GitHub
const prDetails = await api.pullRequests.getPullRequestDetails('pr-id');

// Delete pull request
await api.pullRequests.deletePullRequest('pr-id');
```

### Authentication Service

Handles API key validation:

```typescript
// Validate specific API key
const validation = await api.auth.validateApiKey('api-key-to-validate');

// Validate current API key
const currentValidation = await api.auth.validateCurrentApiKey();

if (validation.valid) {
  console.log('API key is valid');
} else {
  console.log('API key is invalid:', validation.error);
}
```

## Error Handling

The SDK provides comprehensive error handling with custom error types:

```typescript
import { APIError, NetworkError, ConfigurationError } from '@my-dashboard/sdk';

try {
  const reports = await api.getE2EReports();
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}): ${error.message}`);
    if (error.data) {
      console.error('Error details:', error.data);
    }
  } else if (error instanceof NetworkError) {
    console.error('Network Error:', error.message);
    if (error.originalError) {
      console.error('Original error:', error.originalError);
    }
  } else if (error instanceof ConfigurationError) {
    console.error('Configuration Error:', error.message);
  }
}
```

### Error Types

- **APIError**: HTTP errors from the API (4xx, 5xx status codes)
- **NetworkError**: Network connectivity issues
- **ConfigurationError**: Invalid SDK configuration

## Advanced Usage

### Using Individual Services

For more granular control, you can use individual services:

```typescript
import { E2EService, ApplicationsService } from '@my-dashboard/sdk';

const config = {
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
};

const e2eService = new E2EService(config);
const appsService = new ApplicationsService(config);

const reports = await e2eService.getE2EReports();
const apps = await appsService.getApplications();
```

### Runtime Configuration Updates

```typescript
// Update API key at runtime
api.setApiKey('new-api-key');

// Update base URL
api.setBaseUrl('https://new-api-url.example.com');

// Get current configuration
const currentConfig = api.getConfig();
```

### Custom Request Options

```typescript
// Custom timeout for specific request
const reports = await api.request('/api/e2e_reports', {
  method: 'GET',
  timeout: 60000 // 60 seconds
});
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { 
  ProjectSummary, 
  ApplicationDetails, 
  ClientNotification,
  PullRequest,
  E2EManualRun 
} from '@my-dashboard/sdk';

// All API responses are fully typed
const reports: ProjectSummary[] = await api.getE2EReports();
const apps: ApplicationDetails[] = await api.getApplications();
const notifications: ClientNotification[] = await api.getNotifications();
```

## Examples

### Complete Example

```typescript
import { MyDashboardAPI, APIError } from '@my-dashboard/sdk';

async function main() {
  const api = new MyDashboardAPI({
    baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
    apiKey: process.env.MY_DASHBOARD_API_KEY!,
    retries: 3
  });

  try {
    // Health check
    const health = await api.health.getHealthStatus();
    console.log('API Status:', health.status);

    // Get recent reports
    const reports = await api.getE2EReports({ limit: 5 });
    console.log(`Found ${reports.length} reports`);

    // Create notification for failed tests
    const failedReports = reports.filter(r => r.failedTests > 0);
    if (failedReports.length > 0) {
      await api.createNotification({
        title: 'Test Failures Detected',
        message: `${failedReports.length} projects have failing tests`,
        type: 'warning'
      });
    }

  } catch (error) {
    if (error instanceof APIError) {
      console.error(`API Error: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main().catch(console.error);
```

## Migration Guide

If you're migrating from direct API calls to the SDK:

### Before (Direct API)
```typescript
const response = await fetch('/api/e2e_reports', {
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  }
});
const reports = await response.json();
```

### After (SDK)
```typescript
const reports = await api.getE2EReports();
```

The SDK handles authentication, error handling, retries, and type safety automatically.

## Support

- **GitHub Repository**: [my-dashboard](https://github.com/jayc13/my-dashboard)
- **Package**: [@my-dashboard/sdk](https://www.npmjs.com/package/@my-dashboard/sdk)
- **Issues**: Report bugs and feature requests on GitHub

## Related Documentation

- [API Overview](./overview.md) - Complete API reference
- [Authentication](./authentication.md) - API authentication guide
- [Integration Guide](./integration-guide.md) - Integration examples
