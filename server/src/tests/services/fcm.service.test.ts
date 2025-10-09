/**
 * FCM Service Tests
 *
 * Tests for FCMService including:
 * - Sending notifications to single/multiple tokens
 * - Device token management
 * - Error handling
 */

import { db } from '../../db/database';

// Mock dependencies
jest.mock('../../db/database');

const mockMessaging = {
  send: jest.fn(),
  sendEachForMulticast: jest.fn(),
};

const mockAdmin = {
  messaging: jest.fn(() => mockMessaging),
};

jest.mock('../../config/firebase-config', () => ({
  initializeFirebase: jest.fn(() => mockAdmin),
}));

import { FCMService } from '../../services/fcm.service';

describe('FCMService', () => {
  const mockDb = db as jest.Mocked<typeof db>;
  let fcmService: FCMService;

  beforeEach(() => {
    jest.clearAllMocks();
    fcmService = new FCMService();
  });

  describe('sendToToken', () => {
    it('should send notification to a single token successfully', async () => {
      const token = 'test-token-123';
      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' },
        link: 'https://example.com',
      };

      mockMessaging.send.mockResolvedValue('message-id-123');

      const result = await fcmService.sendToToken(token, message);

      expect(result).toBe(true);
      expect(mockMessaging.send).toHaveBeenCalledWith({
        notification: {
          title: 'Test Title',
          body: 'Test Body',
        },
        data: {
          key: 'value',
          link: 'https://example.com',
        },
        token: 'test-token-123',
      });
    });

    it('should handle missing link in message', async () => {
      const token = 'test-token-123';
      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' },
      };

      mockMessaging.send.mockResolvedValue('message-id-123');

      const result = await fcmService.sendToToken(token, message);

      expect(result).toBe(true);
      expect(mockMessaging.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            link: '',
          }),
        }),
      );
    });

    it('should return false when sending fails', async () => {
      const token = 'test-token-123';
      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: {},
      };

      mockMessaging.send.mockRejectedValue(new Error('FCM error'));

      const result = await fcmService.sendToToken(token, message);

      expect(result).toBe(false);
    });
  });

  describe('sendToMultipleTokens', () => {
    it('should send notification to multiple tokens successfully', async () => {
      const tokens = ['token1', 'token2', 'token3'];
      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' },
        link: 'https://example.com',
      };

      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 3,
        failureCount: 0,
        responses: [
          { success: true },
          { success: true },
          { success: true },
        ],
      });

      const result = await fcmService.sendToMultipleTokens(tokens, message);

      expect(result).toEqual({ successCount: 3, failureCount: 0 });
      expect(mockMessaging.sendEachForMulticast).toHaveBeenCalledWith({
        notification: {
          title: 'Test Title',
          body: 'Test Body',
        },
        data: {
          key: 'value',
          link: 'https://example.com',
        },
        tokens: ['token1', 'token2', 'token3'],
      });
    });

    it('should return zero counts for empty token array', async () => {
      const tokens: string[] = [];
      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: {},
      };

      const result = await fcmService.sendToMultipleTokens(tokens, message);

      expect(result).toEqual({ successCount: 0, failureCount: 0 });
      expect(mockMessaging.sendEachForMulticast).not.toHaveBeenCalled();
    });

    it('should handle partial failures and remove invalid tokens', async () => {
      const tokens = ['token1', 'token2', 'token3'];
      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: {},
      };

      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 2,
        failureCount: 1,
        responses: [
          { success: true },
          { success: false, error: new Error('Invalid token') },
          { success: true },
        ],
      });

      mockDb.run.mockResolvedValue({ affectedRows: 1, insertId: undefined });

      const result = await fcmService.sendToMultipleTokens(tokens, message);

      expect(result).toEqual({ successCount: 2, failureCount: 1 });
      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM device_tokens WHERE token IN (?)',
        ['token2'],
      );
    });

    it('should handle complete failure', async () => {
      const tokens = ['token1', 'token2'];
      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: {},
      };

      mockMessaging.sendEachForMulticast.mockRejectedValue(new Error('Network error'));

      const result = await fcmService.sendToMultipleTokens(tokens, message);

      expect(result).toEqual({ successCount: 0, failureCount: 2 });
    });
  });

  describe('sendToAllDevices', () => {
    it('should send notification to all registered devices', async () => {
      const mockTokens = [
        { token: 'token1' },
        { token: 'token2' },
        { token: 'token3' },
      ];

      mockDb.all.mockResolvedValue(mockTokens);
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 3,
        failureCount: 0,
        responses: [
          { success: true },
          { success: true },
          { success: true },
        ],
      });

      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: {},
      };

      const result = await fcmService.sendToAllDevices(message);

      expect(result).toEqual({ successCount: 3, failureCount: 0 });
      expect(mockDb.all).toHaveBeenCalledWith('SELECT token FROM device_tokens ORDER BY last_used DESC');
    });

    it('should return zero counts when no devices are registered', async () => {
      mockDb.all.mockResolvedValue([]);

      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: {},
      };

      const result = await fcmService.sendToAllDevices(message);

      expect(result).toEqual({ successCount: 0, failureCount: 0 });
      expect(mockMessaging.sendEachForMulticast).not.toHaveBeenCalled();
    });

    it('should handle errors when fetching tokens', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      const message = {
        title: 'Test Title',
        body: 'Test Body',
        data: {},
      };

      const result = await fcmService.sendToAllDevices(message);

      expect(result).toEqual({ successCount: 0, failureCount: 0 });
    });
  });

  describe('registerDeviceToken', () => {
    it('should register a new device token', async () => {
      const token = 'new-token-123';

      mockDb.get.mockResolvedValue(undefined);
      mockDb.run.mockResolvedValue({ affectedRows: 1, insertId: 1 });

      const result = await fcmService.registerDeviceToken(token);

      expect(result).toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM device_tokens WHERE token = ?',
        [token],
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO device_tokens (token, created_at, last_used) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [token],
      );
    });

    it('should update existing device token timestamp', async () => {
      const token = 'existing-token-123';

      mockDb.get.mockResolvedValue({
        id: 1,
        token: 'existing-token-123',
        created_at: '2025-01-01',
        last_used: '2025-01-01',
      });
      mockDb.run.mockResolvedValue({ affectedRows: 1, insertId: undefined });

      const result = await fcmService.registerDeviceToken(token);

      expect(result).toBe(true);
      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE device_tokens SET last_used = CURRENT_TIMESTAMP WHERE token = ?',
        [token],
      );
    });


    it('should return false when registration fails', async () => {
      const token = 'new-token-123';

      mockDb.get.mockRejectedValue(new Error('Database error'));

      const result = await fcmService.registerDeviceToken(token);

      expect(result).toBe(false);
    });
  });

  describe('getAllDeviceTokens', () => {
    it('should return all device tokens', async () => {
      const mockRows = [
        { token: 'token1' },
        { token: 'token2' },
        { token: 'token3' },
      ];

      mockDb.all.mockResolvedValue(mockRows);

      const result = await fcmService.getAllDeviceTokens();

      expect(result).toEqual(['token1', 'token2', 'token3']);
      expect(mockDb.all).toHaveBeenCalledWith('SELECT token FROM device_tokens ORDER BY last_used DESC');
    });

    it('should return empty array when no tokens exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await fcmService.getAllDeviceTokens();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      const result = await fcmService.getAllDeviceTokens();

      expect(result).toEqual([]);
    });
  });

  describe('removeInvalidTokens', () => {
    it('should remove multiple invalid tokens', async () => {
      const tokens = ['token1', 'token2', 'token3'];

      mockDb.run.mockResolvedValue({ affectedRows: 3, insertId: undefined });

      await fcmService.removeInvalidTokens(tokens);

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM device_tokens WHERE token IN (?,?,?)',
        tokens,
      );
    });

    it('should do nothing for empty token array', async () => {
      const tokens: string[] = [];

      await fcmService.removeInvalidTokens(tokens);

      expect(mockDb.run).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const tokens = ['token1', 'token2'];

      mockDb.run.mockRejectedValue(new Error('Database error'));

      await expect(fcmService.removeInvalidTokens(tokens)).resolves.not.toThrow();
    });
  });

  describe('removeDeviceToken', () => {
    it('should remove a specific device token', async () => {
      const token = 'token-to-remove';

      mockDb.run.mockResolvedValue({ affectedRows: 1, insertId: undefined });

      const result = await fcmService.removeDeviceToken(token);

      expect(result).toBe(true);
      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM device_tokens WHERE token = ?',
        [token],
      );
    });

    it('should return false on database error', async () => {
      const token = 'token-to-remove';

      mockDb.run.mockRejectedValue(new Error('Database error'));

      const result = await fcmService.removeDeviceToken(token);

      expect(result).toBe(false);
    });
  });
});


