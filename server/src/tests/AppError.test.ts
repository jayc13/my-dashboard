/**
 * AppError Tests
 * 
 * Tests for custom error classes including:
 * - Base AppError class
 * - ValidationError
 * - UnauthorizedError
 * - ForbiddenError
 * - NotFoundError
 * - ConflictError
 * - UnprocessableEntityError
 * - TooManyRequestsError
 * - InternalServerError
 * - ServiceUnavailableError
 * - DatabaseError
 * - ExternalServiceError
 */

import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalServiceError,
} from '../errors/AppError';

describe('AppError', () => {
  describe('Base AppError class', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom values', () => {
      const error = new AppError('Custom error', 400, false, 'CUSTOM_CODE', { key: 'value' });
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.details).toEqual({ key: 'value' });
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have stack trace', () => {
      const error = new AppError('Test error');
      expect(error.stack).toBeDefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new AppError('Test error', 400, true, 'TEST_CODE', { detail: 'info' });
      const json = error.toJSON();
      expect(json).toEqual({
        name: 'AppError',
        message: 'Test error',
        statusCode: 400,
        code: 'TEST_CODE',
        details: { detail: 'info' },
      });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with default message', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should create validation error with custom message', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });

    it('should include validation details', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', details);
      expect(error.details).toEqual(details);
    });

    it('should be instance of AppError', () => {
      const error = new ValidationError();
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
    });

    it('should be instance of AppError', () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Access forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create forbidden error with custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create not found error with resource name', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
    });

    it('should create not found error with resource name and id', () => {
      const error = new NotFoundError('User', 123);
      expect(error.message).toBe("User with id '123' not found");
    });

    it('should handle string ids', () => {
      const error = new NotFoundError('User', 'abc-123');
      expect(error.message).toBe("User with id 'abc-123' not found");
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with default message', () => {
      const error = new ConflictError();
      expect(error.message).toBe('Resource conflict');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });

    it('should create conflict error with custom message', () => {
      const error = new ConflictError('Email already exists');
      expect(error.message).toBe('Email already exists');
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should create unprocessable entity error with default message', () => {
      const error = new UnprocessableEntityError();
      expect(error.message).toBe('Unprocessable entity');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('UNPROCESSABLE_ENTITY');
    });

    it('should create unprocessable entity error with custom message and details', () => {
      const details = { reason: 'Invalid state transition' };
      const error = new UnprocessableEntityError('Cannot process request', details);
      expect(error.message).toBe('Cannot process request');
      expect(error.details).toEqual(details);
    });
  });

  describe('TooManyRequestsError', () => {
    it('should create too many requests error with default message', () => {
      const error = new TooManyRequestsError();
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('TOO_MANY_REQUESTS');
    });

    it('should create too many requests error with retry after', () => {
      const error = new TooManyRequestsError('Rate limit exceeded', 60);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.details).toEqual({ retryAfter: 60 });
    });
  });

  describe('InternalServerError', () => {
    it('should create internal server error with default message', () => {
      const error = new InternalServerError();
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should create internal server error with custom message and details', () => {
      const details = { component: 'database' };
      const error = new InternalServerError('Database connection failed', details);
      expect(error.message).toBe('Database connection failed');
      expect(error.details).toEqual(details);
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create service unavailable error with default message', () => {
      const error = new ServiceUnavailableError();
      expect(error.message).toBe('Service temporarily unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should create service unavailable error with custom message', () => {
      const error = new ServiceUnavailableError('Maintenance in progress');
      expect(error.message).toBe('Maintenance in progress');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with default message', () => {
      const error = new DatabaseError();
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });

    it('should create database error with custom message', () => {
      const error = new DatabaseError('Query failed');
      expect(error.message).toBe('Query failed');
    });

    it('should wrap original error', () => {
      const originalError = new Error('Connection timeout');
      const error = new DatabaseError('Database connection failed', originalError);
      expect(error.message).toBe('Database connection failed');
      expect(error.details).toEqual({ originalMessage: 'Connection timeout' });
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error', () => {
      const error = new ExternalServiceError('GitHub');
      expect(error.message).toBe('GitHub: External service error');
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });

    it('should create external service error with custom message', () => {
      const error = new ExternalServiceError('GitHub', 'API rate limit exceeded');
      expect(error.message).toBe('GitHub: API rate limit exceeded');
    });

    it('should wrap original error', () => {
      const originalError = new Error('Network timeout');
      const error = new ExternalServiceError('GitHub', 'Request failed', originalError);
      expect(error.message).toBe('GitHub: Request failed');
      expect(error.details).toEqual({ originalMessage: 'Network timeout' });
    });
  });
});

