/**
 * Pull Requests Management Job Tests
 * 
 * Tests for the unified PR management job including:
 * - Checking PRs ready to merge
 * - Sending reminders for old PRs
 * - Deleting merged PRs
 * - Error handling
 */

import pullRequestsManagementJob from '../src/jobs/pull-requests-management.job';
import { PullRequestService, PRWithDetails } from '../src/services/pull-request.service';
import { publishNotificationRequest } from '../src/services/notification.service';

// Mock Redis client
const mockPublish = jest.fn();
const mockRedisClient = {
  publish: mockPublish,
  quit: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
};

// Mock dependencies
jest.mock('../src/utils/redis', () => ({
  getRedisClient: jest.fn(() => mockRedisClient),
}));

jest.mock('../src/services/notification.service', () => ({
  publishNotificationRequest: jest.fn(),
}));

// Mock the PullRequestService class with static methods
jest.mock('../src/services/pull-request.service', () => {
  return {
    PullRequestService: class MockPullRequestService {
      static fetchAllPRsWithDetails = jest.fn();
      static filterByState = jest.fn();
      static filterByMerged = jest.fn();
      static filterByMergeableState = jest.fn();
      static calculateAgeInDays = jest.fn();
    },
    PRWithDetails: {} as Record<string, never>,
  };
});

const mockPublishNotificationRequest = publishNotificationRequest as jest.MockedFunction<typeof publishNotificationRequest>;

// Get references to the mock functions
const mockFetchAllPRsWithDetails = PullRequestService.fetchAllPRsWithDetails as jest.Mock;
const mockFilterByState = PullRequestService.filterByState as jest.Mock;
const mockFilterByMerged = PullRequestService.filterByMerged as jest.Mock;
const mockFilterByMergeableState = PullRequestService.filterByMergeableState as jest.Mock;
const mockCalculateAgeInDays = PullRequestService.calculateAgeInDays as jest.Mock;

