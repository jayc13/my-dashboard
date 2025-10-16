# TypeScript SDK Overview

The My Dashboard SDK (`@my-dashboard/sdk`) is a comprehensive TypeScript client library for interacting with the My Dashboard API. It provides type-safe methods, automatic retry logic, and a clean service-based architecture.

## Features

- ✅ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- ✅ **Service-Based** - Organized by API domain (E2E, Apps, Notifications, etc.)
- ✅ **Retry Logic** - Automatic retry on transient failures
- ✅ **Error Handling** - Structured error responses
- ✅ **Configurable** - Flexible configuration options
- ✅ **Well-Documented** - JSDoc comments for all methods

## Installation

### Using pnpm (Recommended)

```bash
pnpm add @my-dashboard/sdk --registry=https://registry.npmjs.org/
```

### Using npm

```bash
npm install @my-dashboard/sdk --registry=https://registry.npmjs.org/
```

## Quick Start

### Basic Usage

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

// Initialize the client
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 3
});

// Get all applications
const apps = await api.getApplications();
console.log(apps);

// Get E2E test reports
const reports = await api.getE2EReports();
console.log(reports);

// Create a notification
await api.createNotification({
  title: 'Test Alert',
  message: 'This is a test notification',
  type: 'info'
});
```

## Configuration

### SDK Configuration Options

```typescript
interface SDKConfig {
  baseUrl: string;      // API base URL
  apiKey: string;       // API authentication key
  retries?: number;     // Number of retry attempts (default: 3)
  timeout?: number;     // Request timeout in ms (default: 30000)
  userAgent?: string;   // Custom user agent
}
```

### Example Configuration

```typescript
const api = new MyDashboardAPI({
  baseUrl: 'https://api.mydashboard.com',
  apiKey: process.env.API_KEY!,
  retries: 5,
  timeout: 60000,
  userAgent: 'MyApp/1.0.0'
});
```

## Available Services

The SDK is organized into services, each handling a specific domain:

### 1. E2E Service

Manage E2E test reports and runs.

```typescript
// Get E2E report summary
const report = await api.e2e.getE2EReports();

// Get detailed report for specific app
const details = await api.e2e.getE2EReportDetails(summaryId, appId);

// Trigger manual E2E run
await api.e2e.triggerManualRun({
  appId: 1,
  branch: 'main'
});
```

### 2. Applications Service

Manage applications/projects.

```typescript
// List all applications
const apps = await api.applications.getApplications();

// Get specific application
const app = await api.applications.getApplication(1);

// Create application
const newApp = await api.applications.createApplication({
  name: 'My App',
  code: 'my-app',
  watching: true
});

// Update application
await api.applications.updateApplication(1, {
  watching: false
});

// Delete application
await api.applications.deleteApplication(1);
```

### 3. Notifications Service

Manage notifications.

```typescript
// List notifications
const notifications = await api.notifications.getNotifications();

// Get specific notification
const notification = await api.notifications.getNotification(1);

// Create notification
await api.notifications.createNotification({
  title: 'Alert',
  message: 'Something happened',
  type: 'warning'
});

// Mark as read
await api.notifications.markAsRead(1);

// Delete notification
await api.notifications.deleteNotification(1);
```

### 4. Pull Requests Service

Manage pull requests.

```typescript
// List pull requests
const prs = await api.pullRequests.getPullRequests();

// Get specific PR
const pr = await api.pullRequests.getPullRequest(1);

// Create PR record
await api.pullRequests.createPullRequest({
  title: 'Feature: Add new component',
  url: 'https://github.com/user/repo/pull/123',
  status: 'open'
});

// Update PR
await api.pullRequests.updatePullRequest(1, {
  status: 'merged'
});

// Delete PR
await api.pullRequests.deletePullRequest(1);
```

### 5. To-Do Service

Manage to-do items.

```typescript
// List to-dos
const todos = await api.todos.getTodos();

// Get specific to-do
const todo = await api.todos.getTodo(1);

