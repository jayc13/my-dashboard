# API Integration Guide

This guide provides comprehensive information for integrating with the My Dashboard API, including best practices, error handling, and common integration patterns.

## Quick Start

### 1. Get Your API Key

Contact your system administrator to obtain an API key. The key will be used to authenticate all API requests.

### 2. Test Your Connection

Start by testing the health endpoint and validating your API key:

```bash
# Test health endpoint (no auth required)
curl "http://localhost:3000/health"

# Validate your API key
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"apiKey": "YOUR_API_KEY"}' \
     "http://localhost:3000/api/auth/validate"

# Test a protected endpoint
curl -H "x-api-key: YOUR_API_KEY" \
     "http://localhost:3000/api/apps"
```

### 3. Choose Your Integration Approach

Select the integration method that best fits your needs:
- **REST API**: Direct HTTP requests for maximum flexibility
- **SDK/Wrapper**: Custom client library for your language
- **Webhook Integration**: Real-time notifications (if available)

## Authentication Best Practices

### Secure API Key Management

**✅ Do:**
```javascript
// Use environment variables
const apiKey = process.env.MY_DASHBOARD_API_KEY;

// Use secure configuration management
const config = {
  apiKey: process.env.MY_DASHBOARD_API_KEY,
  baseUrl: process.env.MY_DASHBOARD_BASE_URL || 'http://localhost:3000'
};
```

**❌ Don't:**
```javascript
// Never hardcode API keys
const apiKey = "abc123-secret-key"; // DON'T DO THIS

// Never commit keys to version control
// Never log API keys
console.log(`Using API key: ${apiKey}`); // DON'T DO THIS
```

### Request Headers

Always include the required headers:

```javascript
const headers = {
  'x-api-key': apiKey,
  'Content-Type': 'application/json',
  'User-Agent': 'MyApp/1.0.0' // Optional but recommended
};
```

## Error Handling Patterns

### Comprehensive Error Handler

```javascript
class APIError extends Error {
  constructor(status, message, response = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // Handle different status codes
    if (response.status === 401) {
      throw new APIError(401, 'Invalid API key - check your credentials');
    }
    
    if (response.status === 403) {
      throw new APIError(403, 'Access forbidden - insufficient permissions');
    }
    
    if (response.status === 404) {
      throw new APIError(404, 'Resource not found');
    }
    
    if (response.status === 429) {
      const data = await response.json().catch(() => ({}));
      const retryAfter = data.retryAfter || 60;
      throw new APIError(429, `Rate limited - retry after ${retryAfter} seconds`, data);
    }
    
    if (response.status >= 500) {
      throw new APIError(response.status, 'Server error - please try again later');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, errorData.error || 'Unknown error');
    }
    
    return await response.json();
    
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    throw new APIError(0, `Network error: ${error.message}`);
  }
}
```

### Retry Logic with Exponential Backoff

```javascript
async function apiRequestWithRetry(endpoint, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication or client errors
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const baseDelay = 1000; // 1 second
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
      
      console.log(`API request failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(delay + jitter)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  
  throw lastError;
}
```

## Client SDK Examples

### JavaScript/TypeScript SDK

```typescript
interface APIConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
}

class MyDashboardAPI {
  private config: APIConfig;
  
  constructor(config: APIConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config
    };
  }
  
  // E2E Reports
  async getE2EReports(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/api/e2e_reports${params}`);
  }
  
  async getProjectReport(projectName: string, date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/api/e2e_reports/report/${projectName}${params}`);
  }
  
  // Applications
  async getApplications() {
    return this.request('/api/apps');
  }
  
  async getApplication(id: number) {
    return this.request(`/api/apps/${id}`);
  }
  
  async createApplication(app: CreateApplicationRequest) {
    return this.request('/api/apps', {
      method: 'POST',
      body: JSON.stringify(app)
    });
  }
  
  // Notifications
  async getNotifications(options: { limit?: number; type?: string; unreadOnly?: boolean } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.type) params.set('type', options.type);
    if (options.unreadOnly) params.set('unread_only', 'true');
    
    const query = params.toString();
    return this.request(`/api/notifications${query ? `?${query}` : ''}`);
  }
  
  async createNotification(notification: CreateNotificationRequest) {
    return this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  }
  
  // Internal helper
  private async request(endpoint: string, options: RequestInit = {}) {
    return apiRequestWithRetry(endpoint, {
      ...options,
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }, this.config.retries);
  }
}

