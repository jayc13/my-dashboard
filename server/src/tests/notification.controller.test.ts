/**
 * Notification Controller Tests
 * 
 * Tests for NotificationController including:
 * - Get all notifications
 * - Mark as read
 * - Delete notification
 */

import { Request, Response, NextFunction } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';

// Mock dependencies
jest.mock('../services/notification.service');

describe('NotificationController', () => {
  let controller: NotificationController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new NotificationController();
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all notifications', async () => {
      const mockNotifications = [
        { id: 1, title: 'Notification 1', message: 'Message 1', type: 'info', isRead: false },
        { id: 2, title: 'Notification 2', message: 'Message 2', type: 'warning', isRead: true },
      ];

      (NotificationService.getAll as jest.Mock).mockResolvedValue(mockNotifications);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(NotificationService.getAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications,
      });
    });

    it('should call next with error on failure', async () => {
      (NotificationService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockRequest.params = { id: '1' };
      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(undefined);

      await controller.markAsRead(mockRequest as Request, mockResponse as Response, mockNext);

      expect(NotificationService.markAsRead).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification marked as read',
      });
    });

    it('should call next with error for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.markAsRead(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      mockRequest.params = { id: '1' };
      (NotificationService.delete as jest.Mock).mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(NotificationService.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification deleted successfully',
      });
    });

    it('should call next with error for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

