import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { NotificationInput } from '../types';

export class NotificationController {
  static async create(req: Request, res: Response) {
    const { title, message, type, link } = req.body;
    if (!title || !message || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newNotification: NotificationInput = {
      title,
      message,
      link,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const notification = await NotificationService.create(newNotification);
    res.status(201).json(notification);
  }

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