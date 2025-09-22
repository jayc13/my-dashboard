# SDK Examples

This page provides practical examples of using the My Dashboard TypeScript SDK in real-world scenarios.

## Basic Setup

```typescript
import { MyDashboardAPI, APIError, NetworkError } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 3,
  timeout: 30000
});
```

## Example 1: Daily Test Report Summary

Generate a daily summary of test results across all projects.

```typescript
async function generateDailyTestSummary(date: string) {
  try {
    console.log(`📊 Generating test summary for ${date}`);
    
    // Get all E2E reports for the specified date
    const reports = await api.getE2EReports({ date });
    
    if (reports.length === 0) {
      console.log('No test reports found for this date');
      return;
    }
    
    // Calculate summary statistics
    const summary = reports.reduce((acc, report) => {
      acc.totalProjects++;
      acc.totalTests += report.totalTests;
      acc.passedTests += report.passedTests;
      acc.failedTests += report.failedTests;
      acc.skippedTests += report.skippedTests || 0;
      
      if (report.failedTests > 0) {
        acc.projectsWithFailures.push(report.project);
      }
      
      return acc;
    }, {
      totalProjects: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      projectsWithFailures: [] as string[]
    });
    
    // Calculate success rate
    const successRate = ((summary.passedTests / summary.totalTests) * 100).toFixed(2);
    
    console.log('\n📈 Test Summary:');
    console.log(`Projects tested: ${summary.totalProjects}`);
    console.log(`Total tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Skipped: ${summary.skippedTests}`);
    console.log(`Success rate: ${successRate}%`);
    
    // Create notification for failures
    if (summary.failedTests > 0) {
      await api.createNotification({
        title: `Test Failures - ${date}`,
        message: `${summary.failedTests} tests failed across ${summary.projectsWithFailures.length} projects: ${summary.projectsWithFailures.join(', ')}`,
        type: 'error'
      });
      
      console.log('\n🚨 Failure notification created');
    } else {
      await api.createNotification({
        title: `All Tests Passed - ${date}`,
        message: `All ${summary.totalTests} tests passed across ${summary.totalProjects} projects`,
        type: 'success'
      });
      
      console.log('\n✅ Success notification created');
    }
    
  } catch (error) {
    console.error('Failed to generate test summary:', error);
    
    // Create error notification
    await api.createNotification({
      title: 'Test Summary Generation Failed',
      message: `Failed to generate test summary for ${date}: ${error.message}`,
      type: 'error'
    });
  }
}

// Usage
generateDailyTestSummary('2024-01-15');
```

## Example 2: Automated Application Monitoring

Monitor application health and create alerts for issues.

```typescript
async function monitorApplicationHealth() {
  try {
    console.log('🔍 Monitoring application health...');
    
    // Get all applications
    const applications = await api.getApplications();
    
    for (const app of applications) {
      console.log(`\nChecking ${app.name} (${app.code})...`);
      
      // Get recent test results for this application
      const reports = await api.getE2EReports({ 
        limit: 5 // Last 5 reports
      });
      
      const appReports = reports.filter(r => 
        r.project.toLowerCase().includes(app.code.toLowerCase())
      );
      
      if (appReports.length === 0) {
        console.log(`⚠️  No recent test reports for ${app.name}`);
        
        await api.createNotification({
          title: `No Recent Tests - ${app.name}`,
          message: `No test reports found for ${app.name} in recent runs`,
          type: 'warning'
        });
        continue;
      }
      
      // Check for consistent failures
      const recentFailures = appReports.filter(r => r.failedTests > 0);
      
      if (recentFailures.length >= 3) {
        console.log(`🚨 ${app.name} has consistent test failures`);
        
        await api.createNotification({
          title: `Consistent Failures - ${app.name}`,
          message: `${app.name} has failed tests in ${recentFailures.length} of the last ${appReports.length} runs`,
          type: 'error'
        });
      } else if (recentFailures.length > 0) {
        console.log(`⚠️  ${app.name} has some test failures`);
      } else {
        console.log(`✅ ${app.name} is healthy`);
      }
    }
    
  } catch (error) {
    console.error('Application monitoring failed:', error);
  }
}

// Run every hour
setInterval(monitorApplicationHealth, 60 * 60 * 1000);
```

## Example 3: Pull Request Integration

Automatically track pull requests and their test status.

