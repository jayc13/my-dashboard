/**
 * App Service Tests
 * 
 * Tests for AppService including:
 * - Get all apps
 * - Get app by ID
 * - Get app by code
 */

import { AppService } from '../services/app.service';
import { db } from '../db/database';

// Mock dependencies
jest.mock('../db/database');
jest.mock('./e2e_manual_run.service');
jest.mock('./circle_ci.service');

describe('AppService', () => {
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all apps ordered by name', async () => {
      const mockRows = [
        {
          id: 1,
          name: 'App A',
          code: 'app-a',
          pipeline_url: 'https://example.com/pipeline-a',
          e2e_trigger_configuration: '{"branch":"main"}',
          watching: 1,
          e2e_runs_quantity: 5,
        },
        {
          id: 2,
          name: 'App B',
          code: 'app-b',
          pipeline_url: 'https://example.com/pipeline-b',
          e2e_trigger_configuration: null,
          watching: 0,
          e2e_runs_quantity: 0,
        },
      ];

      mockDb.all.mockResolvedValue(mockRows);

      const result = await AppService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('App A');
      expect(result[0].watching).toBe(true);
      expect(result[1].name).toBe('App B');
      expect(result[1].watching).toBe(false);
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM apps ORDER BY name ASC');
    });

    it('should return empty array when no apps exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await AppService.getAll();

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      await expect(AppService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return app by id', async () => {
      const mockRow = {
        id: 1,
        name: 'App A',
        code: 'app-a',
        pipeline_url: 'https://example.com/pipeline-a',
        e2e_trigger_configuration: '{"branch":"main"}',
        watching: 1,
        e2e_runs_quantity: 5,
      };

      mockDb.get.mockResolvedValue(mockRow);
      // Mock the enrichWithRunDetails dependencies
      mockDb.all.mockResolvedValue([]);

      const result = await AppService.getById(1);

      expect(result).toBeDefined();
      expect(result?.name).toBe('App A');
      expect(result?.code).toBe('app-a');
      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM apps WHERE id = ?', [1]);
    });

    it('should return undefined when app not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await AppService.getById(999);

      expect(result).toBeUndefined();
    });

    it('should throw error when database query fails', async () => {
      mockDb.get.mockRejectedValue(new Error('Database error'));

      await expect(AppService.getById(1)).rejects.toThrow('Database error');
    });
  });

  describe('getByCode', () => {
    it('should return app by code', async () => {
      const mockRow = {
        id: 1,
        name: 'App A',
        code: 'app-a',
        pipeline_url: 'https://example.com/pipeline-a',
        e2e_trigger_configuration: '{"branch":"main"}',
        watching: 1,
        e2e_runs_quantity: 5,
      };

      mockDb.get.mockResolvedValue(mockRow);
      // Mock the enrichWithRunDetails dependencies
      mockDb.all.mockResolvedValue([]);

      const result = await AppService.getByCode('app-a');

      expect(result).toBeDefined();
      expect(result?.name).toBe('App A');
      expect(result?.code).toBe('app-a');
      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM apps WHERE code = ?', ['app-a']);
    });

    it('should return undefined when app not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await AppService.getByCode('non-existent');

      expect(result).toBeUndefined();
    });

    it('should throw error when database query fails', async () => {
      mockDb.get.mockRejectedValue(new Error('Database error'));

      await expect(AppService.getByCode('app-a')).rejects.toThrow('Database error');
    });
  });

  describe('getAppWithDetailsById', () => {
    it('should return app with details by id', async () => {
      const mockRow = {
        id: 1,
        name: 'App A',
        code: 'app-a',
        pipeline_url: 'https://example.com/pipeline-a',
        e2e_trigger_configuration: '{"branch":"main"}',
        watching: 1,
        e2e_runs_quantity: 5,
      };

      mockDb.get.mockResolvedValue(mockRow);
      // Mock the enrichWithRunDetails dependencies
      mockDb.all.mockResolvedValue([]);

      const result = await AppService.getAppWithDetailsById(1);

      expect(result).toBeDefined();
      expect(result?.name).toBe('App A');
    });

    it('should return undefined when app not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await AppService.getAppWithDetailsById(999);

      expect(result).toBeUndefined();
    });
  });
});

