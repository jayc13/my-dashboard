/**
 * Validation Middleware Tests
 *
 * Tests for validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import { validateIdParam, validateRequiredBodyFields } from '../../middleware/validation.middleware';

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

  describe('validateBodyNotEmpty', () => {
    const { validateBodyNotEmpty } = require('../../middleware/validation.middleware');

    it('should call next when body is not empty', () => {
      mockRequest.body = { name: 'Test' };

      validateBodyNotEmpty(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with error when body is empty object', () => {
      mockRequest.body = {};

      validateBodyNotEmpty(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Request body cannot be empty');
    });

    it('should call next with error when body is undefined', () => {
      mockRequest.body = undefined;

      validateBodyNotEmpty(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error when body is null', () => {
      mockRequest.body = null;

      validateBodyNotEmpty(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('validateJsonContentType', () => {
    const { validateJsonContentType } = require('../../middleware/validation.middleware');

    beforeEach(() => {
      mockRequest.get = jest.fn();
    });

    it('should call next when content-type is application/json for POST', () => {
      mockRequest.method = 'POST';
      (mockRequest.get as jest.Mock).mockReturnValue('application/json');

      validateJsonContentType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next when content-type includes charset', () => {
      mockRequest.method = 'POST';
      (mockRequest.get as jest.Mock).mockReturnValue('application/json; charset=utf-8');

      validateJsonContentType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next for GET requests without checking content-type', () => {
      mockRequest.method = 'GET';
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      validateJsonContentType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next for DELETE requests without checking content-type', () => {
      mockRequest.method = 'DELETE';
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      validateJsonContentType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with error when content-type is missing for POST', () => {
      mockRequest.method = 'POST';
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      validateJsonContentType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Invalid content type');
    });

    it('should call next with error when content-type is not JSON for PUT', () => {
      mockRequest.method = 'PUT';
      (mockRequest.get as jest.Mock).mockReturnValue('text/plain');

      validateJsonContentType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error when content-type is not JSON for PATCH', () => {
      mockRequest.method = 'PATCH';
      (mockRequest.get as jest.Mock).mockReturnValue('application/xml');

      validateJsonContentType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('validateQueryParams', () => {
    const { validateQueryParams } = require('../../middleware/validation.middleware');

    it('should call next when all query params are allowed', () => {
      mockRequest.query = { name: 'test', age: '25' };

      const middleware = validateQueryParams(['name', 'age']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with error when unknown params are present', () => {
      mockRequest.query = { name: 'test', unknown: 'value' };

      const middleware = validateQueryParams(['name']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Invalid query parameters');
    });

    it('should call next with error when required params are missing', () => {
      mockRequest.query = { name: 'test' };

      const middleware = validateQueryParams(['name', 'age'], ['age']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Missing required query parameters');
    });

    it('should call next when all required params are present', () => {
      mockRequest.query = { name: 'test', age: '25' };

      const middleware = validateQueryParams(['name', 'age'], ['name', 'age']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle empty query params', () => {
      mockRequest.query = {};

      const middleware = validateQueryParams(['name', 'age']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validatePaginationParams', () => {
    const { validatePaginationParams } = require('../../middleware/validation.middleware');

    it('should use default values when no params provided', () => {
      mockRequest.query = {};

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query.limit).toBe('50');
      expect(mockRequest.query.offset).toBe('0');
    });

    it('should validate and set limit', () => {
      mockRequest.query = { limit: '25' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query.limit).toBe('25');
    });

    it('should call next with error when limit is invalid', () => {
      mockRequest.query = { limit: 'invalid' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Invalid limit parameter');
    });

    it('should call next with error when limit is negative', () => {
      mockRequest.query = { limit: '-10' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error when limit exceeds maximum', () => {
      mockRequest.query = { limit: '150' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Limit exceeds maximum');
    });

    it('should validate and set offset', () => {
      mockRequest.query = { offset: '10' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query.offset).toBe('10');
    });

    it('should call next with error when offset is invalid', () => {
      mockRequest.query = { offset: 'invalid' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Invalid offset parameter');
    });

    it('should call next with error when offset is negative', () => {
      mockRequest.query = { offset: '-5' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should validate page parameter', () => {
      mockRequest.query = { page: '2' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query.page).toBe('2');
    });

    it('should call next with error when page is invalid', () => {
      mockRequest.query = { page: 'invalid' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Invalid page parameter');
    });

    it('should call next with error when page is zero or negative', () => {
      mockRequest.query = { page: '0' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle all pagination params together', () => {
      mockRequest.query = { limit: '20', offset: '40', page: '3' };

      const middleware = validatePaginationParams(50, 100);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query.limit).toBe('20');
      expect(mockRequest.query.offset).toBe('40');
      expect(mockRequest.query.page).toBe('3');
    });
  });

  describe('asyncHandler', () => {
    const { asyncHandler } = require('../../middleware/validation.middleware');

    it('should call async function and resolve successfully', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors', async () => {
      const error = new Error('Sync error');
      const asyncFn = jest.fn().mockImplementation(() => {
        throw error;
      });
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should work with functions that return Response', async () => {
      const asyncFn = jest.fn().mockResolvedValue(mockResponse);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(asyncFn).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});


