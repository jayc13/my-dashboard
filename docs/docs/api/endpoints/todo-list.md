# To-Do List API

The To-Do List API provides endpoints for managing tasks and to-do items.

## Endpoints

### List All To-Do Items

Retrieve all to-do items, ordered by due date.

**Endpoint:** `GET /api/to_do_list`

**Authentication:** Required (API Key)

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/to_do_list" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete API documentation",
      "description": "Write comprehensive OpenAPI documentation for all endpoints",
      "link": "https://github.com/company/project/issues/123",
      "dueDate": "2025-10-20T00:00:00.000Z",
      "isCompleted": false
    },
    {
      "id": 2,
      "title": "Review pull request",
      "description": "Review PR #456 for authentication changes",
      "link": "https://github.com/company/project/pull/456",
      "dueDate": "2025-10-18T00:00:00.000Z",
      "isCompleted": true
    }
  ]
}
```

---

### Get To-Do Item by ID

Retrieve a specific to-do item.

**Endpoint:** `GET /api/to_do_list/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | To-do item ID |

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/to_do_list/1" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete API documentation",
    "description": "Write comprehensive OpenAPI documentation for all endpoints",
    "link": "https://github.com/company/project/issues/123",
    "dueDate": "2025-10-20T00:00:00.000Z",
    "isCompleted": false
  }
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | To-do item retrieved successfully |
| 400 | Invalid to-do item ID |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | To-do item not found |
| 500 | Internal server error |

---

### Create To-Do Item

Create a new to-do item.

**Endpoint:** `POST /api/to_do_list`

**Authentication:** Required (API Key)

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Task title (max 255 chars) |
| `description` | string | No | Task description |
| `link` | string | No | Related URL (max 500 chars) |
| `dueDate` | string | No | Due date in ISO 8601 format |
| `isCompleted` | boolean | No | Completion status (default: false) |

#### Request Example

```bash
curl -X POST "http://localhost:3000/api/to_do_list" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive OpenAPI documentation for all endpoints",
    "link": "https://github.com/company/project/issues/123",
    "dueDate": "2025-10-20T00:00:00.000Z",
    "isCompleted": false
  }'
```

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete API documentation",
    "description": "Write comprehensive OpenAPI documentation for all endpoints",
    "link": "https://github.com/company/project/issues/123",
    "dueDate": "2025-10-20T00:00:00.000Z",
    "isCompleted": false
  }
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 201 | To-do item created successfully |
| 400 | Invalid request data or validation error |
| 401 | Unauthorized - Invalid or missing API key |
| 500 | Internal server error |

---

### Update To-Do Item

Update an existing to-do item. All fields are optional - only provided fields will be updated.

**Endpoint:** `PUT /api/to_do_list/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | To-do item ID |

#### Request Body

All fields are optional. Only provided fields will be updated.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Task title (max 255 chars) |
| `description` | string | Task description |
| `link` | string | Related URL (max 500 chars) |
| `dueDate` | string | Due date in ISO 8601 format |
| `isCompleted` | boolean | Completion status |

#### Request Example

```bash
curl -X PUT "http://localhost:3000/api/to_do_list/1" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "isCompleted": true
  }'
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete API documentation",
    "description": "Write comprehensive OpenAPI documentation for all endpoints",
    "link": "https://github.com/company/project/issues/123",
    "dueDate": "2025-10-20T00:00:00.000Z",
    "isCompleted": true
  }
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | To-do item updated successfully |
| 400 | Invalid request data or validation error |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | To-do item not found |
| 500 | Internal server error |

---

### Delete To-Do Item

Delete a to-do item.

