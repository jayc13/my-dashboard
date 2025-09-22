# Advanced Usage

This guide covers advanced patterns, customization options, and best practices for using the My Dashboard TypeScript SDK.

## Custom HTTP Client

You can extend the `BaseClient` to create custom HTTP clients with additional functionality.

```typescript
import { BaseClient, SDKConfig, RequestOptions } from '@my-dashboard/sdk';

class CustomClient extends BaseClient {
  private requestCount = 0;
  
  constructor(config: SDKConfig) {
    super(config);
  }
  
  // Override request method to add custom logic
  protected async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    this.requestCount++;
    console.log(`Request #${this.requestCount}: ${options.method || 'GET'} ${url}`);
    
    // Add custom headers
    const customOptions = {
      ...options,
      headers: {
        'X-Request-ID': `req-${this.requestCount}`,
        'X-Client-Version': '1.0.0',
        ...options.headers
      }
    };
    
    // Call parent request method
    const startTime = Date.now();
    try {
      const result = await super.request<T>(url, customOptions);
      const duration = Date.now() - startTime;
      console.log(`Request completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Request failed after ${duration}ms:`, error);
      throw error;
    }
  }
  
  // Add custom methods
  public getRequestCount(): number {
    return this.requestCount;
  }
  
  public resetRequestCount(): void {
    this.requestCount = 0;
  }
}

// Usage
const customClient = new CustomClient({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!
});
```

## Request Interceptors

Implement request and response interceptors for logging, authentication, or data transformation.

```typescript
import { MyDashboardAPI, RequestOptions } from '@my-dashboard/sdk';

class InterceptedAPI extends MyDashboardAPI {
  private requestInterceptors: Array<(url: string, options: RequestOptions) => RequestOptions> = [];
  private responseInterceptors: Array<(response: any) => any> = [];
  
  // Add request interceptor
  public addRequestInterceptor(interceptor: (url: string, options: RequestOptions) => RequestOptions) {
    this.requestInterceptors.push(interceptor);
  }
  
  // Add response interceptor
  public addResponseInterceptor(interceptor: (response: any) => any) {
    this.responseInterceptors.push(interceptor);
  }
  
  // Override request method
  protected async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    // Apply request interceptors
    let modifiedOptions = options;
    for (const interceptor of this.requestInterceptors) {
      modifiedOptions = interceptor(url, modifiedOptions);
    }
    
    // Make request
    let response = await super.request<T>(url, modifiedOptions);
    
    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = interceptor(response);
    }
    
    return response;
  }
}

// Usage
const api = new InterceptedAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!
});

// Add logging interceptor
api.addRequestInterceptor((url, options) => {
  console.log(`🚀 ${options.method || 'GET'} ${url}`);
  return options;
});

// Add response transformation interceptor
api.addResponseInterceptor((response) => {
  if (Array.isArray(response)) {
    console.log(`📦 Received ${response.length} items`);
  }
  return response;
});
```

## Connection Pooling and Caching

Implement caching and connection pooling for better performance.

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CachedAPI extends MyDashboardAPI {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  
  // Override request method to add caching
  protected async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method || 'GET';
    
    // Only cache GET requests
    if (method === 'GET') {
      const cacheKey = this.getCacheKey(url, options);
      const cached = this.getFromCache<T>(cacheKey);
      
      if (cached) {
        console.log(`📋 Cache hit for ${url}`);
        return cached;
      }
    }
    
    // Make request
    const response = await super.request<T>(url, options);
    
    // Cache GET responses
    if (method === 'GET') {
      const cacheKey = this.getCacheKey(url, options);
      this.setCache(cacheKey, response, this.defaultTTL);
      console.log(`💾 Cached response for ${url}`);
    }
    
    return response;
  }
  
  private getCacheKey(url: string, options: RequestOptions): string {
    const params = options.params ? JSON.stringify(options.params) : '';
    return `${url}:${params}`;
  }
  
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  // Public cache management methods
  public clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
  
  public setCacheTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
  
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Usage
const cachedAPI = new CachedAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!
});

// Set cache TTL to 10 minutes
cachedAPI.setCacheTTL(10 * 60 * 1000);

// First call - hits API
const reports1 = await cachedAPI.getE2EReports();

// Second call - hits cache
const reports2 = await cachedAPI.getE2EReports();

// Check cache stats
console.log('Cache stats:', cachedAPI.getCacheStats());
```

## Rate Limiting and Throttling

Implement client-side rate limiting to avoid hitting API limits.

