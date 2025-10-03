# Notification Processor

The Notification Processor is a lightweight background service that creates notifications using a Redis-based producer/consumer pattern. It processes messages from Redis pub/sub and stores notifications in the database while sending push notifications via Firebase Cloud Messaging (FCM).

## Overview

The processor implements a simple asynchronous notification system that:
- Listens for notification creation requests via Redis pub/sub
- Creates notifications in the database
- Sends push notifications to registered devices via FCM
- Handles failures gracefully by logging errors

## Architecture

### Components

1. **Producer (Cron Project)**
   - Publishes notification messages to Redis channel
   - Used by scheduled jobs to send notifications
   - Located in `cron/src/jobs/notification.job.ts`

2. **Consumer (Server Project)**
   - Subscribes to Redis channel for notification messages
   - Processes messages from the queue
   - Creates notifications using NotificationService
   - Located in `server/src/processors/notification.processor.ts`

3. **Redis Channel**
   - `notification:create` - Pub/sub channel for new notifications

### Data Flow

1. **Message Publishing**: A producer publishes a message to the `notification:create` channel
2. **Message Reception**: The processor receives the message via Redis pub/sub
3. **Processing**: Processor immediately creates notification in database and sends FCM push notification
4. **Error Handling**: Failed messages are logged (errors don't block the processor)

## Message Structure

### NotificationInput Interface

```typescript
interface NotificationInput {
  title: string;              // Notification title
  message: string;            // Notification message body
  link?: string;              // Optional link/URL
  type: NotificationType;     // 'success' | 'error' | 'info' | 'warning'
}
```

## Usage

### Publishing Notifications (Producer)

From the cron project or any job:

```typescript
import { publishNotificationRequest } from './jobs/notification.job';

// Publish a notification
await publishNotificationRequest({
  title: 'Pull Requests Ready to Merge',
  message: 'There are 3 pull requests ready to merge.',
  type: 'info',
  link: '/pull_requests',
});
```

### Example: PR Approval Job

```typescript
import { publishNotificationRequest } from './notification.job';

const isPrApprovedJob = async () => {
  const pullRequestsReadyToMerge = await fetchReadyPRs();

  if (pullRequestsReadyToMerge.length > 0) {
    await publishNotificationRequest({
      title: 'Pull Requests Ready to Merge',
      message: `There are ${pullRequestsReadyToMerge.length} pull requests ready to merge.`,
      type: 'info',
      link: '/pull_requests',
    });
  }
};
```

### Example: Manual Testing Reminder

```typescript
import { publishNotificationRequest } from './notification.job';

const manualTicketsReminderJob = async () => {
  const tickets = await fetchManualTestingTickets();

  if (tickets.length > 0) {
    await publishNotificationRequest({
      title: 'Manual Testing Tickets - Reminder',
      message: `There are ${tickets.length} tickets that need attention.`,
      type: 'warning',
      link: '/',
    });
  }
};
```

## Error Handling

The processor handles errors gracefully:

- **Logging**: All errors are logged with details
- **Non-blocking**: Errors don't stop the processor from handling other notifications
- **FCM Failures**: FCM push notification failures don't prevent database notification creation

## Configuration

### Environment Variables

```bash
# Redis connection
REDIS_URL=redis://localhost:6379

# MySQL connection (for storing notifications)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=my_dashboard

# Firebase (for FCM push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Processor Settings

Located in `server/src/processors/notification.processor.ts`:

```typescript
private readonly CHANNEL_NAME = 'notification:create';
```

## Running the Processor

### Development

```bash
# Start the server (includes processor)
cd server
npm run dev

# Or run processor separately
npm run processor:dev
```

### Production

```bash
# Build and start
cd server
npm run build
npm start

# Or run processor separately
npm run processor
```

## Monitoring

### Logs

The processor logs all activities:

```
[Notification Processor] Starting...
[Notification Processor] Subscribed to channel: notification:create
[Notification Processor] Received message: { title: 'Test', ... }
[Notification Processor] Creating notification: Test
[Notification Processor] Successfully created notification with ID: 42
```

### Error Logs

```
[Notification Processor] Error handling message: Invalid JSON
[Notification Processor] Error creating notification: Database error
```

## Database Schema

### notifications Table

```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  type ENUM('success', 'error', 'info', 'warning') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integration with Other Services

### NotificationService

The processor uses `NotificationService` which:
- Stores notifications in the database
- Sends FCM push notifications to all registered devices
- Handles FCM failures gracefully (doesn't fail notification creation)

### FCM Service

Notifications are automatically sent to all registered devices via Firebase Cloud Messaging:
- Title and body from notification
- Custom data payload with notification ID and type
- Optional link for deep linking

## Testing

### Unit Tests

Located in `server/src/tests/notification.processor.test.ts`:

```bash
cd server
npm test notification.processor.test.ts
```

### Integration Testing

```bash
# Publish a test notification
cd cron
npm run dev

# Check server logs for processing
cd server
npm run dev
```

## Best Practices

1. **Use Descriptive Titles**: Make notification titles clear and actionable
2. **Include Links**: Provide links to relevant pages when possible
3. **Choose Appropriate Types**: Use correct notification types (success, error, info, warning)
4. **Handle Errors**: Ensure jobs handle notification publishing errors gracefully
5. **Keep It Simple**: Notifications are fire-and-forget - don't rely on them for critical operations

## Troubleshooting

### Notifications Not Being Created

1. Check Redis connection: `REDIS_URL` environment variable
2. Verify processor is running: Check server logs
3. Check database connection: Verify MySQL is accessible
4. Review processor logs for errors

### FCM Push Notifications Not Sent

1. Verify Firebase configuration
2. Check device tokens are registered
3. Review FCM service logs
4. Note: FCM failures don't prevent notification creation

## Future Enhancements

- [ ] Add notification priority levels
- [ ] Implement notification batching
- [ ] Add user-specific notification preferences
- [ ] Support notification templates
- [ ] Add notification scheduling
- [ ] Implement notification expiration