```typescript
async function trackPullRequestTests() {
  try {
    console.log('🔄 Tracking pull request tests...');
    
    // Get all tracked pull requests
    const pullRequests = await api.getPullRequests();
    
    for (const pr of pullRequests) {
      console.log(`\nChecking PR: ${pr.title}`);
      
      // Get detailed PR information from GitHub
      const prDetails = await api.getPullRequestDetails(pr.id);
      
      if (prDetails.merged) {
        console.log(`✅ PR ${pr.title} is merged`);
        continue;
      }
      
      // Check if there are recent test results for this branch
      const reports = await api.getE2EReports({ limit: 10 });
      
      // Look for reports that might be related to this PR
      const branchReports = reports.filter(report => 
        report.branch === prDetails.head.ref ||
        report.commitSha === prDetails.head.sha
      );
      
      if (branchReports.length === 0) {
        console.log(`⚠️  No test results found for PR branch: ${prDetails.head.ref}`);
        
        // Create notification for missing tests
        await api.createNotification({
          title: `Missing Tests - PR ${pr.title}`,
          message: `No test results found for pull request branch: ${prDetails.head.ref}`,
          type: 'warning'
        });
      } else {
        const latestReport = branchReports[0];
        
        if (latestReport.failedTests > 0) {
          console.log(`❌ PR ${pr.title} has failing tests`);
          
          await api.createNotification({
            title: `Failing Tests - PR ${pr.title}`,
            message: `Pull request has ${latestReport.failedTests} failing tests`,
            type: 'error'
          });
        } else {
          console.log(`✅ PR ${pr.title} tests are passing`);
        }
      }
    }
    
  } catch (error) {
    console.error('Pull request tracking failed:', error);
  }
}

// Usage
trackPullRequestTests();
```

## Example 4: Custom Dashboard Data

Create custom dashboard data by combining multiple API endpoints.

```typescript
interface DashboardData {
  summary: {
    totalProjects: number;
    totalApplications: number;
    unreadNotifications: number;
    activePullRequests: number;
  };
  recentActivity: {
    latestReports: any[];
    recentNotifications: any[];
    recentPullRequests: any[];
  };
  healthStatus: string;
}

async function generateDashboardData(): Promise<DashboardData> {
  try {
    console.log('📊 Generating dashboard data...');
    
    // Fetch data from multiple endpoints in parallel
    const [
      reports,
      applications,
      notifications,
      pullRequests,
      health
    ] = await Promise.all([
      api.getE2EReports({ limit: 10 }),
      api.getApplications(),
      api.getNotifications({ limit: 20 }),
      api.getPullRequests(),
      api.health.getHealthStatus()
    ]);
    
    // Filter unread notifications
    const unreadNotifications = notifications.filter(n => !n.read);
    
    // Filter active (non-merged) pull requests
    const activePullRequests = pullRequests.filter(pr => !pr.merged);
    
    // Get unique projects from reports
    const uniqueProjects = new Set(reports.map(r => r.project));
    
    const dashboardData: DashboardData = {
      summary: {
        totalProjects: uniqueProjects.size,
        totalApplications: applications.length,
        unreadNotifications: unreadNotifications.length,
        activePullRequests: activePullRequests.length
      },
      recentActivity: {
        latestReports: reports.slice(0, 5),
        recentNotifications: notifications.slice(0, 5),
        recentPullRequests: pullRequests.slice(0, 5)
      },
      healthStatus: health.status
    };
    
    console.log('Dashboard data generated successfully');
    return dashboardData;
    
  } catch (error) {
    console.error('Failed to generate dashboard data:', error);
    throw error;
  }
}

// Usage in a web application
async function updateDashboard() {
  try {
    const data = await generateDashboardData();
    
    // Update UI with the data
    document.getElementById('total-projects').textContent = data.summary.totalProjects.toString();
    document.getElementById('total-apps').textContent = data.summary.totalApplications.toString();
    document.getElementById('unread-notifications').textContent = data.summary.unreadNotifications.toString();
    document.getElementById('active-prs').textContent = data.summary.activePullRequests.toString();
    
    // Update health status
    const healthElement = document.getElementById('health-status');
    healthElement.textContent = data.healthStatus;
    healthElement.className = data.healthStatus === 'ok' ? 'status-healthy' : 'status-error';
    
  } catch (error) {
    console.error('Dashboard update failed:', error);
    
    // Show error state in UI
    document.getElementById('dashboard-error').style.display = 'block';
  }
}

// Update dashboard every 30 seconds
setInterval(updateDashboard, 30000);
updateDashboard(); // Initial load
```

## Example 5: Batch Operations with Error Handling

Perform batch operations with proper error handling and retry logic.

