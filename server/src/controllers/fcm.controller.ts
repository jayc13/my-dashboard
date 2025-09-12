import { Request, Response } from 'express';
import { FCMService } from '../services/fcm.service';

export class FCMController {
  private fcmService: FCMService;

  constructor() {
    this.fcmService = new FCMService();
  }

  /**
   * Register a device token for push notifications
   */
  registerToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Device token is required' });
      }

      const success = await this.fcmService.registerDeviceToken(token);

      if (success) {
        res.status(200).json({ message: 'Device token registered successfully' });
      } else {
        res.status(500).json({ error: 'Failed to register device token' });
      }
    } catch (error) {
      console.error('Error in registerToken:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Unregister a device token
   */
  unregisterToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Device token is required' });
      }

      const success = await this.fcmService.removeDeviceToken(token);

      if (success) {
        res.status(200).json({ message: 'Device token unregistered successfully' });
      } else {
        res.status(500).json({ error: 'Failed to unregister device token' });
      }
    } catch (error) {
      console.error('Error in unregisterToken:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Send a test notification to all devices
   */
  sendTestNotification = async (req: Request, res: Response) => {
    try {
      const { title, body, data, link } = req.body;

      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
      }

      const result = await this.fcmService.sendToAllDevices({
        title,
        body,
        data,
        link,
      });

      res.status(200).json({
        message: 'Test notification sent',
        successCount: result.successCount,
        failureCount: result.failureCount,
      });
    } catch (error) {
      console.error('Error in sendTestNotification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get all registered device tokens (for debugging)
   */
  getTokens = async (req: Request, res: Response) => {
    try {
      const tokens = await this.fcmService.getAllDeviceTokens();
      res.status(200).json({ tokens, count: tokens.length });
    } catch (error) {
      console.error('Error in getTokens:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
