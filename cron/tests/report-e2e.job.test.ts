/**
 * Report E2E Job Tests
 * 
 * Tests for the E2E report generation job including:
 * - Publishing E2E report requests
 * - Date formatting
 * - Request ID generation
 * - Redis message publishing
 * - Error handling
 */

import { DateTime } from 'luxon';

// Mock dependencies
const mockPublish = jest.fn().mockResolvedValue(1);
const mockRedisClient = {
  publish: mockPublish,
  on: jest.fn(),
  quit: jest.fn(),
};

jest.mock('../src/utils/redis', () => ({
  getRedisClient: jest.fn(() => mockRedisClient),
  testRedisConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('Report E2E Job', () => {
  let reportE2eJob: () => Promise<void>;
  let publishE2EReportRequest: (date: string, requestId?: string) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    const jobModule = require('../src/jobs/report-e2e.job');
    reportE2eJob = jobModule.default;
    publishE2EReportRequest = jobModule.publishE2EReportRequest;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publishE2EReportRequest', () => {
    it('should publish message to Redis with date and requestId', async () => {
      const date = '2025-10-01';
      const requestId = 'test-request-123';

      await publishE2EReportRequest(date, requestId);

      expect(mockPublish).toHaveBeenCalledWith(
        'e2e:report:generate',
        JSON.stringify({
          date,
          requestId,
        })
      );
    });

    it('should publish message without requestId if not provided', async () => {
      const date = '2025-10-01';

      await publishE2EReportRequest(date);

      expect(mockPublish).toHaveBeenCalledWith(
        'e2e:report:generate',
        JSON.stringify({
          date,
          requestId: undefined,
        })
      );
    });

    it('should handle different date formats', async () => {
      const date = '2025-12-31';
      const requestId = 'test-request-456';

      await publishE2EReportRequest(date, requestId);

      expect(mockPublish).toHaveBeenCalledWith(
        'e2e:report:generate',
        JSON.stringify({
          date,
          requestId,
        })
      );
    });

    it('should handle Redis publish errors', async () => {
      mockPublish.mockRejectedValueOnce(new Error('Redis connection failed'));

      await expect(publishE2EReportRequest('2025-10-01', 'test-123')).rejects.toThrow(
        'Redis connection failed'
      );
    });
  });

  describe('reportE2eJob', () => {
    it('should generate UUID and publish report request', async () => {
      await reportE2eJob();

      expect(mockPublish).toHaveBeenCalledTimes(1);
      expect(mockPublish).toHaveBeenCalledWith(
        'e2e:report:generate',
        expect.stringContaining('test-uuid-1234')
      );
    });

    it('should use current date in ISO format', async () => {
      const mockDate = DateTime.fromISO('2025-10-02T15:30:00Z');
      jest.spyOn(DateTime, 'now').mockReturnValue(mockDate as any);

      await reportE2eJob();

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(publishedMessage.date).toBe('2025-10-02');
    });

    it('should include requestId in published message', async () => {
      await reportE2eJob();

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(publishedMessage.requestId).toBe('test-uuid-1234');
    });

    it('should handle errors gracefully', async () => {
      mockPublish.mockRejectedValueOnce(new Error('Publish failed'));

      await expect(reportE2eJob()).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error running E2E Report job:',
        expect.any(Error)
      );
    });

    it('should log job execution details', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await reportE2eJob();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('='.repeat(60)));
      expect(consoleSpy).toHaveBeenCalledWith('Publishing E2E Report Request');
    });

    it('should return undefined', async () => {
      const result = await reportE2eJob();

      expect(result).toBeUndefined();
    });

    it('should handle timezone correctly', async () => {
      const mockDate = DateTime.fromISO('2025-10-02T23:59:59-05:00');
      jest.spyOn(DateTime, 'now').mockReturnValue(mockDate as any);

      await reportE2eJob();

      const publishedMessage = JSON.parse(mockPublish.mock.calls[0][1]);
      // Should convert to UTC and extract date
      expect(publishedMessage.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should publish to correct Redis channel', async () => {
      await reportE2eJob();

      expect(mockPublish).toHaveBeenCalledWith(
        'e2e:report:generate',
        expect.any(String)
      );
    });

    it('should generate valid JSON message', async () => {
      await reportE2eJob();

      const messageString = mockPublish.mock.calls[0][1];
      expect(() => JSON.parse(messageString)).not.toThrow();

      const message = JSON.parse(messageString);
      expect(message).toHaveProperty('date');
      expect(message).toHaveProperty('requestId');
    });
  });

  describe('Message Format', () => {
    it('should create message with correct structure', async () => {
      await reportE2eJob();

      const messageString = mockPublish.mock.calls[0][1];
      const message = JSON.parse(messageString);

      expect(message).toEqual({
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        requestId: 'test-uuid-1234',
      });
    });

    it('should use ISO date format (YYYY-MM-DD)', async () => {
      await reportE2eJob();

      const messageString = mockPublish.mock.calls[0][1];
      const message = JSON.parse(messageString);

      expect(message.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