```typescript
import { MyDashboardAPI, RequestOptions } from '@my-dashboard/sdk';

class ThrottledAPI extends MyDashboardAPI {
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private requestsPerSecond: number;
  private lastRequestTime = 0;
  
  constructor(config: any, requestsPerSecond = 10) {
    super(config);
    this.requestsPerSecond = requestsPerSecond;
  }
  
  protected async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await super.request<T>(url, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minInterval = 1000 / this.requestsPerSecond;
      
      if (timeSinceLastRequest < minInterval) {
        const delay = minInterval - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const request = this.requestQueue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }
    
    this.isProcessing = false;
  }
  
  public getQueueLength(): number {
    return this.requestQueue.length;
  }
  
  public setRateLimit(requestsPerSecond: number): void {
    this.requestsPerSecond = requestsPerSecond;
  }
}

// Usage
const throttledAPI = new ThrottledAPI(
  {
    baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
    apiKey: process.env.MY_DASHBOARD_API_KEY!
  },
  5 // 5 requests per second
);

// These requests will be automatically throttled
const promises = [
  throttledAPI.getE2EReports(),
  throttledAPI.getApplications(),
  throttledAPI.getNotifications(),
  throttledAPI.getPullRequests()
];

const results = await Promise.all(promises);
```

## Custom Error Handling

Implement custom error handling strategies.

```typescript
import { MyDashboardAPI, APIError, NetworkError } from '@my-dashboard/sdk';

class ResilientAPI extends MyDashboardAPI {
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private failureThreshold = 5;
  private recoveryTimeout = 60000; // 1 minute
  
  protected async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    // Check circuit breaker
    if (this.circuitBreakerState === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.circuitBreakerState = 'half-open';
        console.log('🔄 Circuit breaker: half-open');
      } else {
        throw new Error('Circuit breaker is open - service unavailable');
      }
    }
    
    try {
      const result = await super.request<T>(url, options);
      
      // Reset circuit breaker on success
      if (this.circuitBreakerState === 'half-open') {
        this.circuitBreakerState = 'closed';
        this.failureCount = 0;
        console.log('✅ Circuit breaker: closed');
      }
      
      return result;
      
    } catch (error) {
      this.handleFailure(error);
      throw error;
    }
  }
  
  private handleFailure(error: any): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.circuitBreakerState = 'open';
      console.log('🚨 Circuit breaker: open');
    }
    
    // Log different error types
    if (error instanceof APIError) {
      console.error(`API Error (${error.status}): ${error.message}`);
      
      if (error.status >= 500) {
        console.error('Server error detected - may affect circuit breaker');
      }
    } else if (error instanceof NetworkError) {
      console.error('Network error detected - may affect circuit breaker');
    }
  }
  
  public getCircuitBreakerState(): string {
    return this.circuitBreakerState;
  }
  
  public resetCircuitBreaker(): void {
    this.circuitBreakerState = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = 0;
    console.log('🔄 Circuit breaker manually reset');
  }
}

// Usage
const resilientAPI = new ResilientAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!
});

// Monitor circuit breaker state
setInterval(() => {
  console.log('Circuit breaker state:', resilientAPI.getCircuitBreakerState());
}, 10000);
```

## Batch Operations

Implement efficient batch operations with concurrency control.

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

class BatchAPI extends MyDashboardAPI {
  
  async batchOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    options: {
      concurrency?: number;
      batchSize?: number;
      delayBetweenBatches?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<Array<{ item: T; result?: R; error?: Error }>> {
    const {
      concurrency = 3,
      batchSize = 10,
      delayBetweenBatches = 1000,
      onProgress
    } = options;
    
    const results: Array<{ item: T; result?: R; error?: Error }> = [];
    
    // Split items into batches
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    console.log(`🔄 Processing ${items.length} items in ${batches.length} batches`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      // Process batch with concurrency limit
      const batchPromises = this.limitConcurrency(
        batch.map(item => () => this.executeWithErrorHandling(item, operation)),
        concurrency
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Report progress
      if (onProgress) {
        onProgress(results.length, items.length);
      }
      
      // Delay between batches (except for the last batch)
      if (batchIndex < batches.length - 1 && delayBetweenBatches > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    const successful = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;
    
    console.log(`✅ Batch operation complete: ${successful} successful, ${failed} failed`);
    
    return results;
  }
  
  private async limitConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    limit: number
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];
    
    for (const task of tasks) {
      const promise = task().then(result => {
        results.push(result);
      });
      
      executing.push(promise);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }
    
    await Promise.all(executing);
    return results;
  }
  
  private async executeWithErrorHandling<T, R>(
    item: T,
    operation: (item: T) => Promise<R>
  ): Promise<{ item: T; result?: R; error?: Error }> {
    try {
      const result = await operation(item);
      return { item, result };
    } catch (error) {
      return { item, error: error as Error };
    }
  }
}

// Usage
const batchAPI = new BatchAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!
});

// Batch update applications
const applicationUpdates = [
  { id: 1, changes: { description: 'Updated 1' } },
  { id: 2, changes: { description: 'Updated 2' } },
  { id: 3, changes: { description: 'Updated 3' } }
];

