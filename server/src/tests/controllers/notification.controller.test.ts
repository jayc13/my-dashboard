/**
 * Notification Controller Tests
 * 
 * Tests for NotificationController including:
 * - Get all notifications
 * - Mark notification as read
 * - Delete notification
 */

import { Request, Response, NextFunction } from 'express';
import { NotificationController } from '../../controllers/notification.controller';
import { NotificationService } from '../../services/notification.service';
import { DatabaseError } from '../../errors/AppError';

// Mock dependencies
jest.mock('../../services/notification.service');

describe('NotificationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
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

      await NotificationController.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(NotificationService.getAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications,
      });
    });

    it('should call next with DatabaseError when service throws error', async () => {
      (NotificationService.getAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await NotificationController.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockRequest.params = { id: '1' };
      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(undefined);

      await NotificationController.markAsRead(mockRequest as Request, mockResponse as Response, mockNext);

      expect(NotificationService.markAsRead).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should call next with error when id is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await NotificationController.markAsRead(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error when service throws error', async () => {
      mockRequest.params = { id: '1' };
      (NotificationService.markAsRead as jest.Mock).mockRejectedValue(new Error('Database error'));

      await NotificationController.markAsRead(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      mockRequest.params = { id: '1' };
      (NotificationService.delete as jest.Mock).mockResolvedValue(undefined);

      await NotificationController.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(NotificationService.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should call next with error when id is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await NotificationController.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error when service throws error', async () => {
      mockRequest.params = { id: '1' };
      (NotificationService.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      await NotificationController.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

