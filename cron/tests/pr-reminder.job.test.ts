/**
 * PR Reminder Job Tests
 *
 * Tests for the PR reminder job including:
 * - Fetching pull requests
 * - Calculating PR age
 * - Sending notifications for old PRs
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

describe('PR Reminder Job', () => {
  let prReminderJob: () => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Setup default mock for publishNotificationRequest
    mockPublishNotificationRequest.mockResolvedValue(undefined);

    const jobModule = require('../src/jobs/pr-reminder.job');
    prReminderJob = jobModule.default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Job Execution', () => {
    it('should execute without errors when no PRs found', async () => {
      mockGetPullRequests.mockResolvedValueOnce([]);

      await expect(prReminderJob()).resolves.not.toThrow();
    });

    it('should handle empty pull request list', async () => {
      mockGetPullRequests.mockResolvedValueOnce([]);

      await expect(prReminderJob()).resolves.not.toThrow();
      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
    });
  });

  describe('PR Age Calculation', () => {
    it('should identify PRs older than 3 days', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 4);

      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({
        id: 1,
        number: 1,
        state: 'open',
        merged: false,
        createdAt: threeDaysAgo.toISOString(),
      });

      await prReminderJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Pull Requests Reminder (3+ days old)',
          type: 'info',
        }),
      );
    });

    it('should identify PRs older than 7 days', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);

      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({
        id: 1,
        number: 1,
        state: 'open',
        merged: false,
        createdAt: sevenDaysAgo.toISOString(),
      });

      await prReminderJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Pull Requests Reminder (7+ days old)',
          type: 'warning',
        }),
      );
    });

    it('should not notify for PRs less than 3 days old', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({
        id: 1,
        number: 1,
        state: 'open',
        merged: false,
        createdAt: twoDaysAgo.toISOString(),
      });

      await prReminderJob();

      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
    });
  });

  describe('PR State Filtering', () => {
    it('should only check open PRs', async () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({
        id: 1,
        number: 1,
        state: 'closed',
        merged: false,
        createdAt: fourDaysAgo.toISOString(),
      });

      await prReminderJob();

      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
    });

    it('should not check merged PRs', async () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const mockPRs = [{ id: '1', pullRequestNumber: 1, repository: 'test/repo' }];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails.mockResolvedValueOnce({
        id: 1,
        number: 1,
        state: 'open',
        merged: true,
        createdAt: fourDaysAgo.toISOString(),
      });

      await prReminderJob();

      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
    });
  });

  describe('Multiple PRs', () => {
    it('should handle multiple PRs with different ages', async () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      const mockPRs = [
        { id: '1', pullRequestNumber: 1, repository: 'test/repo' },
        { id: '2', pullRequestNumber: 2, repository: 'test/repo' },
      ];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails
        .mockResolvedValueOnce({
          id: 1,
          number: 1,
          state: 'open',
          merged: false,
          createdAt: fourDaysAgo.toISOString(),
        })
        .mockResolvedValueOnce({
          id: 2,
          number: 2,
          state: 'open',
          merged: false,
          createdAt: eightDaysAgo.toISOString(),
        });

      await prReminderJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledTimes(2);
      expect(mockPublishNotificationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Pull Requests Reminder (3+ days old)',
        }),
      );
      expect(mockPublishNotificationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Pull Requests Reminder (7+ days old)',
        }),
      );
    });

    it('should continue processing after individual PR errors', async () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const mockPRs = [
        { id: '1', pullRequestNumber: 1, repository: 'test/repo' },
        { id: '2', pullRequestNumber: 2, repository: 'test/repo' },
      ];

      mockGetPullRequests.mockResolvedValueOnce(mockPRs);
      mockGetPullRequestDetails
        .mockRejectedValueOnce(new Error('Failed to fetch PR 1'))
        .mockResolvedValueOnce({
          id: 2,
          number: 2,
          state: 'open',
          merged: false,
          createdAt: fourDaysAgo.toISOString(),
        });

      await prReminderJob();

      // Should still process the second PR
      expect(mockGetPullRequestDetails).toHaveBeenCalledTimes(2);
      expect(mockPublishNotificationRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle SDK errors gracefully', async () => {
      mockGetPullRequests.mockRejectedValueOnce(new Error('SDK error'));

      // Should not throw, error is caught and logged
      await expect(prReminderJob()).resolves.not.toThrow();
    });
  });
});

export {};

