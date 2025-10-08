/**
 * GitHub Service Tests
 * 
 * Tests for GitHubService
 */

import { GitHubService } from '../services/github.service';

// Mock Octokit
jest.mock('@octokit/core', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      request: jest.fn(),
    })),
  };
});

describe('GitHubService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.GITHUB_URL = 'https://api.github.com';
  });

  describe('getPullRequestDetails', () => {
    it('should fetch pull request details', async () => {
      const mockOctokit = require('@octokit/core').Octokit;
      const mockRequest = jest.fn().mockResolvedValue({
        data: {
          id: 123,
          number: 456,
          title: 'Test PR',
          state: 'open',
          draft: false,
          html_url: 'https://github.com/owner/repo/pull/456',
          created_at: '2025-10-01T10:00:00Z',
          updated_at: '2025-10-08T10:00:00Z',
          closed_at: null,
          merged_at: null,
          labels: [],
          mergeable_state: 'clean',
          merged: false,
          user: {
            login: 'testuser',
            avatar_url: 'https://github.com/testuser.png',
            html_url: 'https://github.com/testuser',
          },
        },
        status: 200,
      });

      mockOctokit.mockImplementation(() => ({
        request: mockRequest,
      }));

      const result = await GitHubService.getPullRequestDetails('owner/repo', 456);

      expect(result).toBeDefined();
      expect(result.number).toBe(456);
      expect(result.title).toBe('Test PR');
    });
  });
});

