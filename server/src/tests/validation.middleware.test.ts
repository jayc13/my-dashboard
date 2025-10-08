/**
 * Validation Middleware Tests
 *
 * Tests for validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import { validateIdParam, validateRequiredBodyFields } from '../middleware/validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('validateIdParam', () => {
    it('should call next when id is valid', () => {
      mockRequest.params = { id: '123' };

      const middleware = validateIdParam('id');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.params!.id).toBe('123');
    });

    it('should call next with error when id is invalid', () => {
      mockRequest.params = { id: 'invalid' };

      const middleware = validateIdParam('id');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should use default param name "id"', () => {
      mockRequest.params = { id: '456' };

      const middleware = validateIdParam();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateRequiredBodyFields', () => {
    it('should call next when all required fields are present', () => {
      mockRequest.body = { name: 'Test', email: 'test@example.com' };

      const middleware = validateRequiredBodyFields(['name', 'email']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next with error when required fields are missing', () => {
      mockRequest.body = { name: 'Test' };

      const middleware = validateRequiredBodyFields(['name', 'email']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle empty body', () => {
      mockRequest.body = {};

      const middleware = validateRequiredBodyFields(['name']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

