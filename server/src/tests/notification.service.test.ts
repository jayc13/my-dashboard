/**
 * Notification Service Tests
 * 
 * Tests for NotificationService including:
 * - Get all notifications
 * - Get one notification
 * - Create notification
 * - Mark as read
 * - Delete notification
 */

import { NotificationService } from '../services/notification.service';
import { db } from '../db/database';
import { FCMService } from '../services/fcm.service';

// Mock dependencies
jest.mock('../db/database');
jest.mock('../services/fcm.service');

describe('NotificationService', () => {
  const mockDb = db as jest.Mocked<typeof db>;
  let mockFCMService: jest.Mocked<FCMService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFCMService = {
      sendToAllDevices: jest.fn().mockResolvedValue(undefined),
    } as any;
    (FCMService as jest.MockedClass<typeof FCMService>).mockImplementation(() => mockFCMService);
  });

  describe('getAll', () => {
    it('should return all notifications ordered by created_at DESC', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Notification 1',
          message: 'Message 1',
          link: 'https://example.com',
          type: 'info',
          is_read: 0,
          created_at: '2025-10-08T10:00:00Z',
        },
        {
          id: 2,
          title: 'Notification 2',
          message: 'Message 2',
          link: null,
          type: 'warning',
          is_read: 1,
          created_at: '2025-10-08T09:00:00Z',
        },
      ];

      mockDb.all.mockResolvedValue(mockRows);

      const result = await NotificationService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].isRead).toBe(false);
      expect(result[1].id).toBe(2);
      expect(result[1].isRead).toBe(true);
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM notifications ORDER BY created_at DESC');
    });

    it('should return empty array when no notifications exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await NotificationService.getAll();

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      await expect(NotificationService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getOne', () => {
    it('should return notification by id', async () => {
      const mockRow = {
        id: 1,
        title: 'Notification 1',
        message: 'Message 1',
        link: 'https://example.com',
        type: 'info',
        is_read: 0,
        created_at: '2025-10-08T10:00:00Z',
      };

      mockDb.get.mockResolvedValue(mockRow);

      const result = await NotificationService.getOne(1);

      expect(result.id).toBe(1);
      expect(result.title).toBe('Notification 1');
      expect(result.isRead).toBe(false);
      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM notifications WHERE id = ?', [1]);
    });

    it('should throw error when notification not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      await expect(NotificationService.getOne(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create notification and send FCM', async () => {
      const input = {
        title: 'New Notification',
        message: 'New message',
        link: 'https://example.com',
        type: 'info' as const,
      };

      const mockResult = { insertId: 1 };
      const mockCreatedNotification = {
        id: 1,
        title: 'New Notification',
        message: 'New message',
        link: 'https://example.com',
        type: 'info',
        is_read: 0,
        created_at: '2025-10-08T10:00:00Z',
      };

      mockDb.run.mockResolvedValue(mockResult);
      mockDb.get.mockResolvedValue(mockCreatedNotification);

      const result = await NotificationService.create(input);

      expect(result.id).toBe(1);
      expect(result.title).toBe('New Notification');
      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO notifications (title, message, link, type) VALUES (?, ?, ?, ?)',
        ['New Notification', 'New message', 'https://example.com', 'info'],
      );
      expect(mockFCMService.sendToAllDevices).toHaveBeenCalledWith({
        title: 'New Notification',
        body: 'New message',
        data: {
          notificationId: '1',
          type: 'info',
        },
        link: 'https://example.com',
      });
    });

    it('should create notification without link', async () => {
      const input = {
        title: 'New Notification',
        message: 'New message',
        type: 'warning' as const,
      };

      const mockResult = { insertId: 2 };
      const mockCreatedNotification = {
        id: 2,
        title: 'New Notification',
        message: 'New message',
        link: null,
        type: 'warning',
        is_read: 0,
        created_at: '2025-10-08T10:00:00Z',
      };

      mockDb.run.mockResolvedValue(mockResult);
      mockDb.get.mockResolvedValue(mockCreatedNotification);

      const result = await NotificationService.create(input);

      expect(result.id).toBe(2);
      expect(result.link).toBeUndefined();
    });

    it('should not fail if FCM sending fails', async () => {
      const input = {
        title: 'New Notification',
        message: 'New message',
        type: 'info' as const,
      };

      const mockResult = { insertId: 1 };
      const mockCreatedNotification = {
        id: 1,
        title: 'New Notification',
        message: 'New message',
        link: null,
        type: 'info',
        is_read: 0,
        created_at: '2025-10-08T10:00:00Z',
      };

      mockDb.run.mockResolvedValue(mockResult);
      mockDb.get.mockResolvedValue(mockCreatedNotification);
      mockFCMService.sendToAllDevices.mockRejectedValue(new Error('FCM error'));

      const result = await NotificationService.create(input);

      expect(result.id).toBe(1);
      // Should not throw even though FCM failed
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockResult = { changes: 1 };
      mockDb.run.mockResolvedValue(mockResult);

      await NotificationService.markAsRead(1);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE notifications SET is_read = 1 WHERE id = ?',
        [1],
      );
    });

    it('should throw error when database update fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Database error'));

      await expect(NotificationService.markAsRead(1)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      const mockResult = { changes: 1 };
      mockDb.run.mockResolvedValue(mockResult);

      await NotificationService.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM notifications WHERE id = ?', [1]);
    });

    it('should throw error when database delete fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Database error'));

      await expect(NotificationService.delete(1)).rejects.toThrow('Database error');
    });
  });
});

