# Service Reference

The My Dashboard SDK is organized into specialized services, each handling a specific domain of the API. This reference provides detailed documentation for each service.

## Service Architecture

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI(config);

// Access services through the main client
api.e2e          // E2E Reports and Manual Runs
api.applications // Application Management
api.notifications // Notification Management
api.pullRequests // Pull Request Tracking
api.auth         // Authentication
api.fcm          // Firebase Cloud Messaging
api.jira         // JIRA Integration
api.todos        // To-Do Management
api.health       // Health Checks
```

## E2E Service

Handles E2E test reports and manual test runs.

### Methods

#### `getE2EReports(options?)`

Get all E2E test reports with optional filtering.

```typescript
const reports = await api.e2e.getE2EReports({
  date: '2024-01-15',      // Filter by date (YYYY-MM-DD)
  reportDate: '2024-01-15', // Alternative date filter
  limit: 10                // Limit results
});
```

**Returns:** `Promise<ProjectSummary[]>`

#### `getProjectReport(projectName, date?)`

Get E2E report for a specific project.

```typescript
const report = await api.e2e.getProjectReport('my-project', '2024-01-15');
```

**Parameters:**
- `projectName` (string): Name of the project
- `date` (string, optional): Date filter in YYYY-MM-DD format

**Returns:** `Promise<ProjectSummary>`

#### `getProjectStatus(projectName)`

Get current status of a project's test runs.

```typescript
const status = await api.e2e.getProjectStatus('my-project');
```

**Returns:** `Promise<ProjectStatus>`

#### `getE2EManualRuns()`

Get all E2E manual runs.

```typescript
const runs = await api.e2e.getE2EManualRuns();
```

**Returns:** `Promise<E2EManualRun[]>`

#### `createE2EManualRun(runData)`

Create and trigger a new E2E manual run.

```typescript
const run = await api.e2e.createE2EManualRun({
  appId: 1,
  environment: 'staging',
  branch: 'main',
  testSuite: 'smoke'
});
```

**Returns:** `Promise<E2EManualRun>`

## Applications Service

Manages application CRUD operations.

### Methods

#### `getApplications()`

Get all applications.

```typescript
const apps = await api.applications.getApplications();
```

**Returns:** `Promise<ApplicationDetails[]>`

#### `getApplication(id)`

Get application by ID.

```typescript
const app = await api.applications.getApplication(1);
```

**Returns:** `Promise<ApplicationDetails>`

#### `getApplicationByCode(code)`

Get application by code.

```typescript
const app = await api.applications.getApplicationByCode('my-app');
```

**Returns:** `Promise<ApplicationDetails>`

#### `createApplication(application)`

Create a new application.

```typescript
const newApp = await api.applications.createApplication({
  name: 'My New App',
  code: 'my-new-app',
  description: 'Application description',
  repository: 'https://github.com/owner/repo'
});
```

**Returns:** `Promise<Application>`

#### `updateApplication(id, updates)`

Update an existing application.

```typescript
const updatedApp = await api.applications.updateApplication(1, {
  name: 'Updated Name',
  description: 'Updated description'
});
```

**Returns:** `Promise<Application>`

#### `deleteApplication(id)`

Delete an application.

```typescript
await api.applications.deleteApplication(1);
```

**Returns:** `Promise<{ success: boolean }>`

## Notifications Service

Handles notification management.

### Methods

#### `getNotifications(options?)`

Get notifications with optional filtering.

```typescript
const notifications = await api.notifications.getNotifications({
  limit: 20,           // Maximum number to return
  type: 'error',       // Filter by type
  unread_only: true    // Only unread notifications
});
```

**Returns:** `Promise<ClientNotification[]>`

#### `createNotification(notification)`

Create a new notification.

```typescript
const notification = await api.notifications.createNotification({
  title: 'Build Failed',
  message: 'The build for project X has failed',
  type: 'error',
  priority: 'high'
});
```

**Returns:** `Promise<ClientNotification>`

#### `markNotificationAsRead(id)`

Mark a notification as read.

```typescript
await api.notifications.markNotificationAsRead(123);
```

**Returns:** `Promise<{ success: boolean }>`

#### `deleteNotification(id)`

Delete a notification.

```typescript
await api.notifications.deleteNotification(123);
```

**Returns:** `Promise<{ success: boolean }>`

## Pull Requests Service

Manages GitHub pull request tracking.

### Methods

#### `getPullRequests()`

Get all tracked pull requests.

```typescript
const prs = await api.pullRequests.getPullRequests();
```

**Returns:** `Promise<PullRequest[]>`

#### `addPullRequest(pullRequest)`

Add a new pull request for tracking.

```typescript
const pr = await api.pullRequests.addPullRequest({
  url: 'https://github.com/owner/repo/pull/123',
  title: 'Feature: Add new functionality',
  author: 'developer',
  branch: 'feature/new-functionality'
});
```

**Returns:** `Promise<PullRequest>`

#### `getPullRequestDetails(id)`

Get detailed information about a pull request from GitHub.

```typescript
const details = await api.pullRequests.getPullRequestDetails('pr-id');
```

**Returns:** `Promise<GithubPullRequestDetails>`

#### `deletePullRequest(id)`

Remove a pull request from tracking.

```typescript
await api.pullRequests.deletePullRequest('pr-id');
```

**Returns:** `Promise<{ success: boolean }>`

## Authentication Service

Handles API key validation.

### Methods

#### `validateApiKey(apiKey)`

Validate a specific API key.

```typescript
const validation = await api.auth.validateApiKey('api-key-to-validate');

