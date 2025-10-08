/**
 * FCM Service Tests
 * 
 * Tests for FCMService
 */

import { FCMService } from '../services/fcm.service';
import { db } from '../db/database';

// Mock dependencies
jest.mock('../db/database');
jest.mock('../config/firebase-config', () => ({
  initializeFirebase: jest.fn(() => ({
    messaging: () => ({
      send: jest.fn().mockResolvedValue('message-id'),
      sendEachForMulticast: jest.fn().mockResolvedValue({
        successCount: 2,
        failureCount: 0,
      }),
    }),
  })),
}));

describe('FCMService', () => {
  const mockDb = db as jest.Mocked<typeof db>;
  let service: FCMService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FCMService();
  });

  describe('sendToToken', () => {
    it('should send notification to token', async () => {
      const message = {
        title: 'Test Notification',
        body: 'Test message',
        data: { key: 'value' },
        link: 'https://example.com',
      };

      const result = await service.sendToToken('test-token', message);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const mockAdmin = require('../config/firebase-config').initializeFirebase();
      mockAdmin.messaging().send.mockRejectedValue(new Error('Send error'));

      const message = {
        title: 'Test Notification',
        body: 'Test message',
        data: {},
      };

      const result = await service.sendToToken('test-token', message);

      expect(result).toBe(false);
    });
  });

  describe('sendToMultipleTokens', () => {
    it('should send notification to multiple tokens', async () => {
      const message = {
        title: 'Test Notification',
        body: 'Test message',
        data: {},
      };

      const result = await service.sendToMultipleTokens(['token1', 'token2'], message);

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });

    it('should return zero counts for empty token list', async () => {
      const message = {
        title: 'Test Notification',
        body: 'Test message',
        data: {},
      };

      const result = await service.sendToMultipleTokens([], message);

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });
  });

  describe('registerToken', () => {
    it('should register device token', async () => {
      const mockResult = { insertId: 1 };
      const mockToken = {
        id: 1,
        token: 'test-token',
        created_at: '2025-10-08T10:00:00Z',
      };

      mockDb.run.mockResolvedValue(mockResult);
      mockDb.get.mockResolvedValue(mockToken);

      const result = await service.registerToken('test-token');

      expect(result).toBeDefined();
      expect(result.token).toBe('test-token');
    });
  });

  describe('unregisterToken', () => {
    it('should unregister device token', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await service.unregisterToken('test-token');

      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe('getAllTokens', () => {
    it('should return all device tokens', async () => {
      const mockTokens = [
        { id: 1, token: 'token1', created_at: '2025-10-08T10:00:00Z' },
        { id: 2, token: 'token2', created_at: '2025-10-08T11:00:00Z' },
      ];

      mockDb.all.mockResolvedValue(mockTokens);

      const result = await service.getAllTokens();

      expect(result).toHaveLength(2);
    });
  });

  describe('sendToAllDevices', () => {
    it('should send notification to all devices', async () => {
      const mockTokens = [
        { id: 1, token: 'token1', created_at: '2025-10-08T10:00:00Z' },
        { id: 2, token: 'token2', created_at: '2025-10-08T11:00:00Z' },
      ];

      mockDb.all.mockResolvedValue(mockTokens);

      const message = {
        title: 'Test Notification',
        body: 'Test message',
        data: {},
      };

      const result = await service.sendToAllDevices(message);

      expect(result.successCount).toBe(2);
    });
  });
});

