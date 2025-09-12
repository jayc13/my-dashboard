import { Router } from 'express';
import { FCMController } from '../controllers/fcm.controller';

export function createFCMRouter() {
  const router = Router();
  const fcmController = new FCMController();

  // Register device token for push notifications
  router.post('/register-token', fcmController.registerToken);

  // Unregister device token
  router.post('/unregister-token', fcmController.unregisterToken);

  // Send test notification (for debugging)
  router.post('/test-notification', fcmController.sendTestNotification);

  // Get all tokens (for debugging)
  router.get('/tokens', fcmController.getTokens);

  return router;
}
