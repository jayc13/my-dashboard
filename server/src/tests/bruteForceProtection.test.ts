/**
 * Brute Force Protection Tests
 * 
 * Tests for brute force protection middleware
 */

import { Request, Response, NextFunction } from 'express';
import { bruteForceProtection } from '../middleware/bruteForceProtection';

// Mock redis
jest.mock('../config/redis', () => ({
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    del: jest.fn(),
  })),
}));

describe('Brute Force Protection', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      path: '/api/test',
      connection: { remoteAddress: '127.0.0.1' } as any,
      socket: { remoteAddress: '127.0.0.1' } as any,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('recordFailedAttempt', () => {
    it('should record failed attempt', async () => {
      const mockRedis = require('../config/redis').getRedisClient();
      mockRedis.incr.mockResolvedValue(1);

      await bruteForceProtection.recordFailedAttempt('127.0.0.1');

      expect(mockRedis.incr).toHaveBeenCalled();
      expect(mockRedis.expire).toHaveBeenCalled();
    });
  });

  describe('recordSuccessfulAttempt', () => {
    it('should clear failed attempts', async () => {
      const mockRedis = require('../config/redis').getRedisClient();
      mockRedis.del.mockResolvedValue(1);

      await bruteForceProtection.recordSuccessfulAttempt('127.0.0.1');

      expect(mockRedis.del).toHaveBeenCalled();
    });
  });

  describe('isBlocked', () => {
    it('should return false when not blocked', async () => {
      const mockRedis = require('../config/redis').getRedisClient();
      mockRedis.get.mockResolvedValue('2');

      const result = await bruteForceProtection.isBlocked('127.0.0.1');

      expect(result).toBe(false);
    });

    it('should return true when blocked', async () => {
      const mockRedis = require('../config/redis').getRedisClient();
      mockRedis.get.mockResolvedValue('10');

      const result = await bruteForceProtection.isBlocked('127.0.0.1');

      expect(result).toBe(true);
    });
  });

  describe('middleware', () => {
    it('should call next when not blocked', async () => {
      const mockRedis = require('../config/redis').getRedisClient();
      mockRedis.get.mockResolvedValue('2');

      await bruteForceProtection.middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 429 when blocked', async () => {
      const mockRedis = require('../config/redis').getRedisClient();
      mockRedis.get.mockResolvedValue('10');

      await bruteForceProtection.middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

