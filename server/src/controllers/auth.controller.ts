import { Request, Response } from 'express';
import { bruteForceProtection } from '../middleware/bruteForceProtection';
import crypto from 'crypto';

export class AuthController {
  /**
   * Validate API key endpoint
   * POST /api/auth/validate
   * Body: { apiKey: string }
   */
  validateApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { apiKey } = req.body;

      // Input validation
      if (!apiKey || typeof apiKey !== 'string') {
        bruteForceProtection.recordFailedAttempt(req);
        res.status(400).json({
          valid: false,
          error: 'API key is required and must be a string',
        });
        return;
      }

      // Check for empty or whitespace-only keys
      if (!apiKey.trim()) {
        bruteForceProtection.recordFailedAttempt(req);
        res.status(400).json({
          valid: false,
          error: 'API key cannot be empty',
        });
        return;
      }

      const validApiKey = process.env.API_SECURITY_KEY;

      if (!validApiKey) {
        console.error('API_SECURITY_KEY environment variable is not set');
        res.status(500).json({
          valid: false,
          error: 'Server configuration error',
        });
        return;
      }

      // Use constant-time comparison to prevent timing attacks
      const providedKeyBuffer = Buffer.from(apiKey, 'utf8');
      const validKeyBuffer = Buffer.from(validApiKey, 'utf8');

      // Ensure buffers are the same length to prevent timing attacks
      const isLengthValid = providedKeyBuffer.length === validKeyBuffer.length;
      const isContentValid = isLengthValid && crypto.timingSafeEqual(providedKeyBuffer, validKeyBuffer);

      if (isContentValid) {
        // Clear failed attempts on successful authentication
        bruteForceProtection.clearFailedAttempts(req);

        res.status(200).json({
          valid: true,
          message: 'API key is valid',
        });
      } else {
        // Record failed attempt
        bruteForceProtection.recordFailedAttempt(req);

        // Log failed attempt for monitoring
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
        const attemptCount = bruteForceProtection.getAttemptCount(req);
        console.warn(`Failed API key validation attempt from IP: ${clientIP}, attempt count: ${attemptCount}`);

        res.status(401).json({
          valid: false,
          error: 'Invalid API key',
        });
      }
    } catch (error) {
      console.error('Error in validateApiKey:', error);

      // Record as failed attempt in case of errors
      bruteForceProtection.recordFailedAttempt(req);

      res.status(500).json({
        valid: false,
        error: 'Internal server error',
      });
    }
  };
}
