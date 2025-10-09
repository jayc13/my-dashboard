/**
 * Cypress Dashboard API Service Tests
 * 
 * Tests for CypressDashboardAPI including:
 * - URL generation with various options
 * - Fetching projects
 * - Fetching daily runs per project
 */

import { CypressDashboardAPI } from '../../services/cypress.service';

// Mock fetch
global.fetch = jest.fn();

describe('CypressDashboardAPI', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  let service: CypressDashboardAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CYPRESS_BASE_URL = 'https://api.cypress.io/reports';
    service = new CypressDashboardAPI('test-api-key');
  });

  describe('constructor', () => {
    it('should create instance with API key', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1' },
        { id: 'project-2', name: 'Project 2' },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockProjects,
      } as Response);

      const result = await service.getProjects();

      expect(result).toEqual(mockProjects);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('report_id=project-list'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('token=test-api-key'),
      );
    });

    it('should throw error when CYPRESS_BASE_URL is not set', async () => {
      delete process.env.CYPRESS_BASE_URL;
      const newService = new CypressDashboardAPI('test-key');

      await expect(newService.getProjects()).rejects.toThrow(
        'CYPRESS_BASE_URL environment variable is not set.',
      );
    });

    it('should throw error when API key is not provided', async () => {
      const newService = new CypressDashboardAPI('');

      await expect(newService.getProjects()).rejects.toThrow(
        'CYPRESS_API_KEY environment variable is not set.',
      );
    });
  });

  describe('getDailyRunsPerProject', () => {
    it('should fetch daily runs with default options', async () => {
      const mockRuns = [
        { date: '2025-10-08', runs: 10, passed: 8, failed: 2 },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockRuns,
      } as Response);

      const result = await service.getDailyRunsPerProject();

      expect(result).toEqual(mockRuns);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('report_id=spec-details'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('export_format=json'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('branch=master'),
      );
    });

    it('should fetch daily runs with custom date range', async () => {
      const mockRuns = [
        { date: '2025-10-01', runs: 5 },
        { date: '2025-10-02', runs: 7 },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockRuns,
      } as Response);

      const result = await service.getDailyRunsPerProject({
        startDate: '2025-10-01T00:00:00Z',
        endDate: '2025-10-02T23:59:59Z',
      });

      expect(result).toEqual(mockRuns);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2025-10-01T00%3A00%3A00Z'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2025-10-02T23%3A59%3A59Z'),
      );
    });

    it('should fetch daily runs with specific projects', async () => {
      const mockRuns = [{ project: 'project-1', runs: 10 }];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockRuns,
      } as Response);

      const result = await service.getDailyRunsPerProject({
        projects: ['project-1', 'project-2'],
      });

      expect(result).toEqual(mockRuns);
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('projects=project-1');
      expect(callUrl).toContain('projects=project-2');
    });

    it('should fetch daily runs with custom branch', async () => {
      const mockRuns = [{ branch: 'develop', runs: 5 }];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockRuns,
      } as Response);

      const result = await service.getDailyRunsPerProject({
        branch: 'develop',
      });

      expect(result).toEqual(mockRuns);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('branch=develop'),
      );
    });

    it('should fetch daily runs with CSV export format', async () => {
      const mockCsv = 'date,runs\n2025-10-08,10';

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockCsv,
      } as Response);

      const result = await service.getDailyRunsPerProject({
        exportFormat: 'csv',
      });

      expect(result).toEqual(mockCsv);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('export_format=csv'),
      );
    });

    it('should fetch daily runs with all options combined', async () => {
      const mockRuns = [{ data: 'test' }];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockRuns,
      } as Response);

      const result = await service.getDailyRunsPerProject({
        projects: ['project-1'],
        startDate: '2025-10-01T00:00:00Z',
        endDate: '2025-10-08T23:59:59Z',
        exportFormat: 'json',
        branch: 'main',
      });

      expect(result).toEqual(mockRuns);
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('projects=project-1');
      expect(callUrl).toContain('start_date=2025-10-01T00%3A00%3A00Z');
      expect(callUrl).toContain('end_date=2025-10-08T23%3A59%3A59Z');
      expect(callUrl).toContain('export_format=json');
      expect(callUrl).toContain('branch=main');
    });

    it('should not include end_date when not provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await service.getDailyRunsPerProject({
        startDate: '2025-10-01T00:00:00Z',
      });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('start_date=2025-10-01T00%3A00%3A00Z');
      expect(callUrl).not.toContain('end_date=');
    });

    it('should handle empty projects array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await service.getDailyRunsPerProject({
        projects: [],
      });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).not.toContain('projects=');
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(service.getDailyRunsPerProject()).rejects.toThrow('Network error');
    });
  });
});

