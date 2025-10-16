# Applications API

The Applications API provides endpoints for managing monitored applications and their E2E test configurations.

## Endpoints

### List All Applications

Retrieve all monitored applications.

**Endpoint:** `GET /api/apps`

**Authentication:** Required (API Key)

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/apps" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Web App",
      "code": "my-web-app",
      "pipelineUrl": "https://app.circleci.com/pipelines/github/myorg/my-web-app",
      "watching": true,
      "e2eTriggerConfiguration": {
        "enabled": true,
        "schedule": "0 */6 * * *"
      },
      "lastRun": {
        "id": 5,
        "status": "success",
        "url": "https://app.circleci.com/pipelines/...",
        "pipelineId": "abc123",
        "createdAt": "2025-10-15T14:00:00.000Z"
      },
      "e2eRunsQuantity": 3
    }
  ]
}
```

---

### Get Application by ID

Retrieve detailed information about a specific application.

**Endpoint:** `GET /api/apps/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| `id`      | number | Yes      | Application ID |

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/apps/1" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Web App",
    "code": "my-web-app",
    "pipelineUrl": "https://app.circleci.com/pipelines/github/myorg/my-web-app",
    "watching": true,
    "e2eTriggerConfiguration": {
      "enabled": true,
      "schedule": "0 */6 * * *"
    },
    "lastRun": {
      "id": 5,
      "status": "success",
      "url": "https://app.circleci.com/pipelines/...",
      "pipelineId": "abc123",
      "createdAt": "2025-10-15T14:00:00.000Z"
    },
    "e2eRunsQuantity": 3
  }
}
```

#### Response Codes

| Code | Description                               |
|------|-------------------------------------------|
| 200  | Application retrieved successfully        |
| 400  | Invalid application ID                    |
| 401  | Unauthorized - Invalid or missing API key |
| 404  | Application not found                     |
| 500  | Internal server error                     |

---

### Create Application

Create a new monitored application.

**Endpoint:** `POST /api/apps`

**Authentication:** Required (API Key)

#### Request Body

| Field                     | Type    | Required | Description                                 |
|---------------------------|---------|----------|---------------------------------------------|
| `name`                    | string  | Yes      | Application name (max 255 chars)            |
| `code`                    | string  | Yes      | Unique application code (max 100 chars)     |
| `pipelineUrl`             | string  | Yes      | CircleCI pipeline URL (max 500 chars)       |
| `watching`                | boolean | No       | Whether to monitor this app (default: true) |
| `e2eTriggerConfiguration` | object  | No       | E2E trigger configuration                   |

#### Request Example

```bash
curl -X POST "http://localhost:3000/api/apps" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New App",
    "code": "new-app",
    "pipelineUrl": "https://app.circleci.com/pipelines/github/myorg/new-app",
    "watching": true,
    "e2eTriggerConfiguration": {
      "enabled": true,
      "schedule": "0 */6 * * *"
    }
  }'
```

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "New App",
    "code": "new-app",
    "pipelineUrl": "https://app.circleci.com/pipelines/github/myorg/new-app",
    "watching": true,
    "e2eTriggerConfiguration": {
      "enabled": true,
      "schedule": "0 */6 * * *"
    },
    "lastRun": null,
    "e2eRunsQuantity": 0
  }
}
```

#### Response Codes

| Code | Description                               |
|------|-------------------------------------------|
| 201  | Application created successfully          |
| 400  | Invalid request data or validation error  |
| 401  | Unauthorized - Invalid or missing API key |
| 409  | Application code already exists           |
| 500  | Internal server error                     |

---

### Update Application

Update an existing application.

**Endpoint:** `PUT /api/apps/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| `id`      | number | Yes      | Application ID |

#### Request Body

All fields are optional. Only provided fields will be updated.

| Field                     | Type    | Description                             |
|---------------------------|---------|-----------------------------------------|
| `name`                    | string  | Application name (max 255 chars)        |
| `code`                    | string  | Unique application code (max 100 chars) |
| `pipelineUrl`             | string  | CircleCI pipeline URL (max 500 chars)   |
| `watching`                | boolean | Whether to monitor this app             |
| `e2eTriggerConfiguration` | object  | E2E trigger configuration               |

#### Request Example

```bash
curl -X PUT "http://localhost:3000/api/apps/1" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "watching": false,
    "e2eTriggerConfiguration": {
      "enabled": false
    }
  }'
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Web App",
    "code": "my-web-app",
    "pipelineUrl": "https://app.circleci.com/pipelines/github/myorg/my-web-app",
    "watching": false,
    "e2eTriggerConfiguration": {
      "enabled": false
    },
    "lastRun": {
      "id": 5,
      "status": "success",
      "url": "https://app.circleci.com/pipelines/...",
      "pipelineId": "abc123",
      "createdAt": "2025-10-15T14:00:00.000Z"
    },
    "e2eRunsQuantity": 3
  }
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | Application updated successfully |
| 400 | Invalid request data or validation error |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | Application not found |
| 409 | Application code already exists (if code was changed) |
| 500 | Internal server error |

---

### Delete Application

Delete an application.

**Endpoint:** `DELETE /api/apps/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Application ID |

#### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/apps/1" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | Application deleted successfully |
| 400 | Invalid application ID |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | Application not found |
| 500 | Internal server error |

---

## SDK Usage

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
});

// List all applications
const apps = await api.getApplications();
console.log('Applications:', apps);

// Get specific application
const app = await api.getApplication(1);
console.log('App details:', app);

// Create new application
const newApp = await api.createApplication({
  name: 'New App',
  code: 'new-app',
  pipelineUrl: 'https://app.circleci.com/pipelines/github/myorg/new-app',
  watching: true,
});

// Update application
const updatedApp = await api.updateApplication(1, {
  watching: false,
});

// Delete application
await api.deleteApplication(1);
```

---

## Data Models

### Application

```typescript
interface Application {
  id: number;
  name: string;
  code: string;
  pipelineUrl: string;
  watching: boolean;
  e2eTriggerConfiguration?: {
    enabled: boolean;
    schedule?: string;
  };
}
```

### ApplicationDetails

```typescript
interface ApplicationDetails extends Application {
  lastRun: LastApplicationRun | null;
  e2eRunsQuantity: number;
}
```

### LastApplicationRun

```typescript
interface LastApplicationRun {
  id: number;
  status: string;
  url: string;
  pipelineId: string;
  createdAt: string;
}
```

---

## Next Steps

- [E2E Reports API](./e2e-reports.md) - View E2E test reports
- [Pull Requests API](./pull-requests.md) - Track pull requests
- [Notifications API](./notifications.md) - Manage notifications
- [Error Handling](../error-handling.md) - Error codes and responses

