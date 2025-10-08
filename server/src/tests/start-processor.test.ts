/**
 * Start Processor Tests
 * 
 * Tests for start-processor
 */

import { startProcessors } from '../processors/start-processor';

// Mock dependencies
jest.mock('../processors/notification.processor', () => ({
  NotificationProcessor: {
    getInstance: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}));

jest.mock('../processors/pull-request.processor', () => ({
  PullRequestProcessor: {
    getInstance: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}));

jest.mock('../processors/e2e_report.processor', () => ({
  E2EReportProcessor: {
    getInstance: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}));

describe('Start Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startProcessors', () => {
    it('should start all processors', async () => {
      const NotificationProcessor = require('../processors/notification.processor').NotificationProcessor;
      const PullRequestProcessor = require('../processors/pull-request.processor').PullRequestProcessor;
      const E2EReportProcessor = require('../processors/e2e_report.processor').E2EReportProcessor;

      await startProcessors();

      expect(NotificationProcessor.getInstance).toHaveBeenCalled();
      expect(PullRequestProcessor.getInstance).toHaveBeenCalled();
      expect(E2EReportProcessor.getInstance).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const NotificationProcessor = require('../processors/notification.processor').NotificationProcessor;
      NotificationProcessor.getInstance.mockImplementation(() => {
        throw new Error('Processor error');
      });

      await expect(startProcessors()).rejects.toThrow();
    });
  });
});

