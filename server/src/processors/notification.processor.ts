import { getRedisSubscriber } from '../config/redis';
import { NotificationService } from '../services/notification.service';
import { NotificationInput } from '@my-dashboard/types/notifications';
import { Logger } from '../utils/logger';
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
    Logger.info('[Notification Processor] Starting...');

    // Subscribe to the channel
    await this.subscriber.subscribe(this.CHANNEL_NAME);
    Logger.info('[Notification Processor] Subscribed to channel', { channel: this.CHANNEL_NAME });

    // Handle incoming messages
    this.subscriber.on('message', async (channel, message) => {
      if (channel === this.CHANNEL_NAME) {
        await this.handleMessage(message);
      }
    });

    Logger.info('[Notification Processor] Started successfully');
  }

  /**
   * Stop the processor
   */
  public async stop(): Promise<void> {
    Logger.info('[Notification Processor] Stopping...');
    await this.subscriber.unsubscribe(this.CHANNEL_NAME);
    Logger.info('[Notification Processor] Stopped');
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: string): Promise<void> {
    try {
      const payload: NotificationInput = JSON.parse(message);
      Logger.debug('[Notification Processor] Received message', { payload });

      await this.createNotification(payload);
    } catch (error) {
      Logger.error('[Notification Processor] Error handling message', { error });
    }
  }

  /**
   * Create notification from message payload
   */
  private async createNotification(payload: NotificationInput): Promise<void> {
    const { title, message, link, type } = payload;

    Logger.info('[Notification Processor] Creating notification', { title, type });

    try {
      const notification = await NotificationService.create({
        title,
        message,
        link,
        type,
      });

      Logger.info('[Notification Processor] Successfully created notification', {
        notificationId: notification.id,
        title
      });
    } catch (error) {
      Logger.error('[Notification Processor] Error creating notification', { title, error });
      // Don't throw - just log the error and continue
    }
  }
}

