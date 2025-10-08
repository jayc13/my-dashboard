/**
 * App Service Tests
 * 
 * Tests for AppService including:
 * - CRUD operations
 * - Enrichment with run details
 */

import { AppService } from '../../services/app.service';
import { E2EManualRunService } from '../../services/e2e_manual_run.service';
import { CircleCIService } from '../../services/circle_ci.service';
import { db } from '../../db/database';

// Mock dependencies
jest.mock('../../db/database');
jest.mock('../../services/e2e_manual_run.service');
jest.mock('../../services/circle_ci.service');

describe('AppService', () => {
  const mockDb = db as jest.Mocked<typeof db>;
  const mockE2EManualRunService = E2EManualRunService as jest.Mocked<typeof E2EManualRunService>;
  const mockCircleCIService = CircleCIService as jest.Mocked<typeof CircleCIService>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CIRCLE_CI_BASE_URL = 'https://circleci.com';
  });

  describe('getAll', () => {
    it('should fetch all apps ordered by name', async () => {
      const mockRows = [
        {
          id: 1,
          name: 'App A',
          code: 'app-a',
          pipeline_url: 'https://example.com/pipeline',
          e2e_trigger_configuration: '{"branch":"main"}',
          watching: 1,
        },
        {
          id: 2,
          name: 'App B',
          code: 'app-b',
          pipeline_url: null,
          e2e_trigger_configuration: null,
          watching: 0,
        },
      ];

      mockDb.all.mockResolvedValue(mockRows);

      const result = await AppService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'App A',
        code: 'app-a',
        pipelineUrl: 'https://example.com/pipeline',
        e2eTriggerConfiguration: '{"branch":"main"}',
        watching: true,
      });
      expect(result[1].watching).toBe(false);
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM apps ORDER BY name ASC');
    });

    it('should throw error when database query fails', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      await expect(AppService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should fetch app by id with enriched details', async () => {
      const mockRow = {
        id: 1,
        name: 'Test App',
        code: 'test-app',
        pipeline_url: 'https://example.com/pipeline',
        e2e_trigger_configuration: '{"branch":"main"}',
        watching: 1,
      };

      mockDb.get.mockResolvedValue(mockRow);
      mockE2EManualRunService.getByAppId.mockResolvedValue([
        {
          id: 1,
          app_id: 1,
          pipeline_id: 'pipeline-123',
          created_at: '2025-10-08T10:00:00Z',
        },
      ]);

      mockCircleCIService.getPipelineLatestWorkflow.mockResolvedValue({
        pipeline_id: 'pipeline-123',
        id: 'workflow-1',
        name: 'integration_tests',
        project_slug: 'gh/test/repo',
        status: 'success',
        started_by: 'user',
        pipeline_number: 123,
        created_at: '2025-10-08T10:00:00Z',
      });

      const result = await AppService.getById(1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Test App');
      expect(result?.e2eRunsQuantity).toBe(1);
      expect(result?.lastRun).toBeDefined();
      expect(result?.lastRun?.status).toBe('success');
    });

    it('should return undefined when app not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await AppService.getById(999);

      expect(result).toBeUndefined();
    });

    it('should handle app with no runs', async () => {
      const mockRow = {
        id: 1,
        name: 'Test App',
        code: 'test-app',
        pipeline_url: null,
        e2e_trigger_configuration: null,
        watching: 0,
      };

      mockDb.get.mockResolvedValue(mockRow);
      mockE2EManualRunService.getByAppId.mockResolvedValue([]);

      const result = await AppService.getById(1);

      expect(result).toBeDefined();
      expect(result?.e2eRunsQuantity).toBe(0);
      expect(result?.lastRun).toBeUndefined();
    });
  });

  describe('getByCode', () => {
    it('should fetch app by code', async () => {
      const mockRow = {
        id: 1,
        name: 'Test App',
        code: 'test-app',
        pipeline_url: null,
        e2e_trigger_configuration: null,
        watching: 0,
      };

      mockDb.get.mockResolvedValue(mockRow);
      mockE2EManualRunService.getByAppId.mockResolvedValue([]);

      const result = await AppService.getByCode('test-app');

      expect(result).toBeDefined();
      expect(result?.code).toBe('test-app');
      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM apps WHERE code = ?', ['test-app']);
    });

    it('should return undefined when app code not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await AppService.getByCode('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new app', async () => {
      const newApp = {
        name: 'New App',
        code: 'new-app',
        pipelineUrl: 'https://example.com/pipeline',
        e2eTriggerConfiguration: '{"branch":"main"}',
        watching: true,
      };

      mockDb.run.mockResolvedValue({ insertId: 1, affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 1,
        name: 'New App',
        code: 'new-app',
        pipeline_url: 'https://example.com/pipeline',
        e2e_trigger_configuration: '{"branch":"main"}',
        watching: 1,
      });
      mockE2EManualRunService.getByAppId.mockResolvedValue([]);

      const result = await AppService.create(newApp);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('New App');
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO apps'),
        ['New App', 'new-app', 'https://example.com/pipeline', '{"branch":"main"}', 1],
      );
    });

    it('should create app with null optional fields', async () => {
      const newApp = {
        name: 'Simple App',
        code: 'simple-app',
        watching: false,
      };

      mockDb.run.mockResolvedValue({ insertId: 2, affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 2,
        name: 'Simple App',
        code: 'simple-app',
        pipeline_url: null,
        e2e_trigger_configuration: null,
        watching: 0,
      });
      mockE2EManualRunService.getByAppId.mockResolvedValue([]);

      const result = await AppService.create(newApp);

      expect(result.pipelineUrl).toBeNull();
      expect(result.e2eTriggerConfiguration).toBeNull();
      expect(result.watching).toBe(false);
    });

    it('should throw error when creation fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Insert failed'));

      await expect(AppService.create({
        name: 'Test',
        code: 'test',
        watching: false,
      })).rejects.toThrow('Insert failed');
    });
  });

  describe('update', () => {
    it('should update app with all fields', async () => {
      const updates = {
        name: 'Updated App',
        code: 'updated-app',
        pipelineUrl: 'https://new.com/pipeline',
        e2eTriggerConfiguration: '{"branch":"develop"}',
        watching: true,
      };

      mockDb.run.mockResolvedValue({ affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 1,
        name: 'Updated App',
        code: 'updated-app',
        pipeline_url: 'https://new.com/pipeline',
        e2e_trigger_configuration: '{"branch":"develop"}',
        watching: 1,
      });
      mockE2EManualRunService.getByAppId.mockResolvedValue([]);

      const result = await AppService.update(1, updates);

      expect(result.name).toBe('Updated App');
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE apps SET'),
        expect.arrayContaining(['Updated App', 'updated-app', 'https://new.com/pipeline', '{"branch":"develop"}', 1, 1]),
      );
    });

    it('should update only specified fields', async () => {
      const updates = {
        watching: false,
      };

      mockDb.run.mockResolvedValue({ affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 1,
        name: 'Test App',
        code: 'test-app',
        pipeline_url: null,
        e2e_trigger_configuration: null,
        watching: 0,
      });
      mockE2EManualRunService.getByAppId.mockResolvedValue([]);

      const result = await AppService.update(1, updates);

      expect(result.watching).toBe(false);
      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE apps SET watching = ? WHERE id = ?',
        [0, 1],
      );
    });

    it('should return app without update when no fields provided', async () => {
      mockDb.get.mockResolvedValue({
        id: 1,
        name: 'Test App',
        code: 'test-app',
        pipeline_url: null,
        e2e_trigger_configuration: null,
        watching: 0,
      });
      mockE2EManualRunService.getByAppId.mockResolvedValue([]);

      const result = await AppService.update(1, {});

      expect(result.id).toBe(1);
      expect(mockDb.run).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete app and return true', async () => {
      mockDb.run.mockResolvedValue({ affectedRows: 1 });

      const result = await AppService.delete(1);

      expect(result).toBe(true);
      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM apps WHERE id = ?', [1]);
    });

    it('should return false when app not found', async () => {
      mockDb.run.mockResolvedValue({ affectedRows: 0 });

      const result = await AppService.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('getWatching', () => {
    it('should fetch only watching apps', async () => {
      const mockRows = [
        {
          id: 1,
          name: 'Watched App 1',
          code: 'watched-1',
          pipeline_url: null,
          e2e_trigger_configuration: null,
          watching: 1,
        },
        {
          id: 3,
          name: 'Watched App 2',
          code: 'watched-2',
          pipeline_url: null,
          e2e_trigger_configuration: null,
          watching: 1,
        },
      ];

      mockDb.all.mockResolvedValue(mockRows);

      const result = await AppService.getWatching();

      expect(result).toHaveLength(2);
      expect(result.every(app => app.watching)).toBe(true);
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM apps WHERE watching = 1 ORDER BY name ASC');
    });
  });
});

