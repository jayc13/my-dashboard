import { initializeFirebase } from '../config/firebase-config';
import { DatabaseRow, db } from '../db/database';

interface FCMMessage {
  title: string;
  body: string;
  data?: { [key: string]: string };
  link?: string;
}

interface DeviceToken {
  id?: number;
  token: string;
  created_at?: string;
  last_used?: string;
}

export class FCMService {
  private admin;

  constructor() {
    this.admin = initializeFirebase();
  }

  /**
   * Send a notification to a specific device token
   */
  async sendToToken(token: string, message: FCMMessage): Promise<boolean> {
    try {
      const payload = {
        notification: {
          title: message.title,
          body: message.body,
        },
        data: {
          ...message.data,
          link: message.link || '',
        },
        token: token,
      };

      const response = await this.admin.messaging().send(payload);
      console.log('Successfully sent message to token:', response);
      return true;
    } catch (error) {
      console.error('Error sending message to token:', error);
      return false;
    }
  }

  /**
   * Send a notification to multiple device tokens
   */
  async sendToMultipleTokens(tokens: string[], message: FCMMessage): Promise<{ successCount: number; failureCount: number }> {
    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const payload = {
        notification: {
          title: message.title,
          body: message.body,
        },
        data: {
          ...message.data,
          link: message.link || '',
        },
        tokens: tokens,
      };

      const response = await this.admin.messaging().sendEachForMulticast(payload);
      console.log(`Successfully sent messages. Success: ${response.successCount}, Failure: ${response.failureCount}`);
      
      // Handle failed tokens (they might be invalid/expired)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });
        
        // Remove invalid tokens from database
        await this.removeInvalidTokens(failedTokens);
      }

      return { successCount: response.successCount, failureCount: response.failureCount };
    } catch (error) {
      console.error('Error sending messages to multiple tokens:', error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }

  /**
   * Send notification to all registered devices
   */
  async sendToAllDevices(message: FCMMessage): Promise<{ successCount: number; failureCount: number }> {
    try {
      const tokens = await this.getAllDeviceTokens();
      if (tokens.length === 0) {
        console.log('No device tokens found');
        return { successCount: 0, failureCount: 0 };
      }

      return await this.sendToMultipleTokens(tokens, message);
    } catch (error) {
      console.error('Error sending to all devices:', error);
      return { successCount: 0, failureCount: 0 };
    }
  }

  /**
   * Register a new device token
   */
  async registerDeviceToken(token: string): Promise<boolean> {
    try {
      // Check if token already exists
      const existingToken = await db.get(
        'SELECT * FROM device_tokens WHERE token = ?',
        [token],
      ) as DeviceToken | undefined;

      if (existingToken) {
        // Update last_used timestamp
        await db.run(
          'UPDATE device_tokens SET last_used = CURRENT_TIMESTAMP WHERE token = ?',
          [token],
        );
        console.log('Updated existing device token');
        return true;
      }

      // Insert new token
      await db.run(
        'INSERT INTO device_tokens (token, created_at, last_used) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [token],
      );

      console.log('Registered new device token');
      return true;
    } catch (error) {
      console.error('Error registering device token:', error);
      return false;
    }
  }

  /**
   * Get all device tokens from database
   */
  async getAllDeviceTokens(): Promise<string[]> {
    try {
      const rows = await db.all('SELECT token FROM device_tokens ORDER BY last_used DESC');
      return rows.map((row: DatabaseRow) => row.token);
    } catch (error) {
      console.error('Error getting device tokens:', error);
      return [];
    }
  }

  /**
   * Remove invalid/expired tokens from database
   */
  async removeInvalidTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) {
      return;
    }

    try {
      const placeholders = tokens.map(() => '?').join(',');

      await db.run(
        `DELETE FROM device_tokens WHERE token IN (${placeholders})`,
        tokens,
      );

      console.log(`Removed ${tokens.length} invalid device tokens`);
    } catch (error) {
      console.error('Error removing invalid tokens:', error);
    }
  }

  /**
   * Remove a specific device token
   */
  async removeDeviceToken(token: string): Promise<boolean> {
    try {
      await db.run('DELETE FROM device_tokens WHERE token = ?', [token]);
      console.log('Removed device token');
      return true;
    } catch (error) {
      console.error('Error removing device token:', error);
      return false;
    }
  }
}
