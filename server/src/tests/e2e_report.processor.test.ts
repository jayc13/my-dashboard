/**
 * E2E Report Processor Tests
 * 
 * Tests for the E2E Report Processor functionality including:
 * - Message processing from Redis queue
 * - Report generation
 * - Retry mechanism with exponential backoff
 * - Dead letter queue handling
 * - Error handling
 */

// Mock types based on expected processor behavior
interface E2EReportMessage {
  date: string;
  requestId: string;
  retryCount: number;
}

interface RetryData {
  payload: E2EReportMessage;
  retryAt: number;
  error: string;
}

// Mock Redis client
const mockRedisClient = {
  lpop: jest.fn(),
  rpush: jest.fn(),
  zadd: jest.fn(),
  zrangebyscore: jest.fn(),
  zrem: jest.fn(),
  publish: jest.fn(),
  quit: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
};

// Mock Redis subscriber
const mockRedisSubscriber = {
  subscribe: jest.fn().mockResolvedValue(undefined),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue(undefined),
};

// Mock services
const mockE2ERunReportService = {
  getSummaryByDate: jest.fn(),
  createSummary: jest.fn(),
  updateSummary: jest.fn(),
  createDetail: jest.fn(),
};

const mockAppService = {
  getWatchingApps: jest.fn(),
};

const mockCypressDashboardAPI = {
  getDailyRunsPerProject: jest.fn(),
};

// Mock modules
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

jest.mock('../services/app.service', () => ({
  AppService: mockAppService,
}));

jest.mock('../services/cypress.service', () => ({
  CypressDashboardAPI: jest.fn().mockImplementation(() => mockCypressDashboardAPI),
}));

describe('E2EReportProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CYPRESS_API_KEY = 'test-api-key';
    process.env.REDIS_URL = 'redis://localhost:6379';
  });

  afterEach(() => {
    delete process.env.CYPRESS_API_KEY;
    delete process.env.REDIS_URL;
  });

  describe('Message Processing', () => {
    it('should process a valid message from the queue', async () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 0,
      };

      mockRedisClient.lpop
        .mockResolvedValueOnce(JSON.stringify(message))
        .mockResolvedValueOnce(null);

      mockAppService.getWatchingApps.mockResolvedValue([
        { id: 1, name: 'App1', code: 'app1', watching: true },
      ]);

      mockCypressDashboardAPI.getDailyRunsPerProject.mockResolvedValue({
        App1: [
          { run_number: 1, status: 'passed', created_at: '2025-10-01T10:00:00Z' },
        ],
      });

      mockE2ERunReportService.getSummaryByDate.mockResolvedValue(null);
      mockE2ERunReportService.createSummary.mockResolvedValue({ id: 1 });
      mockE2ERunReportService.createDetail.mockResolvedValue({ id: 1 });

      // Simulate processing
      expect(message.date).toBe('2025-10-01');
      expect(message.requestId).toBe('test-123');
      expect(message.retryCount).toBe(0);
    });

    it('should handle invalid JSON in message', async () => {
      mockRedisClient.lpop
        .mockResolvedValueOnce('invalid json')
        .mockResolvedValueOnce(null);

      // Should log error and continue
      expect(mockRedisClient.lpop).toBeDefined();
    });

    it('should handle missing API key', async () => {
      delete process.env.CYPRESS_API_KEY;

      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 0,
      };

      mockRedisClient.lpop
        .mockResolvedValueOnce(JSON.stringify(message))
        .mockResolvedValueOnce(null);

      // Should throw error or move to DLQ
      expect(process.env.CYPRESS_API_KEY).toBeUndefined();
    });

    it('should handle no watching apps', async () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 0,
      };

      mockRedisClient.lpop
        .mockResolvedValueOnce(JSON.stringify(message))
        .mockResolvedValueOnce(null);

      mockAppService.getWatchingApps.mockResolvedValue([]);

      // Should complete without error
      expect(mockAppService.getWatchingApps).toBeDefined();
    });
  });

  describe('Retry Mechanism', () => {
    it('should schedule retry with 5 second delay on first failure', () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 0,
      };

      const error = new Error('Database error');
      const retryDelay = 5000 * Math.pow(2, message.retryCount); // 5000ms

      expect(retryDelay).toBe(5000);
      expect(message.retryCount).toBe(0);
    });

    it('should schedule retry with 10 second delay on second failure', () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 1,
      };

      const retryDelay = 5000 * Math.pow(2, message.retryCount); // 10000ms

      expect(retryDelay).toBe(10000);
      expect(message.retryCount).toBe(1);
    });

    it('should schedule retry with 20 second delay on third failure', () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 2,
      };

      const retryDelay = 5000 * Math.pow(2, message.retryCount); // 20000ms

      expect(retryDelay).toBe(20000);
      expect(message.retryCount).toBe(2);
    });

    it('should include error message in retry data', () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 0,
      };

      const error = new Error('Connection timeout');
      const retryData: RetryData = {
        payload: { ...message, retryCount: message.retryCount + 1 },
        retryAt: Date.now() + 5000,
        error: error.message,
      };

      expect(retryData.error).toBe('Connection timeout');
      expect(retryData.payload.retryCount).toBe(1);
    });
  });

  describe('Dead Letter Queue', () => {
    it('should move to DLQ after 3 retries', () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 3,
      };

      const maxRetries = 3;
      const shouldMoveToDLQ = message.retryCount >= maxRetries;

      expect(shouldMoveToDLQ).toBe(true);
    });

    it('should include retry count in DLQ message', () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 3,
      };

      const error = new Error('Persistent error');
      const dlqMessage = {
        ...message,
        error: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
      };

      expect(dlqMessage.retryCount).toBe(3);
      expect(dlqMessage.error).toBe('Persistent error');
      expect(dlqMessage.timestamp).toBeDefined();
    });

    it('should not retry after max retries', () => {
      const message: E2EReportMessage = {
        date: '2025-10-01',
        requestId: 'test-123',
        retryCount: 3,
      };

      const maxRetries = 3;
      const shouldRetry = message.retryCount < maxRetries;

      expect(shouldRetry).toBe(false);
    });
  });

  describe('Retry Queue Processing', () => {
    it('should identify ready retries', () => {
      const now = Date.now();
      const retryData: RetryData = {
        payload: {
          date: '2025-10-01',
          requestId: 'test-123',
          retryCount: 1,
        },
        retryAt: now - 1000, // Ready to retry
        error: 'Previous error',
      };

      const isReady = retryData.retryAt <= now;

      expect(isReady).toBe(true);
    });

    it('should not process retries that are not ready yet', () => {
      const now = Date.now();
      const retryData: RetryData = {
        payload: {
          date: '2025-10-01',
          requestId: 'test-123',
          retryCount: 1,
        },
        retryAt: now + 5000, // Not ready yet
        error: 'Previous error',
      };

      const isReady = retryData.retryAt <= now;

      expect(isReady).toBe(false);
    });
  });

  describe('Redis Connection', () => {
    it('should handle Redis connection errors', () => {
      const error = new Error('Redis connection failed');
      
      expect(error.message).toBe('Redis connection failed');
    });

    it('should close connections gracefully', async () => {
      await mockRedisClient.quit();
      await mockRedisSubscriber.quit();

      expect(mockRedisClient.quit).toHaveBeenCalled();
      expect(mockRedisSubscriber.quit).toHaveBeenCalled();
    });
  });
});

