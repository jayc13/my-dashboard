import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';


export function createNotificationRouter() {
  const router = Router();

  router.get('/', NotificationController.getAll);
  router.patch('/:id/read', NotificationController.markAsRead);
  router.delete('/:id', NotificationController.delete);

  return router;
}