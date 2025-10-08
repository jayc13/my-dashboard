/**
 * Start Processor Tests
 *
 * Tests for start-processor
 */

import { startProcessor } from '../../processors/start-processor';

// Mock dependencies
jest.mock('../../processors/notification.processor', () => ({
  NotificationProcessor: {
    getInstance: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}));

jest.mock('../../processors/pull-request.processor', () => ({
  PullRequestProcessor: {
    getInstance: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}));

jest.mock('../../processors/e2e_report.processor', () => ({
  E2EReportProcessor: {
    getInstance: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}));

jest.mock('../../config/redis', () => ({
  testRedisConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../db/mysql', () => ({
  testMySQLConnection: jest.fn().mockResolvedValue(true),
}));

describe('Start Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startProcessor', () => {
    it('should start all processors', async () => {
      const NotificationProcessor = require('../../processors/notification.processor').NotificationProcessor;
      const PullRequestProcessor = require('../../processors/pull-request.processor').PullRequestProcessor;
      const E2EReportProcessor = require('../../processors/e2e_report.processor').E2EReportProcessor;

      await startProcessor();

      expect(NotificationProcessor.getInstance).toHaveBeenCalled();
      expect(PullRequestProcessor.getInstance).toHaveBeenCalled();
      expect(E2EReportProcessor.getInstance).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      const { testRedisConnection } = require('../../config/redis');
      testRedisConnection.mockResolvedValue(false);

      await startProcessor();

      // Should not throw, just log error
      expect(testRedisConnection).toHaveBeenCalled();
    });
  });
});

