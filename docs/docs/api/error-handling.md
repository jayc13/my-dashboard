# Error Handling

This document describes how the My Dashboard API handles errors and the error response format.

## Error Response Format

All API errors follow a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "MACHINE_READABLE_ERROR_CODE",
    "statusCode": 400,
    "details": {},
    "timestamp": "2025-10-16T12:00:00.000Z",
    "path": "/api/applications",
    "method": "POST"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `false` for error responses |
| `error.message` | string | Human-readable error description |
| `error.code` | string | Machine-readable error code |
| `error.statusCode` | number | HTTP status code |
| `error.details` | object | Additional error context (optional) |
| `error.timestamp` | string | ISO 8601 timestamp (optional) |
| `error.path` | string | Request path where error occurred (optional) |
| `error.method` | string | HTTP method (optional) |

## HTTP Status Codes

### 2xx Success

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 202 | Accepted | Request accepted for processing |
| 204 | No Content | Request succeeded with no response body |

### 4xx Client Errors

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Valid API key but insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Semantic validation error |
| 429 | Too Many Requests | Rate limit exceeded |

### 5xx Server Errors

| Code | Status | Description |
|------|--------|-------------|
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | External service error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Error Codes

### Authentication Errors

**UNAUTHORIZED** (401)
```json
{
  "success": false,
  "error": {
    "message": "Invalid or missing API key",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

**FORBIDDEN** (403)
```json
{
  "success": false,
  "error": {
    "message": "Access forbidden",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}
```

### Validation Errors

**VALIDATION_ERROR** (400)
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "name",
        "message": "Name is required",
        "code": "REQUIRED_FIELD"
      },
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT",
        "value": "invalid-email"
      }
    ]
  }
}
```

**EMPTY_BODY** (400)
```json
{
  "success": false,
  "error": {
    "message": "Request body cannot be empty",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "body",
        "message": "Request body is required",
        "code": "EMPTY_BODY"
      }
    ]
  }
}
```

**INVALID_CONTENT_TYPE** (400)
```json
{
  "success": false,
  "error": {
    "message": "Invalid content type",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "content-type",
        "message": "Content-Type must be application/json",
        "code": "INVALID_CONTENT_TYPE"
      }
    ]
  }
}
```

### Resource Errors

**NOT_FOUND** (404)
```json
{
  "success": false,
  "error": {
    "message": "Application with id '999' not found",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

**CONFLICT** (409)
```json
{
  "success": false,
  "error": {
    "message": "Resource conflict",
    "code": "CONFLICT",
    "statusCode": 409
  }
}
```

**UNPROCESSABLE_ENTITY** (422)
```json
{
  "success": false,
  "error": {
    "message": "Unprocessable entity",
    "code": "UNPROCESSABLE_ENTITY",
    "statusCode": 422,
    "details": {
      "reason": "Semantic validation failed"
    }
  }
}
```

### Rate Limiting

**TOO_MANY_REQUESTS** (429)
```json
{
  "success": false,
  "error": {
    "message": "Too many requests",
    "code": "TOO_MANY_REQUESTS",
    "statusCode": 429,
    "details": {
      "retryAfter": 60
    }
  }
}
```

**Headers:**
```
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1697462400
```

### Server Errors

**INTERNAL_SERVER_ERROR** (500)
```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_SERVER_ERROR",
    "statusCode": 500
  }
}
```

**DATABASE_ERROR** (500)
```json
{
  "success": false,
  "error": {
    "message": "Database operation failed",
    "code": "DATABASE_ERROR",
    "statusCode": 500
  }
}
```

**EXTERNAL_SERVICE_ERROR** (502)
```json
{
  "success": false,
  "error": {
    "message": "GitHub: External service error",
    "code": "EXTERNAL_SERVICE_ERROR",
    "statusCode": 502
  }
}
```

**SERVICE_UNAVAILABLE** (503)
```json
{
  "success": false,
  "error": {
    "message": "Service temporarily unavailable",
    "code": "SERVICE_UNAVAILABLE",
    "statusCode": 503
  }
}
```

## Error Handling Best Practices

### Client-Side Handling

```typescript
import { MyDashboardAPI, APIError, NetworkError } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
});

try {
  const apps = await api.getApplications();
} catch (error) {
  if (error instanceof APIError) {
    // Handle API errors
    switch (error.status) {
      case 400:
        console.error('Validation error:', error.details);
        break;
      case 401:
        console.error('Unauthorized - check API key');
        // Redirect to login
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 429:
        console.error('Rate limited - retry after:', error.getRetryDelay());
        break;
      case 500:
        console.error('Server error - try again later');
        break;
      default:
        console.error('API error:', error.message);
    }
  } else if (error instanceof NetworkError) {
    // Handle network errors
    console.error('Network error:', error.message);
  } else {
    // Handle unknown errors
    console.error('Unknown error:', error);
  }
}
```

### Validation Error Handling

```typescript
try {
  const app = await api.createApplication({
    name: '',
    code: 'invalid code',
  });
} catch (error) {
  if (error instanceof APIError && error.status === 400) {
    // Display validation errors to user
    error.details?.forEach(detail => {
      console.error(`${detail.field}: ${detail.message}`);
    });
  }
}
```

### Retry Logic

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (except rate limiting)
      if (error instanceof APIError) {
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // Wait before retrying on rate limit
        if (error.status === 429) {
          const delay = error.getRetryDelay() || 1000 * attempt;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Exponential backoff for server errors
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Usage
const apps = await fetchWithRetry(() => api.getApplications());
```

### Rate Limit Handling

```typescript
async function handleRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof APIError && error.status === 429) {
      const retryAfter = error.getRetryDelay() || 60000;
      console.log(`Rate limited. Retrying after ${retryAfter}ms`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      return fn();
    }
    throw error;
  }
}
```

## Common Error Scenarios

### Missing API Key

**Request:**
```bash
curl -X GET http://localhost:3000/api/applications
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid or missing API key",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

### Invalid Request Body

**Request:**
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "name",
        "message": "Name is required",
        "code": "REQUIRED_FIELD"
      },
      {
        "field": "code",
        "message": "Code is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}
```

### Resource Not Found

**Request:**
```bash
curl -X GET http://localhost:3000/api/applications/999 \
  -H "x-api-key: your-api-key"
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Application with id '999' not found",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

## Debugging Errors

### Enable Verbose Logging

```typescript
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
  // SDK automatically logs errors
});

// Catch and log detailed error information
try {
  await api.getApplications();
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error Details:', {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
      path: error.path,
      method: error.method,
      timestamp: error.timestamp,
    });
  }
}
```

### Check Server Logs

Server logs include detailed error information:

```
[ERROR] Unexpected error {
  method: 'POST',
  path: '/api/applications',
  errorName: 'ValidationError',
  errorMessage: 'Validation failed',
  stack: '...'
}
```

## Next Steps

- [API Overview](./overview.md) - API introduction
- [Authentication](./authentication.md) - API authentication
- [SDK Usage](../sdk/usage-examples.md) - SDK error handling examples

