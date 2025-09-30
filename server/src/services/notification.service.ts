import { DatabaseRow, db } from '../db/database';
import { Notification, NotificationInput } from '@my-dashboard/types/notifications';
import { FCMService } from './fcm.service';

export class NotificationService {
  private static fcmService = new FCMService();

  static async getAll(): Promise<Notification[]> {
    try {
      const rows = await db.all('SELECT * FROM notifications ORDER BY created_at DESC');
      return rows.map(fromDatabaseRowToNotification);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }
  static async create(inputNotification: NotificationInput): Promise<Notification> {
    const {
      title,
      message,
      link, // Optional, can be undefined
      type,
    } = inputNotification;

    try {
      const result = await db.run(
        'INSERT INTO notifications (title, message, link, type) VALUES (?, ?, ?, ?)',
        [title, message, link, type],
      );

      const newNotification: Notification = await NotificationService.getOne(result.insertId!);

      // Send FCM notification to all devices
      try {
        await NotificationService.fcmService.sendToAllDevices({
          title: newNotification.title,
          body: newNotification.message,
          data: {
            notificationId: newNotification.id?.toString() || '',
            type: newNotification.type,
          },
          link: newNotification.link,
        });
        console.log('FCM notification sent successfully');
      } catch (fcmError) {
        console.error('Failed to send FCM notification:', fcmError);
        // Don't fail the notification creation if FCM fails
      }

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getOne(id: number): Promise<Notification> {
    try {
      const row = await db.get('SELECT * FROM notifications WHERE id = ?', [id]);
      if (!row) {
        throw new Error('Notification not found');
      }
      return fromDatabaseRowToNotification(row);
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  static async markAsRead(id: number): Promise<void> {
    try {
      await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await db.run('DELETE FROM notifications WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

function fromDatabaseRowToNotification(row: DatabaseRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    link: row.link,
    type: row.type,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}