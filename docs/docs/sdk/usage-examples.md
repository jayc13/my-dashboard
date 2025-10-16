# SDK Usage Examples

This guide provides practical examples of using the My Dashboard SDK for common tasks.

## Basic Setup

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 3,
  timeout: 30000,
});
```

## E2E Test Reports

### Get All Reports

```typescript
// Get all E2E reports
const reports = await api.getE2EReports();

console.log(`Found ${reports.length} reports`);
reports.forEach(report => {
  console.log(`${report.projectName}: ${report.passedRuns}/${report.totalRuns} passed`);
});
```

### Get Reports with Filters

```typescript
// Get recent reports with limit
const recentReports = await api.getE2EReports({ limit: 10 });

// Get reports for specific project
const projectReports = await api.getE2EReports({ 
  projectName: 'my-project' 
});
```

### Get Single Report

```typescript
// Get report by ID
const report = await api.getE2EReportById(1);

console.log('Report details:', {
  project: report.projectName,
  total: report.totalRuns,
  passed: report.passedRuns,
  failed: report.failedRuns,
  passRate: `${(report.passedRuns / report.totalRuns * 100).toFixed(2)}%`,
});
```

### Create E2E Report

```typescript
// Create new E2E report
const newReport = await api.createE2EReport({
  projectName: 'my-project',
  totalRuns: 100,
  passedRuns: 95,
  failedRuns: 5,
  skippedRuns: 0,
  duration: 3600000, // 1 hour in ms
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
});

console.log('Created report:', newReport.id);
```

### Delete Report

```typescript
// Delete report by ID
await api.deleteE2EReport(1);
console.log('Report deleted');
```

## Applications

### Get All Applications

```typescript
// Get all applications
const apps = await api.getApplications();

apps.forEach(app => {
  console.log(`${app.name} (${app.code})`);
});
```

### Get Single Application

```typescript
// Get application by ID
const app = await api.getApplicationById(1);

console.log('Application:', {
  id: app.id,
  name: app.name,
  code: app.code,
  watching: app.watching,
});
```

### Create Application

```typescript
// Create new application
const newApp = await api.createApplication({
  name: 'My New App',
  code: 'my-new-app',
  watching: true,
});

console.log('Created application:', newApp.id);
```

### Update Application

```typescript
// Update application
const updatedApp = await api.updateApplication(1, {
  name: 'Updated App Name',
  watching: false,
});

console.log('Updated application:', updatedApp);
```

### Delete Application

```typescript
// Delete application
await api.deleteApplication(1);
console.log('Application deleted');
```

## Notifications

### Get Notifications

```typescript
// Get all notifications
const notifications = await api.getNotifications();

// Get with limit
const recent = await api.getNotifications({ limit: 5 });

// Get unread only
const unread = await api.getNotifications({ unread: true });
```

### Create Notification

```typescript
// Create notification
const notification = await api.createNotification({
  title: 'Test Failed',
  message: 'E2E test suite failed with 5 failures',
  type: 'error',
});

console.log('Created notification:', notification.id);
```

### Mark as Read

```typescript
// Mark notification as read
await api.markNotificationAsRead(1);
console.log('Notification marked as read');
```

### Delete Notification

```typescript
// Delete notification
await api.deleteNotification(1);
console.log('Notification deleted');
```

## Pull Requests

### Get Pull Requests

```typescript
// Get all pull requests
const prs = await api.getPullRequests();

prs.forEach(pr => {
  console.log(`PR #${pr.pullRequestNumber}: ${pr.repository}`);
});
```

### Get Single Pull Request

```typescript
// Get PR by ID
const pr = await api.getPullRequestById(1);

console.log('Pull Request:', {
  number: pr.pullRequestNumber,
  repo: pr.repository,
  status: pr.status,
});
```

### Create Pull Request

```typescript
// Create pull request record
const newPR = await api.createPullRequest({
  pullRequestNumber: 123,
  repository: 'myorg/myrepo',
});

console.log('Created PR record:', newPR.id);
```

### Delete Pull Request

```typescript
// Delete PR record
await api.deletePullRequest(1);
console.log('PR record deleted');
```

## Todo List

### Get Todos

```typescript
// Get all todos
const todos = await api.getTodos();

// Get incomplete todos
const incomplete = todos.filter(todo => !todo.completed);

console.log(`${incomplete.length} incomplete todos`);
```

### Create Todo

```typescript
// Create todo
const todo = await api.createTodo({
  title: 'Fix failing tests',
  description: 'Investigate and fix the 5 failing E2E tests',
  completed: false,
});

console.log('Created todo:', todo.id);
```

### Update Todo

```typescript
// Mark todo as complete
const updated = await api.updateTodo(1, {
  completed: true,
});

console.log('Todo completed:', updated);
```

### Delete Todo

```typescript
// Delete todo
await api.deleteTodo(1);
console.log('Todo deleted');
```

## Health Check

### Check API Health

```typescript
// Get health status
const health = await api.health.getHealthStatus();

console.log('API Status:', health.status);
console.log('Timestamp:', health.timestamp);

if (health.status === 'healthy') {
  console.log('✅ API is healthy');
} else {
  console.log('❌ API is unhealthy');
}
```

## Error Handling

### Basic Error Handling

```typescript
import { APIError, NetworkError } from '@my-dashboard/sdk';

