import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getAll(_req: Request, res: Response) {
    const notifications = await NotificationService.getAll();

    res.json(notifications);
  }

  static async markAsRead(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await NotificationService.markAsRead(id);
    res.status(204).send();
  }

  static async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await NotificationService.delete(id);
    res.status(204).send();
  }
}