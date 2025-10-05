/**
 * Notification Job Tests
 * 
 * Tests for the notification job producer functionality including:
 * - Publishing notification messages to Redis
 * - Message structure validation
 * - Error handling
 */

import { publishNotificationRequest } from '../src/services/notification.service';

// Mock Redis client
const mockPublish = jest.fn();
const mockRedisClient = {
  publish: mockPublish,
  quit: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
};

// Mock getRedisClient
jest.mock('../src/utils/redis', () => ({
  getRedisClient: jest.fn(() => mockRedisClient),
}));

describe('Notification Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('publishNotificationRequest', () => {
    it('should publish a notification message to Redis', async () => {
      mockPublish.mockResolvedValue(1);

      await publishNotificationRequest({
        title: 'Test Notification',
        message: 'This is a test message',
        type: 'info',
        link: '/test',
      });

      expect(mockPublish).toHaveBeenCalledTimes(1);
      expect(mockPublish).toHaveBeenCalledWith(
        'notification:create',
        expect.stringContaining('Test Notification'),
      );

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(publishedMessage.title).toBe('Test Notification');
      expect(publishedMessage.message).toBe('This is a test message');
      expect(publishedMessage.type).toBe('info');
      expect(publishedMessage.link).toBe('/test');
    });

    it('should publish notification without optional fields', async () => {
      mockPublish.mockResolvedValue(1);

      await publishNotificationRequest({
        title: 'Simple Notification',
        message: 'Simple message',
        type: 'success',
      });

      expect(mockPublish).toHaveBeenCalledTimes(1);

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(publishedMessage.title).toBe('Simple Notification');
      expect(publishedMessage.message).toBe('Simple message');
      expect(publishedMessage.type).toBe('success');
      expect(publishedMessage.link).toBeUndefined();
    });

    it('should handle success notification type', async () => {
      mockPublish.mockResolvedValue(1);

      await publishNotificationRequest({
        title: 'Success',
        message: 'Operation completed',
        type: 'success',
      });

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(publishedMessage.type).toBe('success');
    });

    it('should handle error notification type', async () => {
      mockPublish.mockResolvedValue(1);

      await publishNotificationRequest({
        title: 'Error',
        message: 'Operation failed',
        type: 'error',
      });

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(publishedMessage.type).toBe('error');
    });

    it('should handle info notification type', async () => {
      mockPublish.mockResolvedValue(1);

      await publishNotificationRequest({
        title: 'Info',
        message: 'Information message',
        type: 'info',
      });

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(publishedMessage.type).toBe('info');
    });

    it('should handle warning notification type', async () => {
      mockPublish.mockResolvedValue(1);

      await publishNotificationRequest({
        title: 'Warning',
        message: 'Warning message',
        type: 'warning',
      });

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(publishedMessage.type).toBe('warning');
    });

    it('should publish to correct Redis channel', async () => {
      mockPublish.mockResolvedValue(1);

      await publishNotificationRequest({
        title: 'Test',
        message: 'Test message',
        type: 'info',
      });

      expect(mockPublish).toHaveBeenCalledWith(
        'notification:create',
        expect.any(String),
      );
    });

    it('should handle Redis publish errors', async () => {
      mockPublish.mockRejectedValue(new Error('Redis connection failed'));

      await expect(
        publishNotificationRequest({
          title: 'Test',
          message: 'Test message',
          type: 'error',
        }),
      ).rejects.toThrow('Redis connection failed');
    });

    it('should include all fields in published message', async () => {
      mockPublish.mockResolvedValue(1);

      const title = 'Complete Notification';
      const message = 'Complete message';
      const type = 'warning';
      const link = '/complete';

      await publishNotificationRequest({ title, message, type, link });

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      
      expect(publishedMessage).toHaveProperty('title', title);
      expect(publishedMessage).toHaveProperty('message', message);
      expect(publishedMessage).toHaveProperty('type', type);
      expect(publishedMessage).toHaveProperty('link', link);
    });

    it('should create valid JSON message', async () => {
      mockPublish.mockResolvedValue(1);

      await publishNotificationRequest({
        title: 'JSON Test',
        message: 'Testing JSON structure',
        type: 'info',
      });

      const messageString = mockPublish.mock.calls[0][1];
      
      // Should be valid JSON
      expect(() => JSON.parse(messageString)).not.toThrow();
      
      const parsed = JSON.parse(messageString);
      expect(typeof parsed).toBe('object');
      expect(parsed).not.toBeNull();
    });
  });
});

