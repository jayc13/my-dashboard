import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  authRateLimit,
  authSlowDown,
  securityHeaders,
  bruteForceProtection,
} from '../middleware/bruteForceProtection';

export function createAuthRouter() {
  const router = Router();
  const authController = new AuthController();

  // Apply brute force protection middleware to auth routes
  router.use(securityHeaders);
  router.use(authRateLimit);
  router.use(authSlowDown);

  // Validate API key endpoint with comprehensive protection
  router.post('/validate',
    bruteForceProtection.checkBlocked,
    authController.validateApiKey,
  );

  return router;
}
