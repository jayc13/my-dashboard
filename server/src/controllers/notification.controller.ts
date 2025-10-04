import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { DatabaseError } from '../errors/AppError';
import { validateId } from '../utils/validation';

export class NotificationController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationService.getAll();
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(new DatabaseError('Failed to fetch notifications', error as Error));
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = validateId(req.params.id, 'id');

      // Note: Service should ideally return whether the notification was found
      await NotificationService.markAsRead(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = validateId(req.params.id, 'id');

      // Note: Service should ideally return whether the notification was found
      await NotificationService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}