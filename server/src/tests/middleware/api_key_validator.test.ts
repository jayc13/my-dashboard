/**
 * API Key Validator Middleware Tests
 * 
 * Tests for API key validation middleware including:
 * - Valid API key acceptance
 * - Invalid API key rejection
 * - Missing API key rejection
 * - Health endpoint bypass
 */

import { Request, Response, NextFunction } from 'express';
import apiKeyValidator from '../../middleware/api_key_validator';
import { UnauthorizedError } from '../../errors/AppError';

describe('API Key Validator Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  const originalApiKey = process.env.API_SECURITY_KEY;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
      path: '/api/test',
    };
    mockResponse = {};
    mockNext = jest.fn();
    process.env.API_SECURITY_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env.API_SECURITY_KEY = originalApiKey;
  });

  it('should allow requests with valid API key', () => {
    (mockRequest.header as jest.Mock).mockReturnValue('test-api-key');

    apiKeyValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should reject requests with invalid API key', () => {
    (mockRequest.header as jest.Mock).mockReturnValue('invalid-key');

    apiKeyValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('Invalid or missing API key');
  });

  it('should reject requests with missing API key', () => {
    (mockRequest.header as jest.Mock).mockReturnValue(undefined);

    apiKeyValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should allow /health endpoint without API key', () => {
    mockRequest.path = '/health';
    (mockRequest.header as jest.Mock).mockReturnValue(undefined);

    apiKeyValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should check x-api-key header', () => {
    (mockRequest.header as jest.Mock).mockReturnValue('test-api-key');

    apiKeyValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.header).toHaveBeenCalledWith('x-api-key');
  });
});

