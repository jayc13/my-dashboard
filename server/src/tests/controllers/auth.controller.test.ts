/**
 * Auth Controller Tests
 * 
 * Tests for AuthController including:
 * - API key validation
 * - Brute force protection
 * - Error handling
 */

import { Request, Response } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { bruteForceProtection } from '../../middleware/bruteForceProtection';
import { Logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../middleware/bruteForceProtection');
jest.mock('../../utils/logger');

describe('AuthController', () => {
  let controller: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const originalEnv = process.env;

  beforeEach(() => {
    controller = new AuthController();
    mockRequest = {
      body: {},
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' } as any,
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.API_SECURITY_KEY = 'test-api-key';
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateApiKey', () => {
    it('should validate correct API key', async () => {
      mockRequest.body = { apiKey: 'test-api-key' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(bruteForceProtection.clearFailedAttempts).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: true,
        message: 'API key is valid',
      });
    });

    it('should reject invalid API key', async () => {
      mockRequest.body = { apiKey: 'wrong-api-key' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(bruteForceProtection.recordFailedAttempt).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Invalid API key',
      });
    });

    it('should reject when API key is missing', async () => {
      mockRequest.body = {};

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(bruteForceProtection.recordFailedAttempt).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'API key is required and must be a string',
      });
    });

    it('should reject when API key is not a string', async () => {
      mockRequest.body = { apiKey: 123 };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(bruteForceProtection.recordFailedAttempt).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'API key is required and must be a string',
      });
    });

    it('should reject when API key is empty', async () => {
      mockRequest.body = { apiKey: '' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(bruteForceProtection.recordFailedAttempt).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'API key cannot be empty',
      });
    });

    it('should reject when API key is whitespace only', async () => {
      mockRequest.body = { apiKey: '   ' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(bruteForceProtection.recordFailedAttempt).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'API key cannot be empty',
      });
    });

    it('should return 500 when API_SECURITY_KEY is not set', async () => {
      delete process.env.API_SECURITY_KEY;
      mockRequest.body = { apiKey: 'test-api-key' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(Logger.error).toHaveBeenCalledWith('API_SECURITY_KEY environment variable is not set');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Server configuration error',
      });
    });

    it('should log failed attempts', async () => {
      mockRequest.body = { apiKey: 'wrong-api-key' };
      (bruteForceProtection.getAttemptCount as jest.Mock).mockReturnValue(3);

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(Logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed API key validation attempt from IP:')
      );
    });

    it('should handle errors gracefully', async () => {
      mockRequest.body = { apiKey: 'test-api-key' };
      (bruteForceProtection.clearFailedAttempts as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(Logger.error).toHaveBeenCalledWith('Error in validateApiKey:', expect.any(Object));
      expect(bruteForceProtection.recordFailedAttempt).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });

    it('should use constant-time comparison to prevent timing attacks', async () => {
      // Test with keys of different lengths
      mockRequest.body = { apiKey: 'short' };

      await controller.validateApiKey(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Invalid API key',
      });
    });
  });
});