describe('Pull Requests Management Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPublish.mockResolvedValue(1);
    mockPublishNotificationRequest.mockResolvedValue();
  });

  describe('Successful execution with various PR states', () => {
    it('should handle PRs ready to merge', async () => {
      const mockPRs = [
        {
          dbId: '1',
          number: 123,
          state: 'open',
          merged: false,
          mergeableState: 'clean',
          createdAt: new Date().toISOString(),
          dbRepository: 'owner/repo',
        },
        {
          dbId: '2',
          number: 456,
          state: 'open',
          merged: false,
          mergeableState: 'unstable',
          createdAt: new Date().toISOString(),
          dbRepository: 'owner/repo',
        },
      ];

      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: mockPRs,
        errors: [],
      });

      mockFilterByState.mockReturnValue(mockPRs);
      mockFilterByMerged.mockImplementation((prs, merged) =>
        merged ? [] : mockPRs,
      );
      mockFilterByMergeableState.mockImplementation((prs, states) => {
        if (states.includes('clean') || states.includes('unstable')) {
          return mockPRs;
        }
        return [];
      });

      await pullRequestsManagementJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Pull Requests Ready to Merge',
          type: 'info',
        }),
      );
    });

    it('should handle PRs with conflicts', async () => {
      const mockPRs = [
        {
          dbId: '1',
          number: 123,
          state: 'open',
          merged: false,
          mergeableState: 'dirty',
          createdAt: new Date().toISOString(),
          dbRepository: 'owner/repo',
        },
      ];

      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: mockPRs,
        errors: [],
      });

      mockFilterByState.mockReturnValue(mockPRs);
      mockFilterByMerged.mockReturnValue(mockPRs);
      mockFilterByMergeableState.mockImplementation((prs, states) => {
        if (states.includes('dirty')) {
          return mockPRs;
        }
        return [];
      });

      await pullRequestsManagementJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Pull Requests with Conflicts',
          type: 'warning',
        }),
      );
    });

    it('should handle old PRs (3+ days)', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 4);

      const mockPRs = [
        {
          dbId: '1',
          number: 123,
          state: 'open',
          merged: false,
          mergeableState: 'clean',
          createdAt: threeDaysAgo.toISOString(),
          dbRepository: 'owner/repo',
        },
      ];

      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: mockPRs,
        errors: [],
      });

      mockFilterByState.mockReturnValue(mockPRs);
      mockFilterByMerged.mockReturnValue(mockPRs);
      mockFilterByMergeableState.mockReturnValue([]);
      mockCalculateAgeInDays.mockReturnValue(4);

      await pullRequestsManagementJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Pull Requests Reminder (3+ days old)',
          type: 'info',
        }),
      );
    });

    it('should handle old PRs (7+ days)', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);

      const mockPRs = [
        {
          dbId: '1',
          number: 123,
          state: 'open',
          merged: false,
          mergeableState: 'clean',
          createdAt: sevenDaysAgo.toISOString(),
          dbRepository: 'owner/repo',
        },
      ];

      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: mockPRs,
        errors: [],
      });

      mockFilterByState.mockReturnValue(mockPRs);
      mockFilterByMerged.mockReturnValue(mockPRs);
      mockFilterByMergeableState.mockReturnValue([]);
      mockCalculateAgeInDays.mockReturnValue(8);

      await pullRequestsManagementJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Pull Requests Reminder (7+ days old)',
          type: 'warning',
        }),
      );
    });

    it('should handle merged PRs and publish deletion requests', async () => {
      const mockPRs = [
        {
          dbId: '1',
          number: 123,
          state: 'closed',
          merged: true,
          mergeableState: 'unknown',
          createdAt: new Date().toISOString(),
          mergedAt: '2024-01-15T10:00:00Z',
          dbRepository: 'owner/repo',
        },
        {
          dbId: '2',
          number: 456,
          state: 'closed',
          merged: true,
          mergeableState: 'unknown',
          createdAt: new Date().toISOString(),
          mergedAt: '2024-01-16T10:00:00Z',
          dbRepository: 'owner/repo2',
        },
      ];

      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: mockPRs,
        errors: [],
      });

      mockFilterByState.mockReturnValue([]);
      mockFilterByMerged.mockImplementation((prs, merged) =>
        merged ? mockPRs : [],
      );

      await pullRequestsManagementJob();

      expect(mockPublish).toHaveBeenCalledTimes(2);
      expect(mockPublish).toHaveBeenCalledWith(
        'pull-request:delete',
        expect.stringContaining('"id":"1"'),
      );
      expect(mockPublish).toHaveBeenCalledWith(
        'pull-request:delete',
        expect.stringContaining('"id":"2"'),
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle empty PR list', async () => {
      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: [],
        errors: [],
      });

      await pullRequestsManagementJob();

      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
      expect(mockPublish).not.toHaveBeenCalled();
    });

    it('should handle errors when fetching PR details', async () => {
      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: [],
        errors: [
          { prId: '1', error: new Error('API error') },
          { prId: '2', error: new Error('Network error') },
        ],
      });

      await pullRequestsManagementJob();

      // Should complete without throwing
      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
    });

    it('should handle errors when publishing deletion requests', async () => {
      const mockPRs = [
        {
          dbId: '1',
          number: 123,
          state: 'closed',
          merged: true,
          mergeableState: 'unknown',
          createdAt: new Date().toISOString(),
          mergedAt: '2024-01-15T10:00:00Z',
          dbRepository: 'owner/repo',
        },
      ];

      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: mockPRs,
        errors: [],
      });

      mockFilterByState.mockReturnValue([]);
      mockFilterByMerged.mockImplementation((prs, merged) =>
        merged ? mockPRs : [],
      );

      mockPublish.mockRejectedValue(new Error('Redis error'));

      await pullRequestsManagementJob();

      // Should complete without throwing
      expect(mockPublish).toHaveBeenCalled();
    });

    it('should handle complete job failure gracefully', async () => {
      mockFetchAllPRsWithDetails.mockRejectedValue(
        new Error('Complete failure'),
      );

      await pullRequestsManagementJob();

      // Should complete without throwing
      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
    });
  });

  describe('Multiple operations in single run', () => {
    it('should handle all operations when PRs exist in all states', async () => {
      const now = new Date();
      const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

      const mockPRs = [
        {
          dbId: '1',
          number: 123,
          state: 'open',
          merged: false,
          mergeableState: 'clean',
          createdAt: now.toISOString(),
          dbRepository: 'owner/repo',
        },
        {
          dbId: '2',
          number: 456,
          state: 'open',
          merged: false,
          mergeableState: 'dirty',
          createdAt: fourDaysAgo.toISOString(),
          dbRepository: 'owner/repo',
        },
        {
          dbId: '3',
          number: 789,
          state: 'closed',
          merged: true,
          mergeableState: 'unknown',
          createdAt: now.toISOString(),
          mergedAt: '2024-01-15T10:00:00Z',
          dbRepository: 'owner/repo',
        },
      ];

      mockFetchAllPRsWithDetails.mockResolvedValue({
        allPRs: mockPRs,
        errors: [],
      });

      mockFilterByState.mockReturnValue(mockPRs.slice(0, 2));
      mockFilterByMerged.mockImplementation((prs: PRWithDetails[], merged: boolean) => {
        if (merged) {
          return [mockPRs[2]];
        }
        return prs.filter((pr: PRWithDetails) => !pr.merged);
      });
      mockFilterByMergeableState.mockImplementation((prs, states) => {
        if (states.includes('clean')) {
          return [mockPRs[0]];
        }
        if (states.includes('dirty')) {
          return [mockPRs[1]];
        }
        return [];
      });
      mockCalculateAgeInDays.mockImplementation((date) => {
        if (date === fourDaysAgo.toISOString()) {
          return 4;
        }
        return 0;
      });

      await pullRequestsManagementJob();

      // Should send notifications for ready to merge, conflicts, and old PRs
      expect(mockPublishNotificationRequest).toHaveBeenCalledTimes(3);
      
      // Should publish deletion request for merged PR
      expect(mockPublish).toHaveBeenCalledTimes(1);
    });
  });
});

