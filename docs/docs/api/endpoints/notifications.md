# Notifications API

The Notifications API provides endpoints for managing user notifications with Firebase Cloud Messaging (FCM) integration.

## Endpoints

### List All Notifications

Retrieve all notifications with optional filtering.

**Endpoint:** `GET /api/notifications`

**Authentication:** Required (API Key)

#### Query Parameters

| Parameter | Type    | Required | Description                               |
|-----------|---------|----------|-------------------------------------------|
| `isRead`  | boolean | No       | Filter by read status (`true` or `false`) |
| `type`    | string  | No       | Filter by notification type               |

#### Request Example

```bash
# Get all notifications
curl -X GET "http://localhost:3000/api/notifications" \
  -H "x-api-key: your-api-key"

# Get unread notifications
curl -X GET "http://localhost:3000/api/notifications?isRead=false" \
  -H "x-api-key: your-api-key"

# Get notifications by type
curl -X GET "http://localhost:3000/api/notifications?type=e2e_failure" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "E2E Test Failed",
      "message": "E2E tests failed for My Web App",
      "type": "e2e_failure",
      "isRead": false,
      "createdAt": "2025-10-15T14:30:00.000Z",
      "data": {
        "appId": 1,
        "appName": "My Web App",
        "runId": 5
      }
    }
  ]
}
```

---

### Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `PATCH /api/notifications/:id/read`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| `id`      | number | Yes      | Notification ID |

#### Request Example

```bash
curl -X PATCH "http://localhost:3000/api/notifications/1/read" \
  -H "x-api-key: your-api-key"
```

#### Response (204 No Content)

No response body. Status code 204 indicates success.

#### Response Codes

| Code | Description                               |
|------|-------------------------------------------|
| 204  | Notification marked as read successfully  |
| 400  | Invalid notification ID                   |
| 401  | Unauthorized - Invalid or missing API key |
| 404  | Notification not found                    |
| 500  | Internal server error                     |

---

### Delete Notification

Delete a specific notification.

**Endpoint:** `DELETE /api/notifications/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| `id`      | number | Yes      | Notification ID |

#### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/notifications/1" \
  -H "x-api-key: your-api-key"
```

#### Response (204 No Content)

No response body. Status code 204 indicates success.

#### Response Codes

| Code | Description                               |
|------|-------------------------------------------|
| 204  | Notification deleted successfully         |
| 400  | Invalid notification ID                   |
| 401  | Unauthorized - Invalid or missing API key |
| 404  | Notification not found                    |
| 500  | Internal server error                     |

---

## SDK Usage

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
});

// Get all notifications
const notifications = await api.getNotifications();
console.log('Notifications:', notifications);

// Get unread notifications
const unread = await api.getNotifications({ isRead: false });
console.log('Unread:', unread.length);

// Get notifications by type
const e2eFailures = await api.getNotifications({ type: 'e2e_failure' });

// Mark notification as read
await api.markNotificationAsRead(1);

// Delete notification
await api.deleteNotification(1);
```

---

## Data Models

### Notification

```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}
```

### NotificationType

```typescript
type NotificationType = 
  | 'e2e_failure'
  | 'e2e_success'
  | 'pr_update'
  | 'app_update'
  | 'system'
  | 'info';
```

### NotificationInput

```typescript
interface NotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
}
```

---

## Firebase Cloud Messaging (FCM)

The Notifications API integrates with Firebase Cloud Messaging to send push notifications to mobile and web clients.

### Register FCM Token

**Endpoint:** `POST /api/fcm/register`

Register a device token for push notifications.

#### Request Body

```json
{
  "token": "fcm-device-token-here"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "FCM token registered successfully"
}
```

### Unregister FCM Token

**Endpoint:** `POST /api/fcm/unregister`

Unregister a device token.

#### Request Body

```json
{
  "token": "fcm-device-token-here"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "FCM token unregistered successfully"
}
```

---

## Common Use Cases

### Get Unread Notification Count

```typescript
const unread = await api.getNotifications({ isRead: false });
const count = unread.length;
console.log(`You have ${count} unread notifications`);
```

### Mark All Notifications as Read

```typescript
const notifications = await api.getNotifications({ isRead: false });

for (const notification of notifications) {
  await api.markNotificationAsRead(notification.id);
}

console.log('All notifications marked as read');
```

### Filter by Notification Type

```typescript
// Get all E2E failure notifications
const failures = await api.getNotifications({ type: 'e2e_failure' });

console.log(`${failures.length} E2E test failures`);

for (const notification of failures) {
  console.log(`- ${notification.title}: ${notification.message}`);
}
```

### Clean Up Old Notifications

```typescript
const notifications = await api.getNotifications({ isRead: true });

// Delete read notifications older than 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

for (const notification of notifications) {
  const createdAt = new Date(notification.createdAt);
  
  if (createdAt < thirtyDaysAgo) {
    await api.deleteNotification(notification.id);
  }
}
```

---

## Notification Types

### E2E Test Notifications

- **`e2e_failure`** - E2E test run failed
- **`e2e_success`** - E2E test run succeeded

Example data:
```json
{
  "appId": 1,
  "appName": "My Web App",
  "runId": 5,
  "failureCount": 3
}
```

### Pull Request Notifications

- **`pr_update`** - Pull request status changed

Example data:
```json
{
  "prId": 1,
  "prNumber": 123,
  "status": "merged"
}
```

### Application Notifications

- **`app_update`** - Application configuration changed

Example data:
```json
{
  "appId": 1,
  "appName": "My Web App",
  "changeType": "watching_disabled"
}
```

### System Notifications

- **`system`** - System-level notifications
- **`info`** - General information

---

## Error Handling

```typescript
try {
  await api.markNotificationAsRead(999);
} catch (error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 404:
        console.error('Notification not found');
        break;
      case 400:
        console.error('Invalid notification ID');
        break;
    }
  }
}
```

---

## Next Steps

- [Applications API](./applications.md) - Manage applications
- [E2E Reports API](./e2e-reports.md) - View E2E test reports
- [Pull Requests API](./pull-requests.md) - Track pull requests
- [Error Handling](../error-handling.md) - Error codes and responses

