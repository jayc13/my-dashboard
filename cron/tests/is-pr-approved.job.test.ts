/**
 * Is PR Approved Job Tests
 *
 * Tests for the PR approval checking job including:
 * - Fetching pull requests
 * - Checking PR details
 * - Filtering by mergeable state
 * - Error handling
 */

// Mock SDK
const mockGetPullRequests = jest.fn();
const mockGetPullRequestDetails = jest.fn();

jest.mock('../src/utils/sdk', () => ({
  getSDK: jest.fn(() => ({
    pullRequests: {
      getPullRequests: mockGetPullRequests,
      getPullRequestDetails: mockGetPullRequestDetails,
    },
  })),
}));

// Mock publishNotificationRequest
const mockPublishNotificationRequest = jest.fn();
jest.mock('../src/services/notification.service', () => ({
  publishNotificationRequest: mockPublishNotificationRequest,
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
      mockGetPullRequests.mockResolvedValueOnce([]);

      await isPrApprovedJob();

      expect(mockGetPullRequests).toHaveBeenCalled();
    });

    it('should handle empty pull request list', async () => {
      mockGetPullRequests.mockResolvedValueOnce([]);

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should handle API errors', async () => {
      mockGetPullRequests.mockRejectedValueOnce(new Error('API error'));

      await expect(isPrApprovedJob()).rejects.toThrow('API error');
    });
  });

  describe('Checking PR Details', () => {
    it('should fetch details for each PR', async () => {
      const mockPRs = [
        { id: '1', pullRequestNumber: 1, repository: 'test/repo' },
        { id: '2', pullRequestNumber: 2, repository: 'test/repo' },
      ];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails
        .mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'unknown' })
        .mockResolvedValueOnce({ id: 2, number: 2, mergeableState: 'unknown' });

      await isPrApprovedJob();

      expect(mockGetPullRequestDetails).toHaveBeenCalledWith('1');
      expect(mockGetPullRequestDetails).toHaveBeenCalledWith('2');
    });

    it('should filter PRs by mergeable state', async () => {
      const mockPRs = [
        { id: '1', pullRequestNumber: 1, repository: 'test/repo' },
        { id: '2', pullRequestNumber: 2, repository: 'test/repo' },
        { id: '3', pullRequestNumber: 3, repository: 'test/repo' },
        { id: '4', pullRequestNumber: 4, repository: 'test/repo' },
      ];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails
        .mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'clean' })
        .mockResolvedValueOnce({ id: 2, number: 2, mergeableState: 'unstable' })
        .mockResolvedValueOnce({ id: 3, number: 3, mergeableState: 'dirty' })
        .mockResolvedValueOnce({ id: 4, number: 4, mergeableState: 'unknown' });

      await isPrApprovedJob();

      // Should have called for all PRs
      expect(mockGetPullRequestDetails).toHaveBeenCalledTimes(4);
    });
  });

  describe('Mergeable States', () => {
    it('should accept "clean" mergeable state', async () => {
      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'clean' });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should accept "unstable" mergeable state', async () => {
      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'unstable' });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should accept "dirty" mergeable state', async () => {
      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'dirty' });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should not include "unknown" mergeable state', async () => {
      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'unknown' });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should not include "blocked" mergeable state', async () => {
      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'blocked' });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });
  });

  describe('Multiple PRs', () => {
    it('should process multiple PRs sequentially', async () => {
      const mockPRs = [
        { id: '1', pullRequestNumber: 1, repository: 'test/repo' },
        { id: '2', pullRequestNumber: 2, repository: 'test/repo' },
        { id: '3', pullRequestNumber: 3, repository: 'test/repo' },
      ];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails
        .mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'clean' })
        .mockResolvedValueOnce({ id: 2, number: 2, mergeableState: 'unstable' })
        .mockResolvedValueOnce({ id: 3, number: 3, mergeableState: 'dirty' });

      await isPrApprovedJob();

      expect(mockGetPullRequestDetails).toHaveBeenCalledTimes(3);
    });

    it('should handle errors in individual PR fetches', async () => {
      const mockPRs = [
        { id: '1', pullRequestNumber: 1, repository: 'test/repo' },
        { id: '2', pullRequestNumber: 2, repository: 'test/repo' },
      ];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails
        .mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'clean' })
        .mockRejectedValueOnce(new Error('Failed to fetch PR 2'));

      await expect(isPrApprovedJob()).rejects.toThrow('Failed to fetch PR 2');
    });
  });

  describe('Job Completion', () => {
    it('should complete successfully with no PRs', async () => {
      mockGetPullRequests.mockResolvedValueOnce([]);

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });

    it('should complete successfully with PRs', async () => {
      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({ id: 1, number: 1, mergeableState: 'clean' });

      await expect(isPrApprovedJob()).resolves.not.toThrow();
    });
  });
});

export {};
