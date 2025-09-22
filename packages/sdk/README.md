# @my-dashboard/sdk

TypeScript SDK for My Dashboard API - A comprehensive client library for interacting with the Cypress test results dashboard.

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

## Services

The SDK is organized into services, each handling a specific domain:

### E2E Service
- `getE2EReports(options?)` - Get all E2E test reports
- `getProjectReport(projectName, date?)` - Get report for specific project
- `getProjectStatus(projectName)` - Get current project status
- `getE2EManualRuns()` - Get manual test runs
- `createE2EManualRun(runData)` - Create and trigger manual run

### Applications Service
- `getApplications()` - Get all applications
- `getApplication(id)` - Get application by ID
- `getApplicationByCode(code)` - Get application by code
- `createApplication(app)` - Create new application
- `updateApplication(id, updates)` - Update application
- `deleteApplication(id)` - Delete application

### Notifications Service
- `getNotifications(options?)` - Get notifications with filtering
- `createNotification(notification)` - Create new notification
- `markNotificationAsRead(id)` - Mark notification as read
- `deleteNotification(id)` - Delete notification

### Pull Requests Service
- `getPullRequests()` - Get all pull requests
- `addPullRequest(pr)` - Add new pull request
- `getPullRequestDetails(id)` - Get GitHub PR details
- `deletePullRequest(id)` - Delete pull request

### Additional Services
- **FCM Service**: Firebase Cloud Messaging for push notifications
- **JIRA Service**: JIRA integration for issue tracking
- **Todos Service**: To-do list management
- **Health Service**: API health checks
- **Auth Service**: API key validation

## Error Handling

The SDK provides comprehensive error handling with custom error types:

```typescript
import { APIError, NetworkError, ConfigurationError } from '@my-dashboard/sdk';

try {
  const reports = await api.getE2EReports();
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.status, error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network Error:', error.message);
  } else if (error instanceof ConfigurationError) {
    console.error('Configuration Error:', error.message);
  }
}
```

## Advanced Usage

### Using Individual Services

```typescript
import { E2EService, ApplicationsService } from '@my-dashboard/sdk';

const e2eService = new E2EService(config);
const appsService = new ApplicationsService(config);

const reports = await e2eService.getE2EReports();
const apps = await appsService.getApplications();
```

### Custom Configuration

```typescript
const api = new MyDashboardAPI({
  baseUrl: 'https://my-dashboard.example.com',
  apiKey: 'your-api-key',
  retries: 5,
  timeout: 60000,
  userAgent: 'MyApp/1.0.0'
});

// Update configuration at runtime
api.setApiKey('new-api-key');
api.setBaseUrl('https://new-url.example.com');
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions for all API responses and request parameters. All types are exported from the main package:

```typescript
import { 
  ProjectSummary, 
  ApplicationDetails, 
  ClientNotification,
  PullRequest 
} from '@my-dashboard/sdk';
```

## License

MIT
