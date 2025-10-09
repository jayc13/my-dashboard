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
    jest.useFakeTimers();
    process.env.CYPRESS_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.useRealTimers();
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
    });

    it('should set up message handler', async () => {
      const processor = E2EReportProcessor.getInstance();

      await processor.start();

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

  describe('handleMessage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should parse message and call generateReport', async () => {
      const message = JSON.stringify({ date: '2025-10-08' });

      const mockSummary = {
        id: 1,
        date: '2025-10-08',
        status: 'ready',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };

      mockE2ERunReportService.getSummaryByDate = jest.fn().mockResolvedValue(mockSummary);

      const processor = E2EReportProcessor.getInstance();
      await (processor as any).handleMessage(message);

      expect(mockE2ERunReportService.getSummaryByDate).toHaveBeenCalledWith('2025-10-08');
    });

    it('should handle invalid JSON', async () => {
      const message = 'invalid json';

      const processor = E2EReportProcessor.getInstance();
      await (processor as any).handleMessage(message);

      // Should not throw, just log error
      expect(mockE2ERunReportService.getSummaryByDate).not.toHaveBeenCalled();
    });
  });

  describe('generateReport', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.CYPRESS_API_KEY = 'test-api-key';
    });

    it('should skip processing when summary exists and is ready', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-08',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };

      mockE2ERunReportService.getSummaryByDate = jest.fn().mockResolvedValue(mockSummary);

      const processor = E2EReportProcessor.getInstance();
      await (processor as any).generateReport({ date: '2025-10-08' });

      expect(mockE2ERunReportService.getSummaryByDate).toHaveBeenCalledWith('2025-10-08');
      expect(mockE2ERunReportService.createSummary).not.toHaveBeenCalled();
    });

    it('should create new summary when none exists', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-08',
        status: 'pending',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };

      mockE2ERunReportService.getSummaryByDate = jest.fn().mockResolvedValueOnce(null);
      mockE2ERunReportService.createSummary = jest.fn().mockResolvedValue(mockSummary);
      mockE2ERunReportService.deleteDetailsBySummaryId = jest.fn().mockResolvedValue(undefined);
      mockE2ERunReportService.createDetail = jest.fn().mockResolvedValue({ id: 1 });
      mockE2ERunReportService.updateSummary = jest.fn().mockResolvedValue(undefined);

      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([]),
      };
      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([]);

      const processor = E2EReportProcessor.getInstance();
      await (processor as any).generateReport({ date: '2025-10-08' });

      expect(mockE2ERunReportService.createSummary).toHaveBeenCalledWith({
        date: '2025-10-08',
        status: 'pending',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      });
    });

    it('should update existing summary when status is not ready', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-08',
        status: 'pending',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };

      mockE2ERunReportService.getSummaryByDate = jest.fn().mockResolvedValue(mockSummary);
      mockE2ERunReportService.deleteDetailsBySummaryId = jest.fn().mockResolvedValue(undefined);
      mockE2ERunReportService.createDetail = jest.fn().mockResolvedValue({ id: 1 });
      mockE2ERunReportService.updateSummary = jest.fn().mockResolvedValue(undefined);

      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([]),
      };
      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([]);

      const processor = E2EReportProcessor.getInstance();
      await (processor as any).generateReport({ date: '2025-10-08' });

      expect(mockE2ERunReportService.createSummary).not.toHaveBeenCalled();
      expect(mockE2ERunReportService.updateSummary).toHaveBeenCalled();
    });

    it('should handle error when summary creation fails', async () => {
      mockE2ERunReportService.getSummaryByDate = jest.fn().mockResolvedValue(null);
      mockE2ERunReportService.createSummary = jest.fn().mockResolvedValue(null);

      const processor = E2EReportProcessor.getInstance();

      // Should not throw, just log error
      await (processor as any).generateReport({ date: '2025-10-08' });

      expect(mockE2ERunReportService.createSummary).toHaveBeenCalled();
    });

    it('should process report data and create details', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-08',
        status: 'pending',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };

      mockE2ERunReportService.getSummaryByDate = jest.fn().mockResolvedValueOnce(null);
      mockE2ERunReportService.createSummary = jest.fn().mockResolvedValue(mockSummary);
      mockE2ERunReportService.deleteDetailsBySummaryId = jest.fn().mockResolvedValue(undefined);
      mockE2ERunReportService.createDetail = jest.fn().mockResolvedValue({ id: 1 });
      mockE2ERunReportService.updateSummary = jest.fn().mockResolvedValue(undefined);

      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };
      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const processor = E2EReportProcessor.getInstance();
      await (processor as any).generateReport({ date: '2025-10-08' });

      expect(mockE2ERunReportService.createDetail).toHaveBeenCalled();
      expect(mockE2ERunReportService.updateSummary).toHaveBeenCalledWith(1, {
        status: 'ready',
        totalRuns: 1,
        passedRuns: 1,
        failedRuns: 0,
        successRate: 1,
      });
    });

    it('should handle errors gracefully', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-08',
        status: 'pending',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };

      mockE2ERunReportService.getSummaryByDate = jest.fn().mockResolvedValueOnce(null);
      mockE2ERunReportService.createSummary = jest.fn().mockResolvedValue(mockSummary);
      mockE2ERunReportService.deleteDetailsBySummaryId = jest.fn().mockRejectedValue(new Error('Database error'));

      const processor = E2EReportProcessor.getInstance();

      // Should not throw, just log error
      await (processor as any).generateReport({ date: '2025-10-08' });

      expect(mockE2ERunReportService.deleteDetailsBySummaryId).toHaveBeenCalled();
    });

    it('should include requestId in log messages', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-08',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };

      mockE2ERunReportService.getSummaryByDate = jest.fn().mockResolvedValue(mockSummary);

      const processor = E2EReportProcessor.getInstance();
      await (processor as any).generateReport({ date: '2025-10-08', requestId: 'test-123' });

      expect(mockE2ERunReportService.getSummaryByDate).toHaveBeenCalledWith('2025-10-08');
    });
  });

  describe('fetchCypressData', () => {
    it('should fetch and process cypress data for watching apps', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
          {
            project_name: 'App1',
            run_number: 2,
            status: 'failed',
            created_at: '2025-10-08T11:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].appId).toBe(1);
      expect(result[0].totalRuns).toBe(2);
      expect(result[0].passedRuns).toBe(1);
      expect(result[0].failedRuns).toBe(1);
    });

    it('should return empty array when no watching apps', async () => {
      mockAppService.getWatching = jest.fn().mockResolvedValue([]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result).toEqual([]);
    });

    it('should filter apps by appIds option', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getById = jest.fn().mockResolvedValue({
        id: 1,
        name: 'App1',
        code: 'app1',
        pipelineUrl: 'https://example.com',
        e2eTriggerConfiguration: null,
        watching: true,
      });

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08', { appIds: [1] });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].appId).toBe(1);
      expect(mockAppService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw error when CYPRESS_API_KEY is missing', async () => {
      delete process.env.CYPRESS_API_KEY;

      await expect(E2EReportProcessor.fetchCypressData('2025-10-08')).rejects.toThrow('CYPRESS_API_KEY environment variable is not set');
    });

    it('should calculate success rate correctly', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
          {
            project_name: 'App1',
            run_number: 2,
            status: 'passed',
            created_at: '2025-10-08T11:00:00Z',
          },
          {
            project_name: 'App1',
            run_number: 3,
            status: 'passed',
            created_at: '2025-10-08T12:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result[0].successRate).toBe(1);
      expect(result[0].passedRuns).toBe(3);
      expect(result[0].failedRuns).toBe(0);
    });

    it('should handle runs with noTests status', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'noTests',
            created_at: '2025-10-08T10:00:00Z',
          },
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result[0].lastRunStatus).toBe('passed');
    });

    it('should track last failed run timestamp', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'failed',
            created_at: '2025-10-08T10:00:00Z',
          },
          {
            project_name: 'App1',
            run_number: 2,
            status: 'passed',
            created_at: '2025-10-08T11:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result[0].lastFailedRunAt).toBe('2025-10-08T10:00:00Z');
    });

    it('should handle multiple apps', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
          {
            project_name: 'App2',
            run_number: 1,
            status: 'failed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
        {
          id: 2,
          name: 'App2',
          code: 'app2',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result.length).toBe(2);
      expect(result[0].appId).toBe(1);
      expect(result[1].appId).toBe(2);
    });

    it('should skip apps not found in database', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'UnknownApp',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result.length).toBe(0);
    });

    it('should handle runs without run_number', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: null,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result[0].totalRuns).toBe(1);
    });

    it('should filter null apps when using appIds', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getById = jest.fn()
        .mockResolvedValueOnce({
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        })
        .mockResolvedValueOnce(null);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08', { appIds: [1, 2] });

      expect(result.length).toBe(1);
      expect(result[0].appId).toBe(1);
    });

    it('should handle apps without id', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: undefined,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result.length).toBe(0);
    });

    it('should handle runs with unknown project name', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: null,
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result.length).toBe(0);
    });

    it('should calculate last run status correctly', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: 1,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
          {
            project_name: 'App1',
            run_number: 2,
            status: 'failed',
            created_at: '2025-10-08T11:00:00Z',
          },
          {
            project_name: 'App1',
            run_number: 3,
            status: 'passed',
            created_at: '2025-10-08T12:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result[0].lastRunStatus).toBe('passed');
      expect(result[0].lastRunAt).toBe('2025-10-08T12:00:00Z');
    });

    it('should handle zero total runs', async () => {
      const mockCypressAPI = {
        getDailyRunsPerProject: jest.fn().mockResolvedValue([
          {
            project_name: 'App1',
            run_number: null,
            status: 'passed',
            created_at: '2025-10-08T10:00:00Z',
          },
        ]),
      };

      (CypressDashboardAPI as jest.MockedClass<typeof CypressDashboardAPI>).mockImplementation(() => mockCypressAPI as any);

      mockAppService.getWatching = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'App1',
          code: 'app1',
          pipelineUrl: 'https://example.com',
          e2eTriggerConfiguration: null,
          watching: true,
        },
      ]);

      const result = await E2EReportProcessor.fetchCypressData('2025-10-08');

      expect(result[0].totalRuns).toBe(0);
      expect(result[0].successRate).toBe(0);
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

