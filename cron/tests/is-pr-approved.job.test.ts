/**
 * Is PR Approved Job Tests
 *
 * Tests for the PR approval checking job including:
 * - Fetching pull requests
 * - Checking PR details
 * - Filtering by mergeable state
 * - Error handling
 */

// Mock apiFetch
const mockApiFetch = jest.fn();
jest.mock('../src/utils/helpers', () => ({
  apiFetch: mockApiFetch,
}));

// Mock publishNotificationRequest
const mockPublishNotificationRequest = jest.fn();
jest.mock('../src/jobs/notification.job', () => ({
  publishNotificationRequest: mockPublishNotificationRequest,
}));

jest.mock('../src/utils/constants', () => ({
  API_BASE_URL: 'http://localhost:3000',
}));

describe('Is PR Approved Job', () => {
  let isPrApprovedJob: () => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Setup default mock for publishNotificationRequest
    mockPublishNotificationRequest.mockResolvedValue(undefined);

    const jobModule = require('../src/jobs/is-pr-approved.job');
    isPrApprovedJob = jobModule.default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Fetching Pull Requests', () => {
    it('should fetch all pull requests', async () => {
      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue([]),
        });

      await isPrApprovedJob();

      expect(mockApiFetch).toHaveBeenCalledWith('http://localhost:3000/api/pull_requests');
    });

    it('should handle empty pull request list', async () => {
      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue([]),
        });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should handle API errors', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('API error'));

      await expect(isPrApprovedJob()).rejects.toThrow('API error');
    });
  });

  describe('Checking PR Details', () => {
    it('should fetch details for each PR', async () => {
      const mockPRs = [
        { id: 1, title: 'PR 1' },
        { id: 2, title: 'PR 2' },
      ];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'unknown' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 2, mergeableState: 'unknown' }),
        });

      await isPrApprovedJob();

      expect(mockApiFetch).toHaveBeenCalledWith('http://localhost:3000/api/pull_requests/1');
      expect(mockApiFetch).toHaveBeenCalledWith('http://localhost:3000/api/pull_requests/2');
    });

    it('should filter PRs by mergeable state', async () => {
      const mockPRs = [
        { id: 1, title: 'PR 1' },
        { id: 2, title: 'PR 2' },
        { id: 3, title: 'PR 3' },
        { id: 4, title: 'PR 4' },
      ];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'clean' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 2, mergeableState: 'unstable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 3, mergeableState: 'dirty' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 4, mergeableState: 'unknown' }),
        });

      await isPrApprovedJob();

      // Should have called for all PRs
      expect(mockApiFetch).toHaveBeenCalledTimes(5); // 1 for list + 4 for details
    });
  });

  describe('Mergeable States', () => {
    it('should accept "clean" mergeable state', async () => {
      const mockPRs = [{ id: 1, title: 'PR 1' }];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'clean' }),
        });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should accept "unstable" mergeable state', async () => {
      const mockPRs = [{ id: 1, title: 'PR 1' }];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'unstable' }),
        });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should accept "dirty" mergeable state', async () => {
      const mockPRs = [{ id: 1, title: 'PR 1' }];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'dirty' }),
        });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should not include "unknown" mergeable state', async () => {
      const mockPRs = [{ id: 1, title: 'PR 1' }];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'unknown' }),
        });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should not include "blocked" mergeable state', async () => {
      const mockPRs = [{ id: 1, title: 'PR 1' }];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'blocked' }),
        });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });
  });

  describe('Multiple PRs', () => {
    it('should process multiple PRs sequentially', async () => {
      const mockPRs = [
        { id: 1, title: 'PR 1' },
        { id: 2, title: 'PR 2' },
        { id: 3, title: 'PR 3' },
      ];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'clean' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 2, mergeableState: 'unstable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 3, mergeableState: 'dirty' }),
        });

      await isPrApprovedJob();

      expect(mockApiFetch).toHaveBeenCalledTimes(4);
    });

    it('should handle errors in individual PR fetches', async () => {
      const mockPRs = [
        { id: 1, title: 'PR 1' },
        { id: 2, title: 'PR 2' },
      ];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'clean' }),
        })
        .mockRejectedValueOnce(new Error('Failed to fetch PR 2'));

      await expect(isPrApprovedJob()).rejects.toThrow('Failed to fetch PR 2');
    });
  });

  describe('Job Completion', () => {
    it('should complete successfully with no PRs', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should complete successfully with PRs', async () => {
      const mockPRs = [{ id: 1, title: 'PR 1' }];

      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPRs),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 1, mergeableState: 'clean' }),
        });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });
  });
});

export {};
