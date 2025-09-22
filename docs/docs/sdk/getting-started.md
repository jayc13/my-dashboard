# Getting Started with the SDK

The My Dashboard TypeScript SDK provides a type-safe, feature-rich client for interacting with the My Dashboard API. This guide will help you get up and running quickly.

## Prerequisites

- Node.js 18+ or 20+
- TypeScript 4.5+ (optional but recommended)
- A My Dashboard API key

## Installation

Install the SDK using your preferred package manager:

```bash
# npm
npm install @my-dashboard/sdk

# yarn
yarn add @my-dashboard/sdk

# pnpm
pnpm add @my-dashboard/sdk
```

## Basic Setup

### 1. Import and Initialize

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'https://your-dashboard.example.com',
  apiKey: 'your-api-key-here'
});
```

### 2. Environment Configuration

For production applications, use environment variables:

```bash
# .env
MY_DASHBOARD_BASE_URL=https://your-dashboard.example.com
MY_DASHBOARD_API_KEY=your-secret-api-key
```

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 3,
  timeout: 30000
});
```

## Your First API Call

Let's start with a simple health check:

```typescript
async function checkHealth() {
  try {
    const health = await api.health.getHealthStatus();
    console.log('API Status:', health.status);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

checkHealth();
```

## Common Use Cases

### 1. Fetching E2E Test Reports

```typescript
async function getTestReports() {
  try {
    // Get all reports
    const allReports = await api.getE2EReports();
    
    // Get reports with filtering
    const recentReports = await api.getE2EReports({
      date: '2024-01-15',
      limit: 10
    });
    
    // Get specific project report
    const projectReport = await api.getProjectReport('my-project');
    
    console.log(`Found ${allReports.length} total reports`);
    console.log(`Found ${recentReports.length} recent reports`);
    
  } catch (error) {
    console.error('Failed to fetch reports:', error);
  }
}
```

### 2. Managing Applications

```typescript
async function manageApplications() {
  try {
    // Get all applications
    const apps = await api.getApplications();
    
    // Create a new application
    const newApp = await api.createApplication({
      name: 'My New App',
      code: 'my-new-app',
      description: 'A sample application'
    });
    
    // Update the application
    const updatedApp = await api.updateApplication(newApp.id, {
      description: 'Updated description'
    });
    
    console.log('Created app:', newApp);
    console.log('Updated app:', updatedApp);
    
  } catch (error) {
    console.error('Application management failed:', error);
  }
}
```

### 3. Working with Notifications

```typescript
async function handleNotifications() {
  try {
    // Get unread notifications
    const unreadNotifications = await api.getNotifications({
      unread_only: true,
      limit: 20
    });
    
    // Create a new notification
    const notification = await api.createNotification({
      title: 'Build Completed',
      message: 'Your build has completed successfully',
      type: 'success'
    });
    
    // Mark notifications as read
    for (const notif of unreadNotifications) {
      await api.markNotificationAsRead(notif.id);
    }
    
    console.log(`Processed ${unreadNotifications.length} notifications`);
    
  } catch (error) {
    console.error('Notification handling failed:', error);
  }
}
```

## Error Handling

The SDK provides structured error handling:

```typescript
import { APIError, NetworkError, ConfigurationError } from '@my-dashboard/sdk';

async function handleErrors() {
  try {
    const reports = await api.getE2EReports();
    return reports;
  } catch (error) {
    if (error instanceof APIError) {
      // API returned an error status
      console.error(`API Error (${error.status}): ${error.message}`);
      
      if (error.status === 401) {
        console.error('Authentication failed - check your API key');
      } else if (error.status === 429) {
        console.error('Rate limited - please retry later');
      }
      
    } else if (error instanceof NetworkError) {
      // Network connectivity issue
      console.error('Network Error:', error.message);
      console.error('Check your internet connection and API URL');
      
    } else if (error instanceof ConfigurationError) {
      // SDK configuration issue
      console.error('Configuration Error:', error.message);
      console.error('Check your SDK configuration');
      
    } else {
      // Unexpected error
      console.error('Unexpected error:', error);
    }
    
    throw error; // Re-throw if needed
  }
}
```

## Configuration Options

The SDK accepts several configuration options:

```typescript
const api = new MyDashboardAPI({
  // Required
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  
  // Optional
  retries: 3,                    // Number of retry attempts (default: 3)
  timeout: 30000,                // Request timeout in ms (default: 30000)
  userAgent: 'MyApp/1.0.0'       // Custom user agent
});
```

### Runtime Configuration Updates

You can update configuration at runtime:

```typescript
// Update API key
api.setApiKey('new-api-key');

// Update base URL
api.setBaseUrl('https://new-api.example.com');

// Get current configuration
const config = api.getConfig();
console.log('Current config:', config);
```

## TypeScript Benefits

The SDK is fully typed, providing excellent IDE support:

```typescript
// Auto-completion and type checking
const reports = await api.getE2EReports(); // reports is ProjectSummary[]

// Type-safe parameters
const filteredReports = await api.getE2EReports({
  date: '2024-01-15',  // string
  limit: 10            // number
});

// Compile-time error checking
const invalidCall = await api.getE2EReports({
  invalidParam: 'value' // TypeScript error!
});
```

## Next Steps

Now that you have the basics, explore more advanced features:

- [Service Reference](./services.md) - Detailed documentation for each service
- [Examples](./examples.md) - Real-world usage examples
- [Advanced Usage](./advanced.md) - Advanced patterns and customization

## Common Issues

### Authentication Errors

```typescript
// Validate your API key
try {
  const validation = await api.validateCurrentApiKey();
  if (!validation.valid) {
    console.error('Invalid API key:', validation.error);
  }
} catch (error) {
  console.error('API key validation failed:', error);
}
```

### Network Issues

```typescript
// Increase timeout for slow networks
const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  timeout: 60000, // 60 seconds
  retries: 5      // More retries
});
```

### Rate Limiting

The SDK automatically handles rate limiting with exponential backoff, but you can also handle it manually:

```typescript
try {
  const reports = await api.getE2EReports();
} catch (error) {
  if (error instanceof APIError && error.status === 429) {
    const retryAfter = error.data?.retryAfter || 60;
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    const reports = await api.getE2EReports();
  }
}
```

## Support

If you encounter issues:

1. Check the [API Documentation](../api/overview.md)
2. Review the [Examples](./examples.md)
3. Open an issue on [GitHub](https://github.com/jayc13/my-dashboard)

Happy coding! 🚀
