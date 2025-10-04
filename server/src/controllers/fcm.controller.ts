import { Request, Response, NextFunction } from 'express';
import { FCMService } from '../services/fcm.service';
import { ValidationError, InternalServerError } from '../errors/AppError';
import { validateRequiredFields, validateAndSanitizeString } from '../utils/validation';

export class FCMController {
  private fcmService: FCMService;

  constructor() {
    this.fcmService = new FCMService();
  }

  /**
   * Register a device token for push notifications
   */
  registerToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      // Validate required fields
      validateRequiredFields(req.body, ['token']);

      // Validate and sanitize token
      const sanitizedToken = validateAndSanitizeString(token, 'token', {
        required: true,
        min: 10,
        max: 500,
      });

      const success = await this.fcmService.registerDeviceToken(sanitizedToken!);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Device token registered successfully',
        });
      } else {
        throw new InternalServerError('Failed to register device token');
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        next(new InternalServerError('Failed to register device token', error as Error));
      }
    }
  };
}
