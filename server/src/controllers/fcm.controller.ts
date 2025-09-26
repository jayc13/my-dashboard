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
}
