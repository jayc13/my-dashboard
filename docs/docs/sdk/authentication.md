# SDK Authentication

This guide explains how to authenticate with the My Dashboard API using the SDK.

## Overview

The My Dashboard API uses **API Key authentication**. All requests must include a valid API key in the request headers.

**Authentication Method:**
- Header: `x-api-key`
- Value: Your API key string

## Getting an API Key

### From the Dashboard

1. Log in to the My Dashboard web application
2. Navigate to Settings → API Keys
3. Click "Generate New API Key"
4. Copy and securely store your API key

**⚠️ Important:**
- API keys are shown only once during creation
- Store keys securely (use environment variables)
- Never commit API keys to version control
- Rotate keys regularly for security

### API Key Format

API keys are alphanumeric strings:
```
example-api-key-abc123def456
```

## SDK Authentication

### Basic Authentication

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key-here',
});

// The SDK automatically includes the API key in all requests
const apps = await api.getApplications();
```

### Using Environment Variables

**Recommended approach for security:**

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});
```

**.env file:**
```env
MY_DASHBOARD_BASE_URL=http://localhost:3000
MY_DASHBOARD_API_KEY=your-api-key-here
```

### Validating API Keys

#### Validate Before Use

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
});

try {
  const result = await api.validateCurrentApiKey();
  
  if (result.valid) {
    console.log('✅ API key is valid');
    // Proceed with API calls
  } else {
    console.error('❌ API key is invalid');
    // Handle invalid key
  }
} catch (error) {
  console.error('Failed to validate API key:', error);
}
```

#### Validate a Different Key

```typescript
// Validate a key without initializing the SDK with it
const result = await api.auth.validateApiKey('different-api-key');

if (result.valid) {
  console.log('Key is valid');
}
```

### Updating API Keys

#### Runtime Key Update

```typescript
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: 'initial-key',
});

// Later, update the API key
api.setApiKey('new-api-key');

// All subsequent requests use the new key
const apps = await api.getApplications();
```

#### Key Rotation Example

```typescript
async function rotateApiKey(
  api: MyDashboardAPI,
  newKey: string
): Promise<boolean> {
  try {
    // Validate new key
    const result = await api.auth.validateApiKey(newKey);
    
    if (!result.valid) {
      throw new Error('New API key is invalid');
    }
    
    // Update SDK to use new key
    api.setApiKey(newKey);
    
    // Update stored key
    process.env.MY_DASHBOARD_API_KEY = newKey;
    
    console.log('✅ API key rotated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to rotate API key:', error);
    return false;
  }
}
```

## Authentication Errors

### Handling Authentication Failures

```typescript
import { MyDashboardAPI, APIError } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
});

