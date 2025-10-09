/**
 * Notification Processor Tests
 *
 * Tests for the Notification Processor functionality including:
 * - Singleton pattern
 * - Starting and stopping the processor
 * - Message processing from Redis pub/sub
 * - Notification creation
 * - Error handling
 */

// Mock Redis subscriber
const mockSubscriber = {
  subscribe: jest.fn().mockResolvedValue(undefined),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue(undefined),
};

// Mock modules BEFORE imports
jest.mock('../../config/redis', () => ({
  getRedisSubscriber: jest.fn(() => mockSubscriber),
}));

jest.mock('../../config/firebase-config', () => ({
  initializeFirebase: jest.fn(() => ({
    messaging: jest.fn(() => ({
      send: jest.fn(),
      sendEachForMulticast: jest.fn(),
    })),
  })),
}));

jest.mock('../../services/notification.service');

import { NotificationProcessor } from '../../processors/notification.processor';
import { NotificationService } from '../../services/notification.service';

describe('NotificationProcessor', () => {
  const mockNotificationService = NotificationService as jest.Mocked<typeof NotificationService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = NotificationProcessor.getInstance();
      const instance2 = NotificationProcessor.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('start', () => {
    it('should subscribe to the notification channel', async () => {
      const processor = NotificationProcessor.getInstance();

      await processor.start();

      expect(mockSubscriber.subscribe).toHaveBeenCalledWith('notification:create');
      expect(mockSubscriber.on).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  describe('stop', () => {
    it('should unsubscribe from the notification channel', async () => {
      const processor = NotificationProcessor.getInstance();

      await processor.stop();

      expect(mockSubscriber.unsubscribe).toHaveBeenCalledWith('notification:create');
    });
  });

  describe('Message Handling', () => {
    it('should process a valid notification message', async () => {
      const processor = NotificationProcessor.getInstance();
      await processor.start();

      const message = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        link: '/test',
      };

      mockNotificationService.create.mockResolvedValue({
        id: 1,
        title: message.title,
        message: message.message,
        type: message.type,
        link: message.link,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Get the message handler
      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('notification:create', JSON.stringify(message));

      expect(mockNotificationService.create).toHaveBeenCalledWith({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        link: '/test',
      });
    });

    it('should process notification without optional link', async () => {
      const processor = NotificationProcessor.getInstance();
      await processor.start();

      const message = {
        title: 'Simple Notification',
        message: 'Simple message',
        type: 'success',
      };

      mockNotificationService.create.mockResolvedValue({
        id: 2,
        title: message.title,
        message: message.message,
        type: message.type,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('notification:create', JSON.stringify(message));

      expect(mockNotificationService.create).toHaveBeenCalledWith({
        title: 'Simple Notification',
        message: 'Simple message',
        type: 'success',
      });
    });

    it('should handle invalid JSON in message', async () => {
      const processor = NotificationProcessor.getInstance();
      await processor.start();

      const invalidMessage = 'invalid json';

      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('notification:create', invalidMessage);

      // Should not call create when JSON is invalid
      expect(mockNotificationService.create).not.toHaveBeenCalled();
    });

    it('should handle notification creation failure', async () => {
      const processor = NotificationProcessor.getInstance();
      await processor.start();

      const message = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'error',
      };

      mockNotificationService.create.mockRejectedValue(new Error('Database error'));

      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('notification:create', JSON.stringify(message));

      // Should handle error gracefully without throwing
      expect(mockNotificationService.create).toHaveBeenCalled();
    });

    it('should ignore messages from other channels', async () => {
      const processor = NotificationProcessor.getInstance();
      await processor.start();

      const message = {
        title: 'Test',
        message: 'Test',
        type: 'info',
      };

      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('other:channel', JSON.stringify(message));

      // Should not process messages from other channels
      expect(mockNotificationService.create).not.toHaveBeenCalled();
    });
  });
});