// Usage
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 3
});

// Get all E2E reports
const reports = await api.getE2EReports();

// Get specific project report
const projectReport = await api.getProjectReport('my-web-app', '2025-09-20');

// Create a notification
await api.createNotification({
  title: 'Test Alert',
  message: 'This is a test notification',
  type: 'info'
});
```

### Python SDK

```python
import requests
import time
import logging
from typing import Optional, Dict, List, Any
from urllib.parse import urljoin, urlencode

class APIError(Exception):
    def __init__(self, status_code: int, message: str, response_data: Optional[Dict] = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data or {}

class MyDashboardAPI:
    def __init__(self, base_url: str, api_key: str, timeout: int = 30, max_retries: int = 3):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({
            'x-api-key': api_key,
            'Content-Type': 'application/json',
            'User-Agent': 'MyDashboardAPI-Python/1.0.0'
        })
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Any:
        """Make HTTP request with retry logic."""
        url = urljoin(self.base_url, endpoint)
        
        for attempt in range(1, self.max_retries + 1):
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    timeout=self.timeout,
                    **kwargs
                )
                
                # Handle different status codes
                if response.status_code == 401:
                    raise APIError(401, "Invalid API key")
                elif response.status_code == 403:
                    raise APIError(403, "Access forbidden")
                elif response.status_code == 404:
                    raise APIError(404, "Resource not found")
                elif response.status_code == 429:
                    data = response.json() if response.content else {}
                    retry_after = data.get('retryAfter', 60)
                    raise APIError(429, f"Rate limited - retry after {retry_after} seconds", data)
                elif response.status_code >= 500:
                    raise APIError(response.status_code, "Server error")
                elif not response.ok:
                    error_data = response.json() if response.content else {}
                    raise APIError(response.status_code, error_data.get('error', 'Unknown error'))
                
                return response.json() if response.content else None
                
            except APIError as e:
                # Don't retry on client errors (except rate limiting)
                if 400 <= e.status_code < 500 and e.status_code != 429:
                    raise
                
                if attempt == self.max_retries:
                    raise
                
                # Exponential backoff with jitter
                delay = (2 ** (attempt - 1)) + (time.time() % 1)
                logging.warning(f"Request failed (attempt {attempt}/{self.max_retries}), retrying in {delay:.1f}s...")
                time.sleep(delay)
                
            except requests.RequestException as e:
                if attempt == self.max_retries:
                    raise APIError(0, f"Network error: {str(e)}")
                
                delay = (2 ** (attempt - 1)) + (time.time() % 1)
                logging.warning(f"Network error (attempt {attempt}/{self.max_retries}), retrying in {delay:.1f}s...")
                time.sleep(delay)
    
    # E2E Reports
    def get_e2e_reports(self, date: Optional[str] = None) -> List[Dict]:
        """Get all E2E reports."""
        params = {'date': date} if date else {}
        return self._request('GET', '/api/e2e_reports', params=params)
    
    def get_project_report(self, project_name: str, date: Optional[str] = None) -> Dict:
        """Get E2E report for specific project."""
        params = {'date': date} if date else {}
        return self._request('GET', f'/api/e2e_reports/report/{project_name}', params=params)
    
    def get_project_status(self, project_name: str) -> Dict:
        """Get current project status."""
        return self._request('GET', f'/api/e2e_reports/project_status/{project_name}')
    
    # Applications
    def get_applications(self) -> List[Dict]:
        """Get all applications."""
        return self._request('GET', '/api/apps')
    
    def get_application(self, app_id: int) -> Dict:
        """Get application by ID."""
        return self._request('GET', f'/api/apps/{app_id}')
    
    def create_application(self, app_data: Dict) -> Dict:
        """Create new application."""
        return self._request('POST', '/api/apps', json=app_data)
    
    # Notifications
    def get_notifications(self, limit: Optional[int] = None, 
                         notification_type: Optional[str] = None,
                         unread_only: bool = False) -> List[Dict]:
        """Get notifications with optional filtering."""
        params = {}
        if limit:
            params['limit'] = limit
        if notification_type:
            params['type'] = notification_type
        if unread_only:
            params['unread_only'] = 'true'
        
        return self._request('GET', '/api/notifications', params=params)
    
    def create_notification(self, notification_data: Dict) -> Dict:
        """Create new notification."""
        return self._request('POST', '/api/notifications', json=notification_data)