```typescript
async function batchUpdateApplications(updates: Array<{id: number, changes: any}>) {
  const results = {
    successful: [] as number[],
    failed: [] as {id: number, error: string}[]
  };
  
  console.log(`🔄 Updating ${updates.length} applications...`);
  
  // Process updates with concurrency limit
  const concurrencyLimit = 3;
  const chunks = [];
  
  for (let i = 0; i < updates.length; i += concurrencyLimit) {
    chunks.push(updates.slice(i, i + concurrencyLimit));
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(async (update) => {
      try {
        await api.updateApplication(update.id, update.changes);
        results.successful.push(update.id);
        console.log(`✅ Updated application ${update.id}`);
      } catch (error) {
        const errorMessage = error instanceof APIError ? error.message : 'Unknown error';
        results.failed.push({ id: update.id, error: errorMessage });
        console.error(`❌ Failed to update application ${update.id}: ${errorMessage}`);
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between chunks to avoid rate limiting
    if (chunks.indexOf(chunk) < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Create summary notification
  const successCount = results.successful.length;
  const failureCount = results.failed.length;
  
  await api.createNotification({
    title: 'Batch Application Update Complete',
    message: `Updated ${successCount} applications successfully. ${failureCount} failed.`,
    type: failureCount > 0 ? 'warning' : 'success'
  });
  
  console.log(`\n📊 Batch update complete: ${successCount} successful, ${failureCount} failed`);
  
  return results;
}

// Usage
const updates = [
  { id: 1, changes: { description: 'Updated description 1' } },
  { id: 2, changes: { description: 'Updated description 2' } },
  { id: 3, changes: { description: 'Updated description 3' } }
];

batchUpdateApplications(updates);
```

## Example 6: Real-time Monitoring with WebSockets

While the SDK doesn't include WebSocket support, you can combine it with WebSocket connections for real-time monitoring.

```typescript
// Note: This example assumes you have a WebSocket connection set up
class RealTimeMonitor {
  private api: MyDashboardAPI;
  private ws: WebSocket;
  
  constructor(apiConfig: any, wsUrl: string) {
    this.api = new MyDashboardAPI(apiConfig);
    this.ws = new WebSocket(wsUrl);
    
    this.setupWebSocket();
  }
  
  private setupWebSocket() {
    this.ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'test_completed':
          await this.handleTestCompleted(data.payload);
          break;
        case 'build_failed':
          await this.handleBuildFailed(data.payload);
          break;
        case 'pr_updated':
          await this.handlePRUpdated(data.payload);
          break;
      }
    };
  }
  
  private async handleTestCompleted(payload: any) {
    console.log('🧪 Test completed:', payload.project);
    
    // Get the latest report
    const reports = await this.api.getE2EReports({ 
      limit: 1,
      project: payload.project 
    });
    
    if (reports.length > 0) {
      const report = reports[0];
      
      if (report.failedTests > 0) {
        await this.api.createNotification({
          title: `Test Failures - ${payload.project}`,
          message: `${report.failedTests} tests failed in ${payload.project}`,
          type: 'error'
        });
      }
    }
  }
  
  private async handleBuildFailed(payload: any) {
    console.log('🚨 Build failed:', payload.project);
    
    await this.api.createNotification({
      title: `Build Failed - ${payload.project}`,
      message: `Build failed for ${payload.project}: ${payload.error}`,
      type: 'error'
    });
  }
  
  private async handlePRUpdated(payload: any) {
    console.log('🔄 PR updated:', payload.prId);
    
    // Update PR in our system
    try {
      const prDetails = await this.api.getPullRequestDetails(payload.prId);
      
      if (prDetails.merged) {
        await this.api.createNotification({
          title: 'PR Merged',
          message: `Pull request "${prDetails.title}" has been merged`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to update PR:', error);
    }
  }
}

// Usage
const monitor = new RealTimeMonitor(
  {
    baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
    apiKey: process.env.MY_DASHBOARD_API_KEY!
  },
  'wss://your-websocket-url'
);
```

## Error Handling Patterns

### Retry with Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      if (error instanceof APIError && error.status === 429) {
        // Rate limited - use server's retry-after if available
        const retryAfter = error.data?.retryAfter || baseDelay * Math.pow(2, attempt - 1);
        console.log(`Rate limited. Retrying in ${retryAfter}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
      } else if (error instanceof NetworkError) {
        // Network error - exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Network error. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Other errors - don't retry
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Usage
const reports = await retryWithBackoff(() => api.getE2EReports());
```

## Next Steps

- [Service Reference](./services.md) - Detailed API for each service
- [Advanced Usage](./advanced.md) - Advanced patterns and customization
- [API Documentation](../api/overview.md) - Complete REST API reference
