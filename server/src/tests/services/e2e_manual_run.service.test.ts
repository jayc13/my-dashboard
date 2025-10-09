import { E2EManualRunService, E2EManualRunInput } from '../../services/e2e_manual_run.service';
import { AppService } from '../../services/app.service';
import { CircleCIService, CircleCIWorkflow } from '../../services/circle_ci.service';
import { db } from '../../db/database';

// Mock dependencies
jest.mock('../../db/database');
jest.mock('../../services/app.service');
jest.mock('../../services/circle_ci.service');

describe('E2EManualRunService', () => {
  const mockDb = db as jest.Mocked<typeof db>;
  const mockAppService = AppService as jest.Mocked<typeof AppService>;
  const mockCircleCIService = CircleCIService as jest.Mocked<typeof CircleCIService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validInput: E2EManualRunInput = {
      appId: 1,
    };

    const mockApp = {
      id: 1,
      name: 'Test App',
      code: 'test-app',
      pipelineUrl: 'https://example.com/pipeline',
      e2eTriggerConfiguration: '{"branch":"main"}',
      watching: true,
      e2eRunsQuantity: 0,
    };

    const mockPipelineResponse = {
      id: 'pipeline-123',
      state: 'created',
      number: 456,
      created_at: '2025-10-03T10:00:00Z',
    };

    it('should create a manual run when no runs are in progress', async () => {
      // Mock app exists with e2e config
      mockAppService.getById.mockResolvedValue(mockApp);

      // Mock no existing runs
      mockDb.all.mockResolvedValue([]);

      // Mock CircleCI trigger
      mockCircleCIService.triggerE2ERuns.mockResolvedValue(mockPipelineResponse);

      // Mock database insert
      mockDb.run.mockResolvedValue({ insertId: 1, affectedRows: 1 });

      // Mock fetching the created record
      const mockCreatedRun = {
        id: 1,
        app_id: 1,
        pipeline_id: 'pipeline-123',
        created_at: '2025-10-03T10:00:00Z',
      };
      mockDb.get.mockResolvedValue(mockCreatedRun);

      const result = await E2EManualRunService.create(validInput);

      expect(result).toEqual(mockCreatedRun);
      expect(mockAppService.getById).toHaveBeenCalledWith(1);
      expect(mockCircleCIService.triggerE2ERuns).toHaveBeenCalledWith('{"branch":"main"}');
      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO e2e_manual_runs (app_id, pipeline_id) VALUES (?, ?)',
        [1, 'pipeline-123'],
      );
    });

    it('should throw error when app does not exist', async () => {
      mockAppService.getById.mockResolvedValue(undefined);

      await expect(E2EManualRunService.create(validInput)).rejects.toThrow(
        'App with id 1 not found',
      );

      expect(mockCircleCIService.triggerE2ERuns).not.toHaveBeenCalled();
    });

    it('should throw error when app does not have e2e trigger configuration', async () => {
      const appWithoutConfig = { ...mockApp, e2eTriggerConfiguration: undefined };
      mockAppService.getById.mockResolvedValue(appWithoutConfig);

      await expect(E2EManualRunService.create(validInput)).rejects.toThrow(
        'App with id 1 does not have e2e_trigger_configuration set',
      );

      expect(mockCircleCIService.triggerE2ERuns).not.toHaveBeenCalled();
    });

    it('should throw error when a manual run is already running', async () => {
      mockAppService.getById.mockResolvedValue(mockApp);

      // Mock existing run
      const existingRun = {
        id: 1,
        app_id: 1,
        pipeline_id: 'pipeline-existing',
        created_at: '2025-10-03T09:00:00Z',
      };
      mockDb.all.mockResolvedValue([existingRun]);

      // Mock workflow status as running
      const runningWorkflow: CircleCIWorkflow = {
        pipeline_id: 'pipeline-existing',
        id: 'workflow-1',
        name: 'integration_tests',
        project_slug: 'gh/test/repo',
        status: 'running',
        started_by: 'user',
        pipeline_number: 123,
        created_at: '2025-10-03T09:00:00Z',
      };
      mockCircleCIService.getPipelineLatestWorkflow.mockResolvedValue(runningWorkflow);

      await expect(E2EManualRunService.create(validInput)).rejects.toThrow(
        'A manual run is already in progress for this app. Please wait for it to complete before starting a new one.',
      );

      expect(mockCircleCIService.triggerE2ERuns).not.toHaveBeenCalled();
    });

    it('should throw error when a manual run is on hold', async () => {
      mockAppService.getById.mockResolvedValue(mockApp);

      const existingRun = {
        id: 1,
        app_id: 1,
        pipeline_id: 'pipeline-existing',
        created_at: '2025-10-03T09:00:00Z',
      };
      mockDb.all.mockResolvedValue([existingRun]);

      const onHoldWorkflow: CircleCIWorkflow = {
        pipeline_id: 'pipeline-existing',
        id: 'workflow-1',
        name: 'integration_tests',
        project_slug: 'gh/test/repo',
        status: 'on_hold',
        started_by: 'user',
        pipeline_number: 123,
        created_at: '2025-10-03T09:00:00Z',
      };
      mockCircleCIService.getPipelineLatestWorkflow.mockResolvedValue(onHoldWorkflow);

      await expect(E2EManualRunService.create(validInput)).rejects.toThrow(
        'A manual run is already in progress for this app. Please wait for it to complete before starting a new one.',
      );
    });

    it('should throw error when a manual run is failing', async () => {
      mockAppService.getById.mockResolvedValue(mockApp);

      const existingRun = {
        id: 1,
        app_id: 1,
        pipeline_id: 'pipeline-existing',
        created_at: '2025-10-03T09:00:00Z',
      };
      mockDb.all.mockResolvedValue([existingRun]);

      const failingWorkflow: CircleCIWorkflow = {
        pipeline_id: 'pipeline-existing',
        id: 'workflow-1',
        name: 'integration_tests',
        project_slug: 'gh/test/repo',
        status: 'failing',
        started_by: 'user',
        pipeline_number: 123,
        created_at: '2025-10-03T09:00:00Z',
      };
      mockCircleCIService.getPipelineLatestWorkflow.mockResolvedValue(failingWorkflow);

      await expect(E2EManualRunService.create(validInput)).rejects.toThrow(
        'A manual run is already in progress for this app. Please wait for it to complete before starting a new one.',
      );
    });

    it('should allow creating a new run when existing run is completed (success)', async () => {
      mockAppService.getById.mockResolvedValue(mockApp);

      const existingRun = {
        id: 1,
        app_id: 1,
        pipeline_id: 'pipeline-existing',
        created_at: '2025-10-03T09:00:00Z',
      };
      mockDb.all.mockResolvedValue([existingRun]);

      const successWorkflow: CircleCIWorkflow = {
        pipeline_id: 'pipeline-existing',
        id: 'workflow-1',
        name: 'integration_tests',
        project_slug: 'gh/test/repo',
        status: 'success',
        started_by: 'user',
        pipeline_number: 123,
        created_at: '2025-10-03T09:00:00Z',
        stopped_at: '2025-10-03T09:30:00Z',
      };
      mockCircleCIService.getPipelineLatestWorkflow.mockResolvedValue(successWorkflow);
      mockCircleCIService.triggerE2ERuns.mockResolvedValue(mockPipelineResponse);

      mockDb.run.mockResolvedValue({ insertId: 2, affectedRows: 1 });
      const mockCreatedRun = {
        id: 2,
        app_id: 1,
        pipeline_id: 'pipeline-123',
        created_at: '2025-10-03T10:00:00Z',
      };
      mockDb.get.mockResolvedValue(mockCreatedRun);

      const result = await E2EManualRunService.create(validInput);

      expect(result).toEqual(mockCreatedRun);
      expect(mockCircleCIService.triggerE2ERuns).toHaveBeenCalled();
    });

    it('should allow creating a new run when existing run is completed (failed)', async () => {
      mockAppService.getById.mockResolvedValue(mockApp);

      const existingRun = {
        id: 1,
        app_id: 1,
        pipeline_id: 'pipeline-existing',
        created_at: '2025-10-03T09:00:00Z',
      };
      mockDb.all.mockResolvedValue([existingRun]);

      const failedWorkflow: CircleCIWorkflow = {
        pipeline_id: 'pipeline-existing',
        id: 'workflow-1',
        name: 'integration_tests',
        project_slug: 'gh/test/repo',
        status: 'failed',
        started_by: 'user',
        pipeline_number: 123,
        created_at: '2025-10-03T09:00:00Z',
        stopped_at: '2025-10-03T09:30:00Z',
      };
      mockCircleCIService.getPipelineLatestWorkflow.mockResolvedValue(failedWorkflow);
      mockCircleCIService.triggerE2ERuns.mockResolvedValue(mockPipelineResponse);

      mockDb.run.mockResolvedValue({ insertId: 2, affectedRows: 1 });
      const mockCreatedRun = {
        id: 2,
        app_id: 1,
        pipeline_id: 'pipeline-123',
        created_at: '2025-10-03T10:00:00Z',
      };
      mockDb.get.mockResolvedValue(mockCreatedRun);

      const result = await E2EManualRunService.create(validInput);

      expect(result).toEqual(mockCreatedRun);
      expect(mockCircleCIService.triggerE2ERuns).toHaveBeenCalled();
    });

    it('should allow creating a new run when existing run is canceled', async () => {
      mockAppService.getById.mockResolvedValue(mockApp);

      const existingRun = {
        id: 1,
        app_id: 1,
        pipeline_id: 'pipeline-existing',
        created_at: '2025-10-03T09:00:00Z',
      };
      mockDb.all.mockResolvedValue([existingRun]);

      const canceledWorkflow: CircleCIWorkflow = {
        pipeline_id: 'pipeline-existing',
        id: 'workflow-1',
        name: 'integration_tests',
        project_slug: 'gh/test/repo',
        status: 'canceled',
        started_by: 'user',
        pipeline_number: 123,
        created_at: '2025-10-03T09:00:00Z',
        stopped_at: '2025-10-03T09:15:00Z',
      };
      mockCircleCIService.getPipelineLatestWorkflow.mockResolvedValue(canceledWorkflow);
      mockCircleCIService.triggerE2ERuns.mockResolvedValue(mockPipelineResponse);

      mockDb.run.mockResolvedValue({ insertId: 2, affectedRows: 1 });
      const mockCreatedRun = {
        id: 2,
        app_id: 1,
        pipeline_id: 'pipeline-123',
        created_at: '2025-10-03T10:00:00Z',
      };
      mockDb.get.mockResolvedValue(mockCreatedRun);

      const result = await E2EManualRunService.create(validInput);

      expect(result).toEqual(mockCreatedRun);
      expect(mockCircleCIService.triggerE2ERuns).toHaveBeenCalled();
    });

    it('should allow creating a new run if latest run workflow status check fails', async () => {
      mockAppService.getById.mockResolvedValue(mockApp);

      // One existing run
      const existingRuns = [
        {
          id: 1,
          app_id: 1,
          pipeline_id: 'pipeline-old',
          created_at: '2025-10-02T09:00:00Z',
        },
      ];
      mockDb.all.mockResolvedValue(existingRuns);

      // Workflow check fails (e.g., old pipeline deleted)
      mockCircleCIService.getPipelineLatestWorkflow
        .mockRejectedValueOnce(new Error('Pipeline not found'));

      mockCircleCIService.triggerE2ERuns.mockResolvedValue(mockPipelineResponse);
      mockDb.run.mockResolvedValue({ insertId: 2, affectedRows: 1 });
      const mockCreatedRun = {
        id: 2,
        app_id: 1,
        pipeline_id: 'pipeline-123',
        created_at: '2025-10-03T10:00:00Z',
      };
      mockDb.get.mockResolvedValue(mockCreatedRun);

      const result = await E2EManualRunService.create(validInput);

      expect(result).toEqual(mockCreatedRun);
      expect(mockCircleCIService.triggerE2ERuns).toHaveBeenCalled();
      expect(mockCircleCIService.getPipelineLatestWorkflow).toHaveBeenCalledTimes(1);
    });

    it('should only check the latest run when multiple runs exist', async () => {
      mockAppService.getById.mockResolvedValue(mockApp);

      // Multiple existing runs - latest one (first in array) is running
      const existingRuns = [
        {
          id: 2,
          app_id: 1,
          pipeline_id: 'pipeline-2',
          created_at: '2025-10-03T09:00:00Z',
        },
        {
          id: 1,
          app_id: 1,
          pipeline_id: 'pipeline-1',
          created_at: '2025-10-03T08:00:00Z',
        },
      ];
      mockDb.all.mockResolvedValue(existingRuns);

      // Only the latest (first) run should be checked
      mockCircleCIService.getPipelineLatestWorkflow.mockResolvedValueOnce({
        pipeline_id: 'pipeline-2',
        id: 'workflow-2',
        name: 'integration_tests',
        project_slug: 'gh/test/repo',
        status: 'running',
        started_by: 'user',
        pipeline_number: 124,
        created_at: '2025-10-03T09:00:00Z',
      });

      await expect(E2EManualRunService.create(validInput)).rejects.toThrow(
        'A manual run is already in progress for this app. Please wait for it to complete before starting a new one.',
      );

      expect(mockCircleCIService.triggerE2ERuns).not.toHaveBeenCalled();
      // Should only check the latest run, not all runs
      expect(mockCircleCIService.getPipelineLatestWorkflow).toHaveBeenCalledTimes(1);
      expect(mockCircleCIService.getPipelineLatestWorkflow).toHaveBeenCalledWith('pipeline-2');
    });
  });

  describe('getByAppId', () => {
    it('should return all runs for an app', async () => {
      const mockRuns = [
        {
          id: 1,
          app_id: 1,
          pipeline_id: 'pipeline-1',
          created_at: '2025-10-03T10:00:00Z',
        },
        {
          id: 2,
          app_id: 1,
          pipeline_id: 'pipeline-2',
          created_at: '2025-10-03T09:00:00Z',
        },
      ];
      mockDb.all.mockResolvedValue(mockRuns);

      const result = await E2EManualRunService.getByAppId(1);

      expect(result).toEqual(mockRuns);
      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM e2e_manual_runs WHERE app_id = ? ORDER BY created_at DESC',
        [1],
      );
    });

    it('should return empty array when no runs exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await E2EManualRunService.getByAppId(1);

      expect(result).toEqual([]);
    });

    it('should filter by date range when options provided', async () => {
      const mockRuns = [
        {
          id: 1,
          app_id: 1,
          pipeline_id: 'pipeline-1',
          created_at: '2025-10-03T10:00:00Z',
        },
      ];
      mockDb.all.mockResolvedValue(mockRuns);

      const options = {
        filter: {
          from: '2025-10-01',
          to: '2025-10-31',
        },
      };

      const result = await E2EManualRunService.getByAppId(1, options);

      expect(result).toEqual(mockRuns);
      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM e2e_manual_runs WHERE app_id = ? AND DATE(created_at) >= DATE(?) AND DATE(created_at) <= DATE(?) ORDER BY created_at DESC',
        [1, '2025-10-01', '2025-10-31'],
      );
    });
  });
});

