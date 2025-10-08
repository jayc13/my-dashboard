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
      registerDeviceToken: jest.fn(),
      unregisterDeviceToken: jest.fn(),
      getAllDeviceTokens: jest.fn(),
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
      mockRequest.body = { token: 'test-token-that-is-long-enough' };
      mockFCMService.registerDeviceToken.mockResolvedValue(true);

      await controller.registerToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFCMService.registerDeviceToken).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Device token registered successfully',
      });
    });

    it('should call next with error when token is missing', async () => {
      mockRequest.body = {};

      await controller.registerToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

