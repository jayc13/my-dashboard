import { Router } from 'express';
import { FCMController } from '../controllers/fcm.controller';

export function createFCMRouter() {
  const router = Router();
  const fcmController = new FCMController();

  // Register device token for push notifications
  router.post('/register-token', fcmController.registerToken);

  return router;
}
