/**
 * Error Handler Middleware Tests
 * 
 * Tests for error handler middleware
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/error_handler';
import { AppError, ValidationError, NotFoundError } from '../../errors/AppError';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/test',
      query: {},
      body: {},
      ip: '127.0.0.1',
      get: jest.fn(),
      connection: { remoteAddress: '127.0.0.1' } as any,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should handle AppError', () => {
    const error = new AppError('Test error', 400, true, 'TEST_ERROR');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Test error',
          code: 'TEST_ERROR',
          statusCode: 400,
        }),
      })
    );
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Validation failed');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
        }),
      })
    );
  });

  it('should handle NotFoundError', () => {
    const error = new NotFoundError('User', 123);

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });

  it('should handle generic Error', () => {
    const error = new Error('Generic error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Generic error',
          statusCode: 500,
        }),
      })
    );
  });

  it('should include stack trace in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          stack: expect.any(String),
        }),
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('should not include stack trace in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.error.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});