// Create to-do
await api.todos.createTodo({
  title: 'Complete documentation',
  description: 'Write SDK docs',
  dueDate: '2024-01-31T23:59:59.000Z'
});

// Update to-do
await api.todos.updateTodo(1, {
  isCompleted: true
});

// Delete to-do
await api.todos.deleteTodo(1);
```

### 6. JIRA Service

Fetch JIRA tickets.

```typescript
// Get manual QA tickets
const qaTickets = await api.jira.getManualQATickets();

// Get my assigned tickets
const myTickets = await api.jira.getMyTickets();
```

### 7. FCM Service

Manage Firebase Cloud Messaging.

```typescript
// Register device token
await api.fcm.registerToken('device-token-here');
```

### 8. Auth Service

Validate API keys.

```typescript
// Validate a specific API key
const result = await api.auth.validateApiKey('key-to-validate');
console.log(result.valid); // true or false

// Validate current API key
const currentResult = await api.validateCurrentApiKey();
```

### 9. Health Service

Check service health.

```typescript
// Check API health
const health = await api.health.checkHealth();
console.log(health.status); // 'ok'
```

## Using Individual Services

You can also use services independently:

```typescript
import { E2EService, ApplicationsService } from '@my-dashboard/sdk';

const config = {
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!
};

const e2eService = new E2EService(config);
const appsService = new ApplicationsService(config);

const reports = await e2eService.getE2EReports();
const apps = await appsService.getApplications();
```

## Error Handling

The SDK throws structured errors that you can catch and handle:

```typescript
try {
  const app = await api.applications.getApplication(999);
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Application not found');
  } else if (error.response?.status === 401) {
    console.error('Invalid API key');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Retry Logic

The SDK automatically retries failed requests:

```typescript
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
  retries: 5  // Will retry up to 5 times on failure
});
```

Retries are attempted for:
- Network errors
- 5xx server errors
- Timeout errors

Retries are NOT attempted for:
- 4xx client errors (bad request, unauthorized, etc.)
- Successful responses

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { Application, E2EReport, Notification } from '@my-dashboard/types';

// Types are automatically inferred
const apps: Application[] = await api.getApplications();
const report: E2EReport = await api.getE2EReports();

// Type-safe method parameters
await api.createApplication({
  name: 'My App',      // string (required)
  code: 'my-app',      // string (required)
  watching: true       // boolean (optional)
  // TypeScript will error if you add invalid fields
});
```

## Advanced Usage

### Custom Headers

```typescript
// The SDK automatically includes the API key header
// Additional headers can be added by extending the base client
```

### Updating API Key

```typescript
// Update the API key for all services
api.setApiKey('new-api-key');
```

### Timeout Configuration

```typescript
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
  timeout: 60000  // 60 seconds
});
```

## Best Practices

### 1. Environment Variables

Store API keys in environment variables:

```typescript
const api = new MyDashboardAPI({
  baseUrl: process.env.API_BASE_URL!,
  apiKey: process.env.API_KEY!
});
```

### 2. Error Handling

Always handle errors appropriately:

```typescript
try {
  const result = await api.getApplications();
  return result;
} catch (error) {
  console.error('Failed to fetch applications:', error);
  // Handle error appropriately
  throw error;
}
```

### 3. Type Safety

Leverage TypeScript for type safety:

```typescript
import { Application } from '@my-dashboard/types';

async function getApp(id: number): Promise<Application> {
  return await api.applications.getApplication(id);
}
```

### 4. Reuse Client Instance

Create one client instance and reuse it:

```typescript
// ✅ Good - single instance
const api = new MyDashboardAPI(config);
export default api;

// ❌ Bad - creating new instances
function getApps() {
  const api = new MyDashboardAPI(config);
  return api.getApplications();
}
```

## Next Steps

- [Installation Guide](./installation.md) - Detailed installation instructions
- [Authentication](./authentication.md) - SDK authentication setup
- [Usage Examples](./usage-examples.md) - More code examples
- [API Reference](../api/overview.md) - Complete API documentation