**Endpoint:** `DELETE /api/to_do_list/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | To-do item ID |

#### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/to_do_list/1" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | To-do item deleted successfully |
| 400 | Invalid to-do item ID |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | To-do item not found |
| 500 | Internal server error |

---

## SDK Usage

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
});

// List all to-do items
const todos = await api.getTodos();
console.log('To-Do Items:', todos);

// Get specific to-do item
const todo = await api.getTodo(1);
console.log('To-Do:', todo);

// Create new to-do item
const newTodo = await api.createTodo({
  title: 'Complete API documentation',
  description: 'Write comprehensive OpenAPI documentation',
  link: 'https://github.com/company/project/issues/123',
  dueDate: '2025-10-20T00:00:00.000Z',
  isCompleted: false,
});

// Update to-do item
const updatedTodo = await api.updateTodo(1, {
  isCompleted: true,
});

// Delete to-do item
await api.deleteTodo(1);
```

---

## Data Models

### ToDoItem

```typescript
interface ToDoItem {
  id?: number;
  title: string;
  description: string;
  link: string;
  dueDate: string;        // ISO 8601 format
  isCompleted: boolean;
}
```

### ToDoItemInput

```typescript
interface ToDoItemInput {
  title: string;
  description?: string;
  link?: string;
  dueDate?: string;       // ISO 8601 format, optional
  isCompleted?: boolean;
}
```

---

## Common Use Cases

### Get Pending Tasks

```typescript
const todos = await api.getTodos();

// Filter incomplete tasks
const pending = todos.filter(todo => !todo.isCompleted);

console.log(`${pending.length} pending tasks`);

// Sort by due date
pending.sort((a, b) => 
  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
);

console.log('Upcoming tasks:');
pending.forEach(todo => {
  console.log(`- ${todo.title} (due: ${todo.dueDate})`);
});
```

### Mark Task as Complete

```typescript
// Complete a task
await api.updateTodo(1, { isCompleted: true });

console.log('Task marked as complete!');
```

### Get Overdue Tasks

```typescript
const todos = await api.getTodos();
const now = new Date();

const overdue = todos.filter(todo => {
  const dueDate = new Date(todo.dueDate);
  return !todo.isCompleted && dueDate < now;
});

console.log(`${overdue.length} overdue tasks`);

overdue.forEach(todo => {
  const daysOverdue = Math.floor(
    (now.getTime() - new Date(todo.dueDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  console.log(`⚠️ ${todo.title} (${daysOverdue} days overdue)`);
});
```

### Create Task from GitHub Issue

```typescript
// Create to-do from GitHub issue
const newTodo = await api.createTodo({
  title: 'Fix authentication bug',
  description: 'Users unable to log in with Google OAuth',
  link: 'https://github.com/myorg/myrepo/issues/456',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  isCompleted: false,
});

console.log('Created to-do from GitHub issue:', newTodo.id);
```

---

## Validation Rules

### Title
- **Required:** Yes
- **Max Length:** 255 characters
- **Sanitization:** HTML tags removed, special characters escaped

### Description
- **Required:** No
- **Max Length:** No limit
- **Sanitization:** HTML tags removed, newlines preserved

### Link
- **Required:** No
- **Max Length:** 500 characters
- **Validation:** Must be a valid URL if provided
- **Sanitization:** HTML tags removed

### Due Date
- **Required:** No
- **Format:** ISO 8601 date-time string
- **Example:** `2025-10-20T00:00:00.000Z`

### Is Completed
- **Required:** No
- **Type:** Boolean
- **Default:** `false`

---

## Error Handling

```typescript
try {
  const todo = await api.createTodo({
    title: 'New Task',
    link: 'invalid-url',
  });
} catch (error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        console.error('Validation error:', error.message);
        // Check if it's a URL validation error
        if (error.message.includes('URL')) {
          console.error('Invalid URL format');
        }
        break;
      case 404:
        console.error('To-do item not found');
        break;
    }
  }
}
```

---

## Next Steps

- [Applications API](./applications.md) - Manage applications
- [JIRA Integration API](./jira.md) - Fetch JIRA tickets
- [Notifications API](./notifications.md) - Manage notifications
- [Error Handling](../error-handling.md) - Error codes and responses