try {
  const apps = await api.getApplications();
  console.log(apps);
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}): ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.error(`Network Error: ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Handling Specific Status Codes

```typescript
try {
  const app = await api.getApplicationById(999);
} catch (error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 404:
        console.error('Application not found');
        break;
      case 401:
        console.error('Unauthorized - check API key');
        break;
      case 429:
        console.error('Rate limit exceeded');
        break;
      default:
        console.error(`API error: ${error.message}`);
    }
  }
}
```

### Retry Logic

```typescript
// SDK automatically retries on transient failures
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 5, // Retry up to 5 times
  timeout: 60000, // 60 second timeout
});

// This will automatically retry on network errors or 5xx errors
const apps = await api.getApplications();
```

## Advanced Usage

### Using Individual Services

```typescript
import { E2ERunService, ApplicationsService } from '@my-dashboard/sdk';

const config = {
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
};

const e2eService = new E2ERunService(config);
const appsService = new ApplicationsService(config);

const reports = await e2eService.getE2EReports();
const apps = await appsService.getApplications();
```

### Custom Configuration

```typescript
const api = new MyDashboardAPI({
  baseUrl: 'https://api.mydashboard.com',
  apiKey: 'your-api-key',
  retries: 5,
  timeout: 60000,
  userAgent: 'MyApp/1.0.0',
});

// Update configuration at runtime
api.setApiKey('new-api-key');
api.setBaseUrl('https://new-url.com');
```

### Batch Operations

```typescript
// Create multiple notifications
const notifications = await Promise.all([
  api.createNotification({
    title: 'Test 1',
    message: 'Message 1',
    type: 'info',
  }),
  api.createNotification({
    title: 'Test 2',
    message: 'Message 2',
    type: 'warning',
  }),
  api.createNotification({
    title: 'Test 3',
    message: 'Message 3',
    type: 'error',
  }),
]);

console.log(`Created ${notifications.length} notifications`);
```

### Pagination

```typescript
// Get paginated results
async function getAllReports() {
  const allReports = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const reports = await api.getE2EReports({ 
      limit,
      offset: (page - 1) * limit,
    });

    if (reports.length === 0) break;

    allReports.push(...reports);
    
    if (reports.length < limit) break;
    
    page++;
  }

  return allReports;
}

const allReports = await getAllReports();
console.log(`Total reports: ${allReports.length}`);
```

## Integration Examples

### Cypress Integration

```typescript
// cypress/support/commands.ts
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: Cypress.env('MY_DASHBOARD_BASE_URL'),
  apiKey: Cypress.env('MY_DASHBOARD_API_KEY'),
});

Cypress.Commands.add('reportE2EResults', (results) => {
  return api.createE2EReport({
    projectName: Cypress.config('projectId'),
    totalRuns: results.totalTests,
    passedRuns: results.totalPassed,
    failedRuns: results.totalFailed,
    skippedRuns: results.totalSkipped,
    duration: results.duration,
    startTime: results.startTime,
    endTime: results.endTime,
  });
});

// cypress/e2e/example.cy.ts
describe('My Tests', () => {
  after(() => {
    cy.reportE2EResults({
      totalTests: 10,
      totalPassed: 8,
      totalFailed: 2,
      totalSkipped: 0,
      duration: 30000,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    });
  });

  it('should pass', () => {
    expect(true).to.be.true;
  });
});
```

### GitHub Actions Integration

```typescript
// scripts/report-test-results.ts
import { MyDashboardAPI } from '@my-dashboard/sdk';
import fs from 'fs';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});

async function reportResults() {
  // Read test results
  const results = JSON.parse(
    fs.readFileSync('test-results.json', 'utf-8')
  );

  // Create E2E report
  await api.createE2EReport({
    projectName: process.env.GITHUB_REPOSITORY!,
    totalRuns: results.numTotalTests,
    passedRuns: results.numPassedTests,
    failedRuns: results.numFailedTests,
    skippedRuns: results.numPendingTests,
    duration: results.testResults.reduce(
      (sum, r) => sum + r.perfStats.runtime,
      0
    ),
    startTime: new Date(results.startTime).toISOString(),
    endTime: new Date().toISOString(),
  });

  console.log('✅ Test results reported');
}

reportResults().catch(console.error);
```

### Slack Notifications

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';
import { WebClient } from '@slack/web-api';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});

const slack = new WebClient(process.env.SLACK_TOKEN);

async function notifyOnFailure() {
  const reports = await api.getE2EReports({ limit: 1 });
  const latestReport = reports[0];

  if (latestReport.failedRuns > 0) {
    await slack.chat.postMessage({
      channel: '#test-failures',
      text: `❌ E2E Tests Failed: ${latestReport.failedRuns} failures in ${latestReport.projectName}`,
    });

    await api.createNotification({
      title: 'E2E Tests Failed',
      message: `${latestReport.failedRuns} failures in ${latestReport.projectName}`,
      type: 'error',
    });
  }
}

notifyOnFailure().catch(console.error);
```

## Next Steps

- [Installation](./installation.md) - Install the SDK
- [Authentication](./authentication.md) - Learn about API key authentication
- [API Reference](../api/overview.md) - Explore all available endpoints