if (validation.valid) {
  console.log('API key is valid');
} else {
  console.log('Invalid API key:', validation.error);
}
```

**Returns:** `Promise<AuthValidationResponse>`

#### `validateCurrentApiKey()`

Validate the current API key.

```typescript
const validation = await api.auth.validateCurrentApiKey();
```

**Returns:** `Promise<AuthValidationResponse>`

## FCM Service

Firebase Cloud Messaging for push notifications.

### Methods

#### `registerFCMToken(tokenRequest)`

Register a device token for push notifications.

```typescript
const response = await api.fcm.registerFCMToken({
  token: 'device-fcm-token',
  deviceId: 'unique-device-id',
  platform: 'web'
});
```

**Returns:** `Promise<FCMTokenResponse>`

#### `unregisterFCMToken(tokenRequest)`

Unregister a device token.

```typescript
await api.fcm.unregisterFCMToken({
  token: 'device-fcm-token',
  deviceId: 'unique-device-id'
});
```

**Returns:** `Promise<FCMTokenResponse>`

#### `sendTestNotification(notification)`

Send a test notification to all registered devices.

```typescript
const result = await api.fcm.sendTestNotification({
  title: 'Test Notification',
  body: 'This is a test message',
  data: { key: 'value' }
});
```

**Returns:** `Promise<FCMTestNotificationResponse>`

## JIRA Service

JIRA integration for issue tracking.

### Methods

#### `getJiraIssues(jql)`

Get JIRA issues using JQL query.

```typescript
const issues = await api.jira.getJiraIssues(
  'project = "MY_PROJECT" AND status = "In Progress"'
);
```

**Returns:** `Promise<JiraIssuesResponse>`

#### `getManualQATasks()`

Get manual QA tasks from JIRA.

```typescript
const qaTasks = await api.jira.getManualQATasks();
```

**Returns:** `Promise<JiraTicket[]>`

#### `getMyJiraTickets()`

Get tickets assigned to the current user.

```typescript
const myTickets = await api.jira.getMyJiraTickets();
```

**Returns:** `Promise<JiraTicket[]>`

## Todos Service

To-do list management.

### Methods

#### `getTodos()`

Get all to-do items.

```typescript
const todos = await api.todos.getTodos();
```

**Returns:** `Promise<Todo[]>`

#### `getTodo(id)`

Get a specific to-do item.

```typescript
const todo = await api.todos.getTodo(123);
```

**Returns:** `Promise<Todo>`

#### `createTodo(todo)`

Create a new to-do item.

```typescript
const newTodo = await api.todos.createTodo({
  title: 'Review pull request',
  description: 'Review PR #123 for new feature',
  priority: 'high',
  dueDate: '2024-01-20'
});
```

**Returns:** `Promise<TodoCreateResponse>`

#### `updateTodo(id, updates)`

Update a to-do item.

```typescript
const updatedTodo = await api.todos.updateTodo(123, {
  completed: true,
  completedAt: new Date().toISOString()
});
```

**Returns:** `Promise<Todo>`

#### `deleteTodo(id)`

Delete a to-do item.

```typescript
await api.todos.deleteTodo(123);
```

**Returns:** `Promise<{ success: boolean }>`

## Health Service

API health checks.

### Methods

#### `getHealthStatus()`

Check API health status.

```typescript
const health = await api.health.getHealthStatus();
console.log('API Status:', health.status); // "ok" or "error"
```

**Returns:** `Promise<{ status: string }>`

## Using Individual Services

You can also use services independently:

```typescript
import { E2EService, ApplicationsService } from '@my-dashboard/sdk';

const config = {
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
};

// Use individual services
const e2eService = new E2EService(config);
const appsService = new ApplicationsService(config);

const reports = await e2eService.getE2EReports();
const apps = await appsService.getApplications();
```

## Service Configuration

All services share the same configuration and can be updated at runtime:

```typescript
// Update configuration for all services
api.setApiKey('new-api-key');
api.setBaseUrl('https://new-api.example.com');

// Individual services are automatically updated
const reports = await api.e2e.getE2EReports(); // Uses new configuration
```

## Error Handling

All service methods can throw the same error types:

```typescript
import { APIError, NetworkError } from '@my-dashboard/sdk';

try {
  const reports = await api.e2e.getE2EReports();
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error: ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.error(`Network Error: ${error.message}`);
  }
}
```

## Next Steps

- [Examples](./examples.md) - Real-world usage examples
- [Advanced Usage](./advanced.md) - Advanced patterns and customization
- [API Reference](../api/overview.md) - Complete API documentation
