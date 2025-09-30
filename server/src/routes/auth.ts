import { Router, RequestHandler } from 'express';
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
  router.use(authRateLimit as unknown as RequestHandler);
  if (process.env.NODE_ENV === 'production') {
    router.use(authSlowDown as unknown as RequestHandler);
  }

  // Validate API key endpoint with comprehensive protection
  router.post('/validate',
    bruteForceProtection.checkBlocked,
    authController.validateApiKey,
  );

  return router;
}
