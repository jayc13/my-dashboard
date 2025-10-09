/**
 * E2E Report Processor Tests
 * 
 * Tests for the E2E Report Processor functionality including:
 * - Static utility methods
 * - Singleton pattern
 * - Message handling
 * - Report generation
 */

// Mock Redis client and subscriber
const mockClient = {
  rpush: jest.fn().mockResolvedValue(1),
  lpop: jest.fn().mockResolvedValue(null),
  zadd: jest.fn().mockResolvedValue(1),
  zrangebyscore: jest.fn().mockResolvedValue([]),
  zrem: jest.fn().mockResolvedValue(1),
  publish: jest.fn().mockResolvedValue(1),
  quit: jest.fn().mockResolvedValue(undefined),
};

const mockSubscriber = {
  subscribe: jest.fn().mockResolvedValue(undefined),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue(undefined),
};

// Mock modules BEFORE imports
jest.mock('../../config/redis', () => ({
  getRedisClient: jest.fn(() => mockClient),
  getRedisSubscriber: jest.fn(() => mockSubscriber),
}));

jest.mock('../../services/e2e_run_report.service');
jest.mock('../../services/app.service');
jest.mock('../../services/cypress.service');

import { E2EReportProcessor, publishE2EReportRequest } from '../../processors/e2e_report.processor';
import { E2ERunReportService } from '../../services/e2e_run_report.service';
import { AppService } from '../../services/app.service';
import { CypressDashboardAPI } from '../../services/cypress.service';
import { getRedisClient } from '../../config/redis';

describe('E2EReportProcessor', () => {
  const mockE2ERunReportService = E2ERunReportService as jest.Mocked<typeof E2ERunReportService>;
  const mockAppService = AppService as jest.Mocked<typeof AppService>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CYPRESS_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.CYPRESS_API_KEY;
  });

  describe('Static Methods', () => {
    describe('getRunStatus', () => {
      it('should return "passed" when all runs passed', () => {
        const runs = [
          { status: 'passed', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
          { status: 'passed', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
        ];

        const status = E2EReportProcessor.getRunStatus(runs as any);

        expect(status).toBe('passed');
      });

      it('should return "failed" when any run failed', () => {
        const runs = [
          { status: 'passed', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
          { status: 'failed', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
        ];

        const status = E2EReportProcessor.getRunStatus(runs as any);

        expect(status).toBe('failed');
      });

      it('should return "failed" when all runs failed', () => {
        const runs = [
          { status: 'failed', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
          { status: 'failed', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
        ];

        const status = E2EReportProcessor.getRunStatus(runs as any);

        expect(status).toBe('failed');
      });

      it('should ignore runs with "noTests" status', () => {
        const runs = [
          { status: 'passed', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
          { status: 'noTests', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
        ];

        const status = E2EReportProcessor.getRunStatus(runs as any);

        expect(status).toBe('passed');
      });

      it('should handle empty runs array', () => {
        const runs: any[] = [];

        const status = E2EReportProcessor.getRunStatus(runs);

        expect(status).toBe('passed');
      });

      it('should handle runs with only "noTests" status', () => {
        const runs = [
          { status: 'noTests', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
          { status: 'noTests', run_number: 1, created_at: '2025-10-08T10:00:00Z' },
        ];

        const status = E2EReportProcessor.getRunStatus(runs as any);

        expect(status).toBe('passed');
      });
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = E2EReportProcessor.getInstance();
      const instance2 = E2EReportProcessor.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create instance successfully', () => {
      const instance = E2EReportProcessor.getInstance();

      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(E2EReportProcessor);
    });
  });

  describe('start', () => {
    it('should subscribe to the e2e:report:generate channel', async () => {
      const processor = E2EReportProcessor.getInstance();

      await processor.start();

      expect(mockSubscriber.subscribe).toHaveBeenCalledWith('e2e:report:generate');
      expect(mockSubscriber.on).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  describe('stop', () => {
    it('should unsubscribe from the e2e:report:generate channel', async () => {
      const processor = E2EReportProcessor.getInstance();

      await processor.stop();

      expect(mockSubscriber.unsubscribe).toHaveBeenCalledWith('e2e:report:generate');
    });
  });

  describe('Message Handling', () => {
    it('should add valid message to queue', async () => {
      const processor = E2EReportProcessor.getInstance();
      await processor.start();

      const message = {
        date: '2025-10-08',
        requestId: 'test-123',
        retryCount: 0,
      };

      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('e2e:report:generate', JSON.stringify(message));

      expect(mockClient.rpush).toHaveBeenCalledWith('e2e:report:queue', JSON.stringify(message));
    });

    it('should handle invalid JSON in message', async () => {
      const processor = E2EReportProcessor.getInstance();
      await processor.start();

      const invalidMessage = 'invalid json';

      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('e2e:report:generate', invalidMessage);

      // Should not add to queue when JSON is invalid
      expect(mockClient.rpush).not.toHaveBeenCalled();
    });

    it('should ignore messages from other channels', async () => {
      const processor = E2EReportProcessor.getInstance();
      await processor.start();

      const message = {
        date: '2025-10-08',
        requestId: 'test-123',
        retryCount: 0,
      };

      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('other:channel', JSON.stringify(message));

      // Should not process messages from other channels
      expect(mockClient.rpush).not.toHaveBeenCalled();
    });

    it('should process message without requestId', async () => {
      const processor = E2EReportProcessor.getInstance();
      await processor.start();

      const message = {
        date: '2025-10-08',
      };

      const messageHandler = mockSubscriber.on.mock.calls[0][1];
      await messageHandler('e2e:report:generate', JSON.stringify(message));

      expect(mockClient.rpush).toHaveBeenCalledWith('e2e:report:queue', JSON.stringify(message));
    });
  });
});

describe('publishE2EReportRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should publish report request with date and requestId', async () => {
    await publishE2EReportRequest('2025-10-08', 'test-123');

    expect(mockClient.publish).toHaveBeenCalledWith(
      'e2e:report:generate',
      JSON.stringify({ date: '2025-10-08', requestId: 'test-123' })
    );
  });

  it('should publish report request with only date', async () => {
    await publishE2EReportRequest('2025-10-08');

    expect(mockClient.publish).toHaveBeenCalledWith(
      'e2e:report:generate',
      JSON.stringify({ date: '2025-10-08', requestId: undefined })
    );
  });

  it('should handle different date formats', async () => {
    await publishE2EReportRequest('2025-12-31', 'year-end');

    expect(mockClient.publish).toHaveBeenCalledWith(
      'e2e:report:generate',
      JSON.stringify({ date: '2025-12-31', requestId: 'year-end' })
    );
  });
});

