/**
 * Auth Controller Tests
 * 
 * Tests for AuthController including:
 * - Validate API key
 */

import { Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';

// Mock brute force protection
jest.mock('../middleware/bruteForceProtection', () => ({
  bruteForceProtection: {
    recordFailedAttempt: jest.fn(),
    recordSuccessfulAttempt: jest.fn(),
  },
}));

describe('AuthController', () => {
  let controller: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const originalApiKey = process.env.API_SECURITY_KEY;

  beforeEach(() => {
    controller = new AuthController();
    mockRequest = {
      body: {},
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.API_SECURITY_KEY = 'test-api-key';
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.API_SECURITY_KEY = originalApiKey;
  });

  describe('validateApiKey', () => {
    it('should return valid true for correct API key', async () => {
      mockRequest.body = { apiKey: 'test-api-key' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: true,
        message: 'API key is valid',
      });
    });

    it('should return valid false for incorrect API key', async () => {
      mockRequest.body = { apiKey: 'wrong-key' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Invalid API key',
      });
    });

    it('should return error for missing API key', async () => {
      mockRequest.body = {};

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'API key is required and must be a string',
      });
    });

    it('should return error for non-string API key', async () => {
      mockRequest.body = { apiKey: 123 };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'API key is required and must be a string',
      });
    });

    it('should return error for empty API key', async () => {
      mockRequest.body = { apiKey: '   ' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'API key cannot be empty',
      });
    });

    it('should return error when API_SECURITY_KEY is not set', async () => {
      delete process.env.API_SECURITY_KEY;
      mockRequest.body = { apiKey: 'test-key' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Server configuration error',
      });
    });
  });
});

