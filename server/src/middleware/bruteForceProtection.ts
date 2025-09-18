import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import * as dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config({ quiet: true });

// In-memory store for tracking failed attempts per IP
interface FailedAttempt {
  count: number;
  firstAttempt: Date;
  lastAttempt: Date;
  blockedUntil?: Date;
}

class BruteForceProtection {
  private failedAttempts: Map<string, FailedAttempt> = new Map();
  private readonly maxAttempts = parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS || '3', 10);
  private readonly windowMs = parseInt(process.env.BRUTE_FORCE_WINDOW_MS || `${15 * 60 * 1000}`, 10); // 15 minutes
  private readonly blockDurationMs = 30 * 60 * 1000; // 30 minutes
  private readonly cleanupInterval = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Clean up old entries periodically
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  private cleanup(): void {
    const now = new Date();
    for (const [ip, attempt] of this.failedAttempts.entries()) {
      // Remove entries older than the window or unblocked entries
      if (
        now.getTime() - attempt.lastAttempt.getTime() > this.windowMs ||
        (attempt.blockedUntil && now > attempt.blockedUntil)
      ) {
        this.failedAttempts.delete(ip);
      }
    }
  }

  private getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  // Middleware to check if IP is currently blocked
  checkBlocked = (req: Request, res: Response, next: NextFunction): void => {
    const ip = this.getClientIP(req);
    const attempt = this.failedAttempts.get(ip);

    if (attempt?.blockedUntil && new Date() < attempt.blockedUntil) {
      const remainingTime = Math.ceil((attempt.blockedUntil.getTime() - Date.now()) / 1000 / 60);
      res.status(429).json({
        valid: false,
        error: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
        retryAfter: remainingTime * 60,
      });
      return;
    }

    next();
  };

  // Record a failed attempt
  recordFailedAttempt = (req: Request): void => {
    const ip = this.getClientIP(req);
    const now = new Date();
    const existing = this.failedAttempts.get(ip);

    if (existing) {
      // Reset count if outside the window
      if (now.getTime() - existing.firstAttempt.getTime() > this.windowMs) {
        this.failedAttempts.set(ip, {
          count: 1,
          firstAttempt: now,
          lastAttempt: now,
        });
      } else {
        existing.count++;
        existing.lastAttempt = now;

        // Block if max attempts reached
        if (existing.count >= this.maxAttempts) {
          existing.blockedUntil = new Date(now.getTime() + this.blockDurationMs);
        }
      }
    } else {
      this.failedAttempts.set(ip, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    }
  };

  // Clear failed attempts for successful login
  clearFailedAttempts = (req: Request): void => {
    const ip = this.getClientIP(req);
    this.failedAttempts.delete(ip);
  };

  // Get current attempt count for an IP
  getAttemptCount = (req: Request): number => {
    const ip = this.getClientIP(req);
    const attempt = this.failedAttempts.get(ip);
    return attempt?.count || 0;
  };
}

// Create singleton instance
export const bruteForceProtection = new BruteForceProtection();

// Rate limiting middleware - general protection
export const authRateLimit = rateLimit({
  windowMs: parseInt(process.env.BRUTE_FORCE_WINDOW_MS || `${15 * 60 * 1000}`, 10), // Default: 15 minutes
  max: parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS || '3', 10), // Limit each IP to 10 requests per windowMs
  message: 'Too many authentication requests. Please try again later.',
  // Skip successful requests
  skipSuccessfulRequests: true,
});

// Slow down middleware - progressive delays
export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 3, // Allow 3 requests per windowMs without delay
  delayMs: (hits) => hits * 1000, // Add 1 second delay per request after delayAfter
  maxDelayMs: 10000, // Maximum delay of 10 seconds
});

// Additional security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent timing attacks by adding random delay
  const randomDelay = Math.floor(Math.random() * 100) + 50; // 50-150ms
  
  setTimeout(() => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
  }, randomDelay);
};