# Usage example
if __name__ == "__main__":
    import os
    
    api = MyDashboardAPI(
        base_url=os.getenv('MY_DASHBOARD_BASE_URL', 'http://localhost:3000'),
        api_key=os.getenv('MY_DASHBOARD_API_KEY'),
        max_retries=3
    )
    
    try:
        # Get all E2E reports
        reports = api.get_e2e_reports()
        print(f"Found {len(reports)} E2E reports")
        
        # Get applications
        apps = api.get_applications()
        print(f"Found {len(apps)} applications")
        
        # Create a test notification
        notification = api.create_notification({
            'title': 'Test Notification',
            'message': 'This is a test from Python SDK',
            'type': 'info'
        })
        print(f"Created notification with ID: {notification['id']}")
        
    except APIError as e:
        print(f"API Error: {e} (Status: {e.status_code})")
    except Exception as e:
        print(f"Unexpected error: {e}")
```

## Common Integration Patterns

### 1. Monitoring Dashboard

```javascript
class DashboardMonitor {
  constructor(api) {
    this.api = api;
    this.refreshInterval = 30000; // 30 seconds
    this.isRunning = false;
  }
  
  async start() {
    this.isRunning = true;
    console.log('Starting dashboard monitor...');
    
    while (this.isRunning) {
      try {
        await this.updateDashboard();
        await this.sleep(this.refreshInterval);
      } catch (error) {
        console.error('Monitor error:', error.message);
        await this.sleep(5000); // Wait 5 seconds on error
      }
    }
  }
  
  async updateDashboard() {
    // Get latest E2E reports
    const reports = await this.api.getE2EReports();
    
    // Check for failures
    const failures = reports.filter(r => r.lastRunStatus === 'failed');
    
    if (failures.length > 0) {
      console.log(`⚠️  ${failures.length} projects have failed tests`);
      failures.forEach(f => {
        console.log(`   - ${f.projectName}: ${f.successRate}% success rate`);
      });
    } else {
      console.log('✅ All projects are passing');
    }
    
    // Update UI or send alerts as needed
    this.updateUI(reports);
  }
  
  stop() {
    this.isRunning = false;
    console.log('Stopping dashboard monitor...');
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  updateUI(reports) {
    // Update your UI with the latest data
    // This could be a web dashboard, CLI output, etc.
  }
}
```

### 2. Automated Alerting

```javascript
class AlertManager {
  constructor(api, alertConfig) {
    this.api = api;
    this.config = alertConfig;
    this.lastAlertTime = new Map();
  }
  
  async checkAndAlert() {
    const reports = await this.api.getE2EReports();
    
    for (const report of reports) {
      await this.checkProjectHealth(report);
    }
  }
  
  async checkProjectHealth(report) {
    const alerts = [];
    
    // Check success rate
    if (report.successRate < this.config.minSuccessRate) {
      alerts.push({
        type: 'low_success_rate',
        message: `${report.projectName} success rate is ${report.successRate}% (threshold: ${this.config.minSuccessRate}%)`
      });
    }
    
    // Check for failures
    if (report.lastRunStatus === 'failed') {
      alerts.push({
        type: 'test_failure',
        message: `${report.projectName} latest test run failed`
      });
    }
    
    // Send alerts (with rate limiting)
    for (const alert of alerts) {
      await this.sendAlert(report.projectName, alert);
    }
  }
  
