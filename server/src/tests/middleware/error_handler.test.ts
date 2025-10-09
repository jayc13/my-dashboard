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

  it('should handle database foreign key constraint errors', () => {
    const error = new Error('foreign key constraint failed');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Invalid reference: Related resource does not exist',
          code: 'FOREIGN_KEY_CONSTRAINT',
        }),
      })
    );
  });

  it('should handle database unique constraint errors', () => {
    const error = new Error('unique constraint violation');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Resource already exists',
          code: 'DUPLICATE_RESOURCE',
        }),
      })
    );
  });

  it('should handle database duplicate entry errors', () => {
    const error = new Error('duplicate entry for key');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'DUPLICATE_RESOURCE',
        }),
      })
    );
  });

  it('should handle database not null constraint errors', () => {
    const error = new Error('not null constraint failed');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Missing required field',
          code: 'MISSING_REQUIRED_FIELD',
        }),
      })
    );
  });

  it('should handle JSON parsing errors', () => {
    const error = new SyntaxError('Unexpected token in JSON at position 0');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        }),
      })
    );
  });

  it('should include request details in error response', () => {
    const error = new Error('Test error');
    mockRequest.method = 'POST';
    mockRequest.path = '/api/test';

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.error.path).toBe('/api/test');
    expect(jsonCall.error.method).toBe('POST');
    expect(jsonCall.error.timestamp).toBeDefined();
  });

  it('should include request ID if present', () => {
    const error = new Error('Test error');
    (mockRequest.get as jest.Mock).mockReturnValue('test-request-id');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.error.requestId).toBe('test-request-id');
  });

  it('should handle errors with details', () => {
    const error = new AppError('Test error', 400, true, 'TEST_ERROR', { field: 'email', reason: 'invalid' });

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.error.details).toEqual({ field: 'email', reason: 'invalid' });
  });

  it('should handle MySQL specific errors', () => {
    const error = new Error('MySQL connection error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Database operation failed',
          code: 'DATABASE_ERROR',
        }),
      })
    );
  });

  it('should handle SQLITE specific errors', () => {
    const error = new Error('SQLITE_ERROR: database is locked');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'DATABASE_ERROR',
        }),
      })
    );
  });

  it('should handle unknown error types', () => {
    const error = { message: 'Unknown error type' };

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
        }),
      })
    );
  });

  it('should set success to false in all error responses', () => {
    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.success).toBe(false);
  });
});




