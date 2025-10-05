import { NotificationInput } from '@my-dashboard/types';
import { getRedisClient } from '../utils/redis';

/**
 * Publish a notification message to Redis
 */
export async function publishNotificationRequest(
  notification: NotificationInput,
): Promise<void> {
  const client = getRedisClient();

  await client.publish('notification:create', JSON.stringify(notification));
  console.log(`[Notification Publisher] Published notification request: ${notification.title}`);
}

/**
 * Example job that publishes a notification
 * This can be used as a template for other jobs that need to send notifications
 */
const notificationService = async (): Promise<void> => {
  try {
    console.log('='.repeat(60));
    console.log('Publishing Notification Request');
    console.log('='.repeat(60));

    // Example: Send a test notification
    await publishNotificationRequest({
      title: 'Test Notification',
      message: 'This is a test notification from the cron job',
      type: 'info',
      link: '/',
    });

    console.log('Notification published successfully');
  } catch (error) {
    console.error('Error running Notification job:', error);
  }
  return;
};

export default notificationService;