  async sendAlert(projectName, alert) {
    const alertKey = `${projectName}:${alert.type}`;
    const lastAlert = this.lastAlertTime.get(alertKey);
    const now = Date.now();
    
    // Rate limit: don't send same alert more than once per hour
    if (lastAlert && (now - lastAlert) < 3600000) {
      return;
    }
    
    // Create notification
    await this.api.createNotification({
      title: `Alert: ${projectName}`,
      message: alert.message,
      type: 'error',
      link: `/projects/${projectName}`
    });
    
    this.lastAlertTime.set(alertKey, now);
    console.log(`🚨 Alert sent for ${projectName}: ${alert.message}`);
  }
}
```

### 3. Data Synchronization

```javascript
class DataSynchronizer {
  constructor(api, externalSources) {
    this.api = api;
    this.sources = externalSources;
  }
  
  async syncAll() {
    console.log('Starting data synchronization...');
    
    try {
      await Promise.all([
        this.syncApplications(),
        this.syncPullRequests(),
        this.syncNotifications()
      ]);
      
      console.log('✅ Data synchronization completed');
    } catch (error) {
      console.error('❌ Synchronization failed:', error.message);
      throw error;
    }
  }
  
  async syncApplications() {
    // Get applications from external source
    const externalApps = await this.sources.getApplications();
    const currentApps = await this.api.getApplications();
    
    // Find new applications
    const newApps = externalApps.filter(extApp => 
      !currentApps.some(app => app.code === extApp.code)
    );
    
    // Create new applications
    for (const app of newApps) {
      await this.api.createApplication(app);
      console.log(`➕ Added application: ${app.name}`);
    }
  }
  
  async syncPullRequests() {
    // Similar logic for pull requests
    // ...
  }
  
  async syncNotifications() {
    // Sync notifications from external systems
    // ...
  }
}
```

## Performance Optimization

### 1. Request Batching

```javascript
class BatchRequestManager {
  constructor(api, batchSize = 10, delay = 100) {
    this.api = api;
    this.batchSize = batchSize;
    this.delay = delay;
  }
  
  async batchProcess(items, processor) {
    const results = [];
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(processor);
      const batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults);
      
      // Add delay between batches to avoid rate limiting
      if (i + this.batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    return results;
  }
}
```

### 2. Response Caching

```javascript
class CachedAPIClient {
  constructor(api, cacheTTL = 300000) { // 5 minutes default
    this.api = api;
    this.cache = new Map();
    this.cacheTTL = cacheTTL;
  }
  
  async get(endpoint, options = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.data;
    }
    
    const data = await this.api.request(endpoint, options);
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

## Testing Your Integration

### Unit Tests

```javascript
// Mock API for testing
class MockAPI {
  constructor(responses = {}) {
    this.responses = responses;
    this.calls = [];
  }
  
  async request(endpoint, options = {}) {
    this.calls.push({ endpoint, options });
    
    const response = this.responses[endpoint];
    if (!response) {
      throw new APIError(404, 'Not found');
    }
    
    return response;
  }
}

// Test example
describe('DashboardMonitor', () => {
  it('should detect failed projects', async () => {
    const mockAPI = new MockAPI({
      '/api/e2e_reports': [
        { projectName: 'app1', lastRunStatus: 'passed', successRate: 95 },
        { projectName: 'app2', lastRunStatus: 'failed', successRate: 60 }
      ]
    });
    
    const monitor = new DashboardMonitor(mockAPI);
    const alerts = await monitor.checkForFailures();
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].projectName).toBe('app2');
  });
});
```

### Integration Tests

```javascript
describe('API Integration', () => {
  let api;
  
  beforeAll(() => {
    api = new MyDashboardAPI({
      baseUrl: process.env.TEST_API_URL,
      apiKey: process.env.TEST_API_KEY
    });
  });
  
  it('should authenticate successfully', async () => {
    const apps = await api.getApplications();
    expect(Array.isArray(apps)).toBe(true);
  });
  
  it('should handle rate limiting gracefully', async () => {
    // Make many requests quickly to trigger rate limiting
    const promises = Array(20).fill().map(() => api.getApplications());
    
    // Should not throw errors due to retry logic
    const results = await Promise.allSettled(promises);
    const failures = results.filter(r => r.status === 'rejected');
    
    expect(failures.length).toBe(0);
  });
});
```

This integration guide provides a solid foundation for building robust integrations with the My Dashboard API. Remember to always handle errors gracefully, implement proper retry logic, and follow security best practices.
