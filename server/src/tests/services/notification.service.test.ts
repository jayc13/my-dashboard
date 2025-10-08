/**
 * Notification Service Tests
 * 
 * Tests for NotificationService including:
 * - CRUD operations for notifications
 * - FCM integration
 */

import { NotificationService } from '../../services/notification.service';
import { FCMService } from '../../services/fcm.service';
import { db } from '../../db/database';

// Mock dependencies
jest.mock('../../db/database');
jest.mock('../../services/fcm.service');

describe('NotificationService', () => {
  const mockDb = db as jest.Mocked<typeof db>;
  let mockFCMService: jest.Mocked<FCMService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFCMService = {
      sendToAllDevices: jest.fn(),
    } as any;
    (FCMService as jest.MockedClass<typeof FCMService>).mockImplementation(() => mockFCMService);
  });

  describe('getAll', () => {
    it('should fetch all notifications ordered by created_at DESC', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Notification 1',
          message: 'Message 1',
          link: 'https://example.com/1',
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
          created_at: '2025-10-07T10:00:00Z',
        },
      ];

      mockDb.all.mockResolvedValue(mockRows);

      const result = await NotificationService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Notification 1',
        message: 'Message 1',
        link: 'https://example.com/1',
        type: 'info',
        isRead: false,
        createdAt: '2025-10-08T10:00:00Z',
      });
      expect(result[1].isRead).toBe(true);
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM notifications ORDER BY created_at DESC');
    });

    it('should throw error when database query fails', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      await expect(NotificationService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create notification and send FCM message', async () => {
      const newNotification = {
        title: 'New Notification',
        message: 'New Message',
        link: 'https://example.com',
        type: 'info' as const,
      };

      mockDb.run.mockResolvedValue({ insertId: 1, affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 1,
        title: 'New Notification',
        message: 'New Message',
        link: 'https://example.com',
        type: 'info',
        is_read: 0,
        created_at: '2025-10-08T10:00:00Z',
      });

      mockFCMService.sendToAllDevices.mockResolvedValue({
        successCount: 5,
        failureCount: 0,
      });

      const result = await NotificationService.create(newNotification);

      expect(result).toEqual({
        id: 1,
        title: 'New Notification',
        message: 'New Message',
        link: 'https://example.com',
        type: 'info',
        isRead: false,
        createdAt: '2025-10-08T10:00:00Z',
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO notifications (title, message, link, type) VALUES (?, ?, ?, ?)',
        ['New Notification', 'New Message', 'https://example.com', 'info'],
      );

      expect(mockFCMService.sendToAllDevices).toHaveBeenCalledWith({
        title: 'New Notification',
        body: 'New Message',
        data: {
          notificationId: '1',
          type: 'info',
        },
        link: 'https://example.com',
      });
    });

    it('should create notification without link', async () => {
      const newNotification = {
        title: 'Simple Notification',
        message: 'Simple Message',
        type: 'warning' as const,
      };

      mockDb.run.mockResolvedValue({ insertId: 2, affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 2,
        title: 'Simple Notification',
        message: 'Simple Message',
        link: null,
        type: 'warning',
        is_read: 0,
        created_at: '2025-10-08T10:00:00Z',
      });

      mockFCMService.sendToAllDevices.mockResolvedValue({
        successCount: 3,
        failureCount: 0,
      });

      const result = await NotificationService.create(newNotification);

      expect(result.link).toBeNull();
      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO notifications (title, message, link, type) VALUES (?, ?, ?, ?)',
        ['Simple Notification', 'Simple Message', undefined, 'warning'],
      );
    });

    it('should create notification even if FCM fails', async () => {
      const newNotification = {
        title: 'Test Notification',
        message: 'Test Message',
        type: 'error' as const,
      };

      mockDb.run.mockResolvedValue({ insertId: 3, affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 3,
        title: 'Test Notification',
        message: 'Test Message',
        link: null,
        type: 'error',
        is_read: 0,
        created_at: '2025-10-08T10:00:00Z',
      });

      mockFCMService.sendToAllDevices.mockRejectedValue(new Error('FCM error'));

      const result = await NotificationService.create(newNotification);

      expect(result).toBeDefined();
      expect(result.id).toBe(3);
      // Should not throw error even though FCM failed
    });

    it('should throw error when database insert fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Insert failed'));

      await expect(NotificationService.create({
        title: 'Test',
        message: 'Test',
        type: 'info',
      })).rejects.toThrow('Insert failed');
    });
  });

  describe('getOne', () => {
    it('should fetch notification by id', async () => {
      const mockRow = {
        id: 1,
        title: 'Test Notification',
        message: 'Test Message',
        link: 'https://example.com',
        type: 'info',
        is_read: 0,
        created_at: '2025-10-08T10:00:00Z',
      };

      mockDb.get.mockResolvedValue(mockRow);

      const result = await NotificationService.getOne(1);

      expect(result).toEqual({
        id: 1,
        title: 'Test Notification',
        message: 'Test Message',
        link: 'https://example.com',
        type: 'info',
        isRead: false,
        createdAt: '2025-10-08T10:00:00Z',
      });
      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM notifications WHERE id = ?', [1]);
    });

    it('should throw error when notification not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      await expect(NotificationService.getOne(999)).rejects.toThrow('Notification not found');
    });

    it('should throw error when database query fails', async () => {
      mockDb.get.mockRejectedValue(new Error('Database error'));

      await expect(NotificationService.getOne(1)).rejects.toThrow('Database error');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockDb.run.mockResolvedValue({ affectedRows: 1 });

      await NotificationService.markAsRead(1);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE notifications SET is_read = 1 WHERE id = ?',
        [1],
      );
    });

    it('should not throw error when notification not found', async () => {
      mockDb.run.mockResolvedValue({ affectedRows: 0 });

      await expect(NotificationService.markAsRead(999)).resolves.not.toThrow();
    });

    it('should throw error when database update fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Update failed'));

      await expect(NotificationService.markAsRead(1)).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete notification successfully', async () => {
      mockDb.run.mockResolvedValue({ affectedRows: 1 });

      await NotificationService.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM notifications WHERE id = ?', [1]);
    });

    it('should not throw error when notification not found', async () => {
      mockDb.run.mockResolvedValue({ affectedRows: 0 });

      await expect(NotificationService.delete(999)).resolves.not.toThrow();
    });

    it('should throw error when database delete fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Delete failed'));

      await expect(NotificationService.delete(1)).rejects.toThrow('Delete failed');
    });
  });
});