try {
  const apps = await api.getApplications();
} catch (error) {
  if (error instanceof APIError) {
    if (error.status === 401) {
      console.error('Authentication failed: Invalid API key');
      // Redirect to login or request new key
    } else if (error.status === 403) {
      console.error('Forbidden: Insufficient permissions');
      // Handle permission error
    }
  }
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Valid key but insufficient permissions |
| 429 | Too Many Requests | Rate limit exceeded |

## Security Best Practices

### 1. Environment Variables

**✅ Good:**
```typescript
const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});
```

**❌ Bad:**
```typescript
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: 'hardcoded-api-key-123', // Never do this!
});
```

### 2. Secure Storage

**Node.js:**
```bash
# Use dotenv for local development
npm install dotenv
```

```typescript
import 'dotenv/config';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});
```

**Browser (React):**
```typescript
// Use environment variables with Vite
const api = new MyDashboardAPI({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY,
});
```

**⚠️ Warning:** Never expose API keys in client-side code for production. Use a backend proxy instead.

### 3. Backend Proxy Pattern

**Recommended for client-side applications:**

```typescript
// Client-side: Call your backend
async function getApplications() {
  const response = await fetch('/api/applications');
  return response.json();
}

// Backend (Express): Use SDK with API key
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!, // Secure on server
});

app.get('/api/applications', async (req, res) => {
  try {
    const apps = await api.getApplications();
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});
```

### 4. Key Rotation

Rotate API keys regularly:

```typescript
// Automated key rotation (example)
async function scheduleKeyRotation() {
  setInterval(async () => {
    try {
      // Generate new key via API
      const newKey = await generateNewApiKey();
      
      // Validate new key
      const result = await api.auth.validateApiKey(newKey);
      
      if (result.valid) {
        // Update SDK
        api.setApiKey(newKey);
        
        // Update environment
        await updateEnvironmentVariable('MY_DASHBOARD_API_KEY', newKey);
        
        console.log('✅ API key rotated successfully');
      }
    } catch (error) {
      console.error('❌ Key rotation failed:', error);
    }
  }, 30 * 24 * 60 * 60 * 1000); // Every 30 days
}
```

### 5. Least Privilege

Request API keys with minimal required permissions:

- **Read-only keys** for monitoring
- **Write keys** only when needed
- **Admin keys** for administrative tasks only

## Advanced Authentication

### Custom Headers

```typescript
import { BaseClient } from '@my-dashboard/sdk';

class CustomClient extends BaseClient {
  protected async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    // Add custom headers
    const customOptions = {
      ...options,
      headers: {
        ...options.headers,
        'X-Custom-Header': 'custom-value',
      },
    };
    
    return super.makeRequest<T>(url, customOptions);
  }
}
```

### Multi-Tenant Authentication

```typescript
class MultiTenantAPI {
  private apis: Map<string, MyDashboardAPI> = new Map();

  getAPI(tenantId: string): MyDashboardAPI {
    if (!this.apis.has(tenantId)) {
      const apiKey = this.getApiKeyForTenant(tenantId);
      
      this.apis.set(tenantId, new MyDashboardAPI({
        baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
        apiKey: apiKey,
      }));
    }
    
    return this.apis.get(tenantId)!;
  }

  private getApiKeyForTenant(tenantId: string): string {
    // Retrieve tenant-specific API key from secure storage
    return process.env[`API_KEY_${tenantId}`]!;
  }
}

// Usage
const multiTenant = new MultiTenantAPI();
const tenantAPI = multiTenant.getAPI('tenant-123');
const apps = await tenantAPI.getApplications();
```

### Authentication Middleware

```typescript
// Express middleware for API key validation
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});

async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  try {
    const result = await api.auth.validateApiKey(apiKey);
    
    if (result.valid) {
      req.apiKey = apiKey;
      next();
    } else {
      res.status(401).json({ error: 'Invalid API key' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Use middleware
app.use('/api', validateApiKey);
```

## Testing with Authentication

### Mock API Keys for Tests

```typescript
// test-setup.ts
process.env.MY_DASHBOARD_API_KEY = 'test-api-key';
process.env.MY_DASHBOARD_BASE_URL = 'http://localhost:3000';

// test.spec.ts
import { MyDashboardAPI } from '@my-dashboard/sdk';

describe('API Tests', () => {
  let api: MyDashboardAPI;

  beforeEach(() => {
    api = new MyDashboardAPI({
      baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
      apiKey: process.env.MY_DASHBOARD_API_KEY!,
    });
  });

  it('should authenticate successfully', async () => {
    const result = await api.validateCurrentApiKey();
    expect(result.valid).toBe(true);
  });
});
```

### Mocking Authentication

```typescript
import { vi } from 'vitest';

vi.mock('@my-dashboard/sdk', () => ({
  MyDashboardAPI: vi.fn().mockImplementation(() => ({
    validateCurrentApiKey: vi.fn().mockResolvedValue({ valid: true }),
    getApplications: vi.fn().mockResolvedValue([]),
  })),
}));
```

## Troubleshooting

### Invalid API Key

**Problem:** 401 Unauthorized error

**Solution:**
1. Verify API key is correct
2. Check key hasn't expired
3. Ensure key has required permissions
4. Validate key using `validateCurrentApiKey()`

### Missing API Key

**Problem:** ConfigurationError: apiKey is required

**Solution:**
```typescript
// Ensure API key is provided
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.MY_DASHBOARD_API_KEY || 'fallback-key',
});
```

### Rate Limiting

**Problem:** 429 Too Many Requests

**Solution:**
```typescript
// SDK automatically retries with exponential backoff
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
  retries: 5, // Increase retries for rate limiting
});
```

## Next Steps

- [Installation](./installation.md) - Install the SDK
- [Usage Examples](./usage-examples.md) - See practical examples
- [API Reference](../api/overview.md) - Explore available endpoints

