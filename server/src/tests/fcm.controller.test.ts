/**
 * FCM Controller Tests
 * 
 * Tests for FCMController including:
 * - Register device token
 * - Unregister device token
 * - Get all device tokens
 */

import { Request, Response, NextFunction } from 'express';
import { FCMController } from '../controllers/fcm.controller';
import { FCMService } from '../services/fcm.service';

// Mock dependencies
jest.mock('../services/fcm.service');

describe('FCMController', () => {
  let controller: FCMController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockFCMService: jest.Mocked<FCMService>;

  beforeEach(() => {
    mockFCMService = {
      registerToken: jest.fn(),
      unregisterToken: jest.fn(),
      getAllTokens: jest.fn(),
    } as any;

    (FCMService as jest.MockedClass<typeof FCMService>).mockImplementation(() => mockFCMService);

    controller = new FCMController();
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

  describe('registerToken', () => {
    it('should register device token', async () => {
      mockRequest.body = { token: 'test-token' };
      mockFCMService.registerToken.mockResolvedValue({ id: 1, token: 'test-token', createdAt: new Date().toISOString() });

      await controller.registerToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFCMService.registerToken).toHaveBeenCalledWith('test-token');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });

    it('should call next with error when token is missing', async () => {
      mockRequest.body = {};

      await controller.registerToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('unregisterToken', () => {
    it('should unregister device token', async () => {
      mockRequest.body = { token: 'test-token' };
      mockFCMService.unregisterToken.mockResolvedValue(undefined);

      await controller.unregisterToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFCMService.unregisterToken).toHaveBeenCalledWith('test-token');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token unregistered successfully',
      });
    });

    it('should call next with error when token is missing', async () => {
      mockRequest.body = {};

      await controller.unregisterToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAllTokens', () => {
    it('should return all device tokens', async () => {
      const mockTokens = [
        { id: 1, token: 'token1', createdAt: '2025-10-08T10:00:00Z' },
        { id: 2, token: 'token2', createdAt: '2025-10-08T11:00:00Z' },
      ];

      mockFCMService.getAllTokens.mockResolvedValue(mockTokens);

      await controller.getAllTokens(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFCMService.getAllTokens).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTokens,
      });
    });

    it('should call next with error on failure', async () => {
      mockFCMService.getAllTokens.mockRejectedValue(new Error('DB error'));

      await controller.getAllTokens(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

