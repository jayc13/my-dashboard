/**
 * Brute Force Protection Middleware Tests
 * 
 * Tests for brute force protection middleware including:
 * - IP blocking after max attempts
 * - Failed attempt tracking
 * - Successful login clearing attempts
 * - Time window expiration
 * - Security headers
 */

import { Request, Response, NextFunction } from 'express';
import { bruteForceProtection, securityHeaders } from '../../middleware/bruteForceProtection';

describe('Brute Force Protection Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockRequest = {
      ip: '192.168.1.1',
      connection: { remoteAddress: '192.168.1.1' } as any,
      socket: { remoteAddress: '192.168.1.1' } as any,
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    
    mockNext = jest.fn();

    // Clear any existing failed attempts
    bruteForceProtection.clearFailedAttempts(mockRequest as Request);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkBlocked middleware', () => {
    it('should allow request when no failed attempts exist', () => {
      bruteForceProtection.checkBlocked(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow request when failed attempts are below threshold', () => {
      // Record 2 failed attempts (below default max of 3)
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);

      bruteForceProtection.checkBlocked(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should block request when max attempts reached', () => {
      // Record 3 failed attempts (default max)
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);

      bruteForceProtection.checkBlocked(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Too many failed attempts'),
          retryAfter: expect.any(Number),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should calculate correct retry time', () => {
      // Record 3 failed attempts to trigger block
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);

      bruteForceProtection.checkBlocked(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.retryAfter).toBeGreaterThan(0);
      expect(jsonCall.error).toMatch(/Try again in \d+ minutes/);
    });

    it('should use different IPs independently', () => {
      const ip1Request = { ...mockRequest, ip: '192.168.1.1' };
      const ip2Request = { ...mockRequest, ip: '192.168.1.2' };

      // Block IP1
      bruteForceProtection.recordFailedAttempt(ip1Request as Request);
      bruteForceProtection.recordFailedAttempt(ip1Request as Request);
      bruteForceProtection.recordFailedAttempt(ip1Request as Request);

      // IP1 should be blocked
      bruteForceProtection.checkBlocked(
        ip1Request as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockResponse.status).toHaveBeenCalledWith(429);

      // IP2 should not be blocked
      jest.clearAllMocks();
      bruteForceProtection.checkBlocked(
        ip2Request as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle missing IP gracefully', () => {
      const noIpRequest = {
        ip: undefined,
        connection: {},
        socket: {},
      };

      bruteForceProtection.checkBlocked(
        noIpRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('recordFailedAttempt', () => {
    it('should record first failed attempt', () => {
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);

      const count = bruteForceProtection.getAttemptCount(mockRequest as Request);
      expect(count).toBe(1);
    });

    it('should increment failed attempt count', () => {
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);

      const count = bruteForceProtection.getAttemptCount(mockRequest as Request);
      expect(count).toBe(2);
    });

    it('should reset count after time window expires', () => {
      // Record first attempt
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      expect(bruteForceProtection.getAttemptCount(mockRequest as Request)).toBe(1);

      // Advance time beyond window (default 15 minutes)
      jest.advanceTimersByTime(16 * 60 * 1000);

      // Record new attempt - should reset to 1
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      expect(bruteForceProtection.getAttemptCount(mockRequest as Request)).toBe(1);
    });

    it('should not reset count within time window', () => {
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      
      // Advance time within window (5 minutes)
      jest.advanceTimersByTime(5 * 60 * 1000);
      
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      expect(bruteForceProtection.getAttemptCount(mockRequest as Request)).toBe(2);
    });

    it('should track multiple IPs separately', () => {
      const ip1Request = { ...mockRequest, ip: '192.168.1.1' };
      const ip2Request = { ...mockRequest, ip: '192.168.1.2' };

      bruteForceProtection.recordFailedAttempt(ip1Request as Request);
      bruteForceProtection.recordFailedAttempt(ip1Request as Request);
      bruteForceProtection.recordFailedAttempt(ip2Request as Request);

      expect(bruteForceProtection.getAttemptCount(ip1Request as Request)).toBe(2);
      expect(bruteForceProtection.getAttemptCount(ip2Request as Request)).toBe(1);
    });
  });

  describe('clearFailedAttempts', () => {
    it('should clear failed attempts for an IP', () => {
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      expect(bruteForceProtection.getAttemptCount(mockRequest as Request)).toBe(2);

      bruteForceProtection.clearFailedAttempts(mockRequest as Request);
      expect(bruteForceProtection.getAttemptCount(mockRequest as Request)).toBe(0);
    });

    it('should not affect other IPs', () => {
      const ip1Request = { ...mockRequest, ip: '192.168.1.1' };
      const ip2Request = { ...mockRequest, ip: '192.168.1.2' };

      // Clear any existing attempts for both IPs
      bruteForceProtection.clearFailedAttempts(ip1Request as Request);
      bruteForceProtection.clearFailedAttempts(ip2Request as Request);

      bruteForceProtection.recordFailedAttempt(ip1Request as Request);
      bruteForceProtection.recordFailedAttempt(ip2Request as Request);

      bruteForceProtection.clearFailedAttempts(ip1Request as Request);

      expect(bruteForceProtection.getAttemptCount(ip1Request as Request)).toBe(0);
      expect(bruteForceProtection.getAttemptCount(ip2Request as Request)).toBe(1);
    });

    it('should handle clearing non-existent IP', () => {
      expect(() => {
        bruteForceProtection.clearFailedAttempts(mockRequest as Request);
      }).not.toThrow();
    });
  });

  describe('getAttemptCount', () => {
    it('should return 0 for IP with no attempts', () => {
      const count = bruteForceProtection.getAttemptCount(mockRequest as Request);
      expect(count).toBe(0);
    });

    it('should return correct count for IP with attempts', () => {
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);

      const count = bruteForceProtection.getAttemptCount(mockRequest as Request);
      expect(count).toBe(3);
    });
  });

  describe('securityHeaders middleware', () => {
    it('should add security headers', (done) => {
      securityHeaders(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for the random delay (50-150ms)
      setTimeout(() => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
        expect(mockNext).toHaveBeenCalled();
        done();
      }, 200);

      jest.advanceTimersByTime(200);
    });

    it('should add random delay between 50-150ms', (done) => {
      const startTime = Date.now();
      
      securityHeaders(
        mockRequest as Request,
        mockResponse as Response,
        () => {
          const elapsed = Date.now() - startTime;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThanOrEqual(150);
          done();
        }
      );

      jest.advanceTimersByTime(150);
    });
  });

  describe('IP extraction', () => {
    it('should use req.ip when available', () => {
      mockRequest.ip = '10.0.0.1';
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      expect(bruteForceProtection.getAttemptCount(mockRequest as Request)).toBe(1);
    });

    it('should fallback to connection.remoteAddress', () => {
      mockRequest.ip = undefined;
      mockRequest.connection = { remoteAddress: '10.0.0.2' } as any;
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      expect(bruteForceProtection.getAttemptCount(mockRequest as Request)).toBe(1);
    });

    it('should fallback to socket.remoteAddress', () => {
      mockRequest.ip = undefined;
      mockRequest.connection = {} as any;
      mockRequest.socket = { remoteAddress: '10.0.0.3' } as any;
      bruteForceProtection.recordFailedAttempt(mockRequest as Request);
      expect(bruteForceProtection.getAttemptCount(mockRequest as Request)).toBe(1);
    });

    it('should use "unknown" when no IP available', () => {
      const noIpRequest = {
        ip: undefined,
        connection: {},
        socket: {},
      };
      
      bruteForceProtection.recordFailedAttempt(noIpRequest as Request);
      expect(bruteForceProtection.getAttemptCount(noIpRequest as Request)).toBe(1);
    });
  });
});