const results = await batchAPI.batchOperation(
  applicationUpdates,
  async (update) => {
    return await batchAPI.updateApplication(update.id, update.changes);
  },
  {
    concurrency: 2,
    batchSize: 5,
    delayBetweenBatches: 2000,
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total} (${Math.round(completed/total*100)}%)`);
    }
  }
);

// Process results
const successful = results.filter(r => !r.error);
const failed = results.filter(r => r.error);

console.log(`Successful updates: ${successful.length}`);
console.log(`Failed updates: ${failed.length}`);

if (failed.length > 0) {
  console.log('Failed items:', failed.map(f => ({ item: f.item, error: f.error?.message })));
}
```

## Plugin System

Create a plugin system for extending SDK functionality.

```typescript
interface Plugin {
  name: string;
  beforeRequest?(url: string, options: RequestOptions): RequestOptions;
  afterRequest?(response: any, url: string, options: RequestOptions): any;
  onError?(error: Error, url: string, options: RequestOptions): void;
}

class PluggableAPI extends MyDashboardAPI {
  private plugins: Plugin[] = [];
  
  public addPlugin(plugin: Plugin): void {
    this.plugins.push(plugin);
    console.log(`🔌 Plugin "${plugin.name}" added`);
  }
  
  public removePlugin(name: string): void {
    const index = this.plugins.findIndex(p => p.name === name);
    if (index !== -1) {
      this.plugins.splice(index, 1);
      console.log(`🔌 Plugin "${name}" removed`);
    }
  }
  
  protected async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    let modifiedOptions = options;
    
    // Apply beforeRequest hooks
    for (const plugin of this.plugins) {
      if (plugin.beforeRequest) {
        modifiedOptions = plugin.beforeRequest(url, modifiedOptions);
      }
    }
    
    try {
      let response = await super.request<T>(url, modifiedOptions);
      
      // Apply afterRequest hooks
      for (const plugin of this.plugins) {
        if (plugin.afterRequest) {
          response = plugin.afterRequest(response, url, modifiedOptions);
        }
      }
      
      return response;
      
    } catch (error) {
      // Apply onError hooks
      for (const plugin of this.plugins) {
        if (plugin.onError) {
          plugin.onError(error as Error, url, modifiedOptions);
        }
      }
      
      throw error;
    }
  }
}

// Example plugins
const loggingPlugin: Plugin = {
  name: 'logging',
  beforeRequest: (url, options) => {
    console.log(`📤 ${options.method || 'GET'} ${url}`);
    return options;
  },
  afterRequest: (response, url, options) => {
    console.log(`📥 ${options.method || 'GET'} ${url} - Success`);
    return response;
  },
  onError: (error, url, options) => {
    console.error(`❌ ${options.method || 'GET'} ${url} - Error: ${error.message}`);
  }
};

const metricsPlugin: Plugin = {
  name: 'metrics',
  beforeRequest: (url, options) => {
    (options as any).startTime = Date.now();
    return options;
  },
  afterRequest: (response, url, options) => {
    const duration = Date.now() - (options as any).startTime;
    console.log(`⏱️ Request took ${duration}ms`);
    return response;
  }
};

// Usage
const pluggableAPI = new PluggableAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!
});

pluggableAPI.addPlugin(loggingPlugin);
pluggableAPI.addPlugin(metricsPlugin);

// Requests will now use both plugins
const reports = await pluggableAPI.getE2EReports();
```

## Best Practices

### 1. Configuration Management

```typescript
// Use environment-specific configurations
const configs = {
  development: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
    retries: 1
  },
  staging: {
    baseUrl: 'https://staging-api.example.com',
    timeout: 30000,
    retries: 3
  },
  production: {
    baseUrl: 'https://api.example.com',
    timeout: 30000,
    retries: 5
  }
};

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

const api = new MyDashboardAPI({
  ...config,
  apiKey: process.env.MY_DASHBOARD_API_KEY!
});
```

### 2. Error Recovery Strategies

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) break;
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Usage
const reports = await withRetry(() => api.getE2EReports());
```

### 3. Resource Cleanup

```typescript
class ManagedAPI extends MyDashboardAPI {
  private timers: NodeJS.Timeout[] = [];
  private abortControllers: AbortController[] = [];
  
  public startPeriodicSync(interval: number): void {
    const timer = setInterval(async () => {
      try {
        await this.syncData();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, interval);
    
    this.timers.push(timer);
  }
  
  public async syncData(): Promise<void> {
    const controller = new AbortController();
    this.abortControllers.push(controller);
    
    try {
      // Perform sync operations
      await Promise.all([
        this.getE2EReports(),
        this.getApplications(),
        this.getNotifications()
      ]);
    } finally {
      const index = this.abortControllers.indexOf(controller);
      if (index !== -1) {
        this.abortControllers.splice(index, 1);
      }
    }
  }
  
  public cleanup(): void {
    // Clear all timers
    this.timers.forEach(timer => clearInterval(timer));
    this.timers = [];
    
    // Abort all pending requests
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers = [];
    
    console.log('🧹 API resources cleaned up');
  }
}

// Usage
const managedAPI = new ManagedAPI(config);
managedAPI.startPeriodicSync(60000); // Every minute

// Cleanup on process exit
process.on('SIGINT', () => {
  managedAPI.cleanup();
  process.exit(0);
});
```

## Next Steps

- [Examples](./examples.md) - Real-world usage examples
- [Service Reference](./services.md) - Detailed API documentation
- [API Reference](../api/overview.md) - Complete REST API reference
