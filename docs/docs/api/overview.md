# API Overview

The My Dashboard API is a RESTful API built with Express.js and TypeScript, providing endpoints for managing Cypress E2E test results, applications, pull requests, JIRA tickets, and more.

## Base URL

**Development**: `http://localhost:3000`
**Production**: Your deployed Railway URL

## API Specification

The complete API specification is available in OpenAPI 3.1 format:

📄 **OpenAPI Spec**: [`server/docs/api-documentation/openapi.yaml`](https://github.com/jayc13/my-dashboard/blob/main/server/docs/api-documentation/openapi.yaml)

## Authentication

All API endpoints (except `/health` and `/api/auth/validate`) require authentication via API key.

**Header**: `x-api-key`

```bash
curl http://localhost:3000/api/apps \
  -H "x-api-key: your-api-key-here"
```

See [Authentication](./authentication.md) for detailed information.

## API Categories

### 1. Health Check

Monitor service health and status.

- `GET /health` - Service health check (no auth required)

### 2. Authentication

Validate API keys.

- `POST /api/auth/validate` - Validate an API key (no auth required)

### 3. E2E Test Reports

Manage Cypress end-to-end test execution reports.

- `GET /api/e2e_run_report` - Get E2E test report summary
- `GET /api/e2e_run_report/:summaryId/:appId` - Get detailed report for specific app

### 4. E2E Manual Runs

Trigger manual E2E test executions.

- `POST /api/e2e_manual_runs` - Trigger a manual E2E test run

### 5. Applications

Manage applications/projects being monitored.

- `GET /api/apps` - List all applications
- `GET /api/apps/:id` - Get specific application
- `POST /api/apps` - Create new application
- `PUT /api/apps/:id` - Update application
- `DELETE /api/apps/:id` - Delete application

### 6. Pull Requests

Track and manage GitHub pull requests.

- `GET /api/pull_requests` - List pull requests
- `GET /api/pull_requests/:id` - Get specific pull request
- `POST /api/pull_requests` - Create pull request record
- `PUT /api/pull_requests/:id` - Update pull request
- `DELETE /api/pull_requests/:id` - Delete pull request

### 7. Notifications

Manage system notifications and alerts.

- `GET /api/notifications` - List notifications
- `GET /api/notifications/:id` - Get specific notification
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Update notification
- `POST /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### 8. JIRA Integration

Fetch and manage JIRA tickets.

- `GET /api/jira/manual_qa` - Get manual QA tickets
- `GET /api/jira/my_tickets` - Get tickets assigned to current user

### 9. To-Do Lists

Task management functionality.

- `GET /api/to_do_list` - List to-do items
- `GET /api/to_do_list/:id` - Get specific to-do item
- `POST /api/to_do_list` - Create to-do item
- `PUT /api/to_do_list/:id` - Update to-do item
- `DELETE /api/to_do_list/:id` - Delete to-do item

### 10. Firebase Cloud Messaging

Push notification services.

- `POST /api/fcm/register-token` - Register device token for push notifications

## Request Format

### Headers

All requests should include:

```
Content-Type: application/json
x-api-key: your-api-key-here
```

### Request Body

Request bodies should be valid JSON:

```json
{
  "name": "My Application",
  "code": "my-app"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Application",
    "code": "my-app"
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [
    {
      "field": "name",
      "message": "Name is required",
      "code": "REQUIRED_FIELD"
    }
  ]
}
```

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid or missing API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External service error |

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Invalid or missing API key |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `DATABASE_ERROR` | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | External service error |
| `INTERNAL_ERROR` | Internal server error |

See [Error Handling](./error-handling.md) for detailed error documentation.

## Data Formats

### Dates

All dates are in ISO 8601 format:

```
2024-01-20T12:00:00.000Z
```

### Booleans

Boolean values are represented as `true` or `false`:

```json
{
  "isCompleted": true,
  "watching": false
}
```

### Numbers

Numbers are represented without quotes:

```json
{
  "id": 123,
  "successRate": 95.5
}
```

## Pagination

List endpoints support pagination via query parameters:

```
GET /api/apps?limit=10&offset=0
```

**Parameters**:
- `limit` - Number of items per page (default: 50, max: 100)
- `offset` - Number of items to skip (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Filtering and Sorting

Some endpoints support filtering and sorting:

```
GET /api/pull_requests?status=open&sort=created_at&order=desc
```

Check individual endpoint documentation for supported parameters.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 3 requests per 15 minutes per IP
- **General endpoints**: Configurable per endpoint

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684800
```

## CORS

CORS is enabled for all origins in development. In production, configure allowed origins via environment variables.

## Versioning

The API currently does not use versioning. Breaking changes will be communicated in advance.

## Using the API

### cURL Example

```bash
# Get all applications
curl http://localhost:3000/api/apps \
  -H "x-api-key: your-api-key-here"

# Create a new application
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{
    "name": "My App",
    "code": "my-app",
    "watching": true
  }'
```

### JavaScript/TypeScript Example

```typescript
const response = await fetch('http://localhost:3000/api/apps', {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  }
});

const data = await response.json();
console.log(data);
```

### Using the SDK

The recommended way to interact with the API is using the TypeScript SDK:

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!
});

// Get all applications
const apps = await api.getApplications();

// Create a new application
const newApp = await api.createApplication({
  name: 'My App',
  code: 'my-app',
  watching: true
});
```

See [SDK Documentation](../sdk/overview.md) for more information.

## API Endpoints Documentation

Detailed documentation for each endpoint category:

- [E2E Reports](./endpoints/e2e-reports.md)
- [Applications](./endpoints/applications.md)
- [Pull Requests](./endpoints/pull-requests.md)
- [Notifications](./endpoints/notifications.md)
- [JIRA Integration](./endpoints/jira.md)
- [To-Do Lists](./endpoints/todo-list.md)

## Next Steps

- [Authentication](./authentication.md) - Learn about API authentication
- [Error Handling](./error-handling.md) - Understand error responses
- [SDK Overview](../sdk/overview.md) - Use the TypeScript SDK

