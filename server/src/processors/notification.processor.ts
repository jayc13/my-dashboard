import { getRedisSubscriber } from '../config/redis';
import { NotificationService } from '../services/notification.service';
import { NotificationInput } from '@my-dashboard/types/notifications';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Notification Processor
 *
 * This processor listens to Redis messages and creates notifications
 * using the NotificationService.
 */
export class NotificationProcessor {
  private static instance: NotificationProcessor;
  private subscriber: ReturnType<typeof getRedisSubscriber>;
  private readonly CHANNEL_NAME = 'notification:create';

  private constructor() {
    this.subscriber = getRedisSubscriber();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationProcessor {
    if (!NotificationProcessor.instance) {
      NotificationProcessor.instance = new NotificationProcessor();
    }
    return NotificationProcessor.instance;
  }

  /**
   * Start listening for messages
   */
  public async start(): Promise<void> {
    console.log('[Notification Processor] Starting...');

    // Subscribe to the channel
    await this.subscriber.subscribe(this.CHANNEL_NAME);
    console.log(`[Notification Processor] Subscribed to channel: ${this.CHANNEL_NAME}`);

    // Handle incoming messages
    this.subscriber.on('message', async (channel, message) => {
      if (channel === this.CHANNEL_NAME) {
        await this.handleMessage(message);
      }
    });

    console.log('[Notification Processor] Started successfully');
  }

  /**
   * Stop the processor
   */
  public async stop(): Promise<void> {
    console.log('[Notification Processor] Stopping...');
    await this.subscriber.unsubscribe(this.CHANNEL_NAME);
    console.log('[Notification Processor] Stopped');
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: string): Promise<void> {
    try {
      const payload: NotificationInput = JSON.parse(message);
      console.log('[Notification Processor] Received message:', payload);

      await this.createNotification(payload);
    } catch (error) {
      console.error('[Notification Processor] Error handling message:', error);
    }
  }

  /**
   * Create notification from message payload
   */
  private async createNotification(payload: NotificationInput): Promise<void> {
    const { title, message, link, type } = payload;

    console.log(`[Notification Processor] Creating notification: ${title}`);

    try {
      const notification = await NotificationService.create({
        title,
        message,
        link,
        type,
      });

      console.log(`[Notification Processor] Successfully created notification with ID: ${notification.id}`);
    } catch (error) {
      console.error('[Notification Processor] Error creating notification:', error);
      // Don't throw - just log the error and continue
    }
  }
}

