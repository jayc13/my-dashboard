/**
 * Clean Up Data Files Job Tests
 * 
 * Tests for the data files cleanup job including:
 * - Fetching file listings
 * - Date-based filtering
 * - File deletion
 * - Error handling
 * - Success/failure tracking
 */

// Mock apiFetch
const mockApiFetch = jest.fn();
jest.mock('../src/utils/helpers', () => ({
  apiFetch: mockApiFetch,
}));

jest.mock('../src/utils/constants', () => ({
  API_BASE_URL: 'http://localhost:3000',
}));

describe('Clean Up Data Files Job', () => {
  let cleanUpDataFilesJob: () => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    const jobModule = require('../src/jobs/clean-up-data-files.job');
    cleanUpDataFilesJob = jobModule.default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('File Listing', () => {
    it('should fetch files from API', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            path: '/',
            items: [],
            totalFiles: 0,
            totalDirectories: 0,
          },
        }),
      });

      await cleanUpDataFilesJob();

      expect(mockApiFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/internal/files',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should handle API fetch errors', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      await cleanUpDataFilesJob();

      expect(console.error).toHaveBeenCalledWith(
        'Error running clean-up-data-files job:',
        expect.any(Error),
      );
    });

    it('should handle non-ok response', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await cleanUpDataFilesJob();

      expect(console.error).toHaveBeenCalledWith('Error running clean-up-data-files job');
    });

    it('should handle missing data in response', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
        }),
      });

      await cleanUpDataFilesJob();

      expect(console.log).toHaveBeenCalledWith('No data files found to process.');
    });

    it('should handle missing items in data', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            path: '/',
          },
        }),
      });

      await cleanUpDataFilesJob();

      expect(console.log).toHaveBeenCalledWith('No data files found to process.');
    });
  });

  describe('Directory Filtering', () => {
    it('should filter only directories', async () => {
      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: '2025-09-01', type: 'directory', path: '/2025-09-01' },
            { name: 'file.txt', type: 'file', path: '/file.txt' },
            { name: '2025-09-02', type: 'directory', path: '/2025-09-02' },
          ],
          totalFiles: 1,
          totalDirectories: 2,
        },
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      await cleanUpDataFilesJob();

      expect(console.log).toHaveBeenCalledWith('Found 2 directories to process.');
    });
  });

  describe('Date-based Deletion', () => {
    it('should delete directories older than 7 days', async () => {
      const today = new Date();
      const oldDate = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000);
      const oldDateStr = oldDate.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: oldDateStr, type: 'directory', path: `/${oldDateStr}` },
          ],
          totalFiles: 0,
          totalDirectories: 1,
        },
      };

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockData),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      await cleanUpDataFilesJob();

      expect(mockApiFetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/internal/files?path=/${oldDateStr}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should not delete directories newer than 7 days', async () => {
      const today = new Date();
      const recentDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
      const recentDateStr = recentDate.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: recentDateStr, type: 'directory', path: `/${recentDateStr}` },
          ],
          totalFiles: 0,
          totalDirectories: 1,
        },
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      await cleanUpDataFilesJob();

      // Should only call fetch once (for listing, not for deletion)
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
    });

    it('should delete exactly on the 7-day boundary', async () => {
      const today = new Date();
      const boundaryDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const boundaryDateStr = boundaryDate.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: boundaryDateStr, type: 'directory', path: `/${boundaryDateStr}` },
          ],
          totalFiles: 0,
          totalDirectories: 1,
        },
      };

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockData),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      await cleanUpDataFilesJob();

      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Deletion Tracking', () => {
    it('should track successful deletions', async () => {
      const today = new Date();
      const oldDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      const oldDateStr = oldDate.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: oldDateStr, type: 'directory', path: `/${oldDateStr}` },
          ],
          totalFiles: 0,
          totalDirectories: 1,
        },
      };

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockData),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      await cleanUpDataFilesJob();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Deleted files: 1'),
      );
    });

    it('should track failed deletions', async () => {
      const today = new Date();
      const oldDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      const oldDateStr = oldDate.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: oldDateStr, type: 'directory', path: `/${oldDateStr}` },
          ],
          totalFiles: 0,
          totalDirectories: 1,
        },
      };

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockData),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      await cleanUpDataFilesJob();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Failed deletions: 1'),
      );
    });

    it('should handle deletion errors gracefully', async () => {
      const today = new Date();
      const oldDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      const oldDateStr = oldDate.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: oldDateStr, type: 'directory', path: `/${oldDateStr}` },
          ],
          totalFiles: 0,
          totalDirectories: 1,
        },
      };

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockData),
        })
        .mockRejectedValueOnce(new Error('Delete failed'));

      await cleanUpDataFilesJob();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error deleting folder'),
        expect.any(Error),
      );
    });

    it('should handle multiple deletions', async () => {
      const today = new Date();
      const oldDate1 = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      const oldDate2 = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
      const oldDateStr1 = oldDate1.toISOString().split('T')[0];
      const oldDateStr2 = oldDate2.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: oldDateStr1, type: 'directory', path: `/${oldDateStr1}` },
            { name: oldDateStr2, type: 'directory', path: `/${oldDateStr2}` },
          ],
          totalFiles: 0,
          totalDirectories: 2,
        },
      };

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockData),
        })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true });

      await cleanUpDataFilesJob();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Deleted files: 2'),
      );
    });

    it('should handle mixed success and failure', async () => {
      const today = new Date();
      const oldDate1 = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      const oldDate2 = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
      const oldDateStr1 = oldDate1.toISOString().split('T')[0];
      const oldDateStr2 = oldDate2.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: oldDateStr1, type: 'directory', path: `/${oldDateStr1}` },
            { name: oldDateStr2, type: 'directory', path: `/${oldDateStr2}` },
          ],
          totalFiles: 0,
          totalDirectories: 2,
        },
      };

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockData),
        })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false });

      await cleanUpDataFilesJob();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Deleted files: 1, Failed deletions: 1'),
      );
    });
  });

  describe('Error Handling', () => {
    it('should log failed deletions list', async () => {
      const today = new Date();
      const oldDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      const oldDateStr = oldDate.toISOString().split('T')[0];

      const mockData = {
        success: true,
        data: {
          path: '/',
          items: [
            { name: oldDateStr, type: 'directory', path: `/${oldDateStr}` },
          ],
          totalFiles: 0,
          totalDirectories: 1,
        },
      };

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockData),
        })
        .mockResolvedValueOnce({ ok: false });

      await cleanUpDataFilesJob();

      expect(console.error).toHaveBeenCalledWith('Failed to delete the following files:');
      expect(console.error).toHaveBeenCalledWith(`- ${oldDateStr}`);
    });

    it('should complete job even with errors', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(cleanUpDataFilesJob()).resolves.not.toThrow();
    });
  });
});

export {};
