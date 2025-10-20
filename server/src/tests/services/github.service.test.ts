/**
 * GitHub Service Tests
 * 
 * Tests for GitHubService
 */

import { GitHubService } from '../../services/github.service';

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

    it('should throw error when result is null', async () => {
      const mockOctokit = require('@octokit/core').Octokit;
      const mockRequest = jest.fn().mockResolvedValue(null);

      mockOctokit.mockImplementation(() => ({
        request: mockRequest,
      }));

      await expect(GitHubService.getPullRequestDetails('owner/repo', 456))
        .rejects.toThrow('Failed to fetch pull request details for owner/repo#456');
    });

    it('should throw error when result.data is null', async () => {
      const mockOctokit = require('@octokit/core').Octokit;
      const mockRequest = jest.fn().mockResolvedValue({
        data: null,
        status: 200,
      });

      mockOctokit.mockImplementation(() => ({
        request: mockRequest,
      }));

      await expect(GitHubService.getPullRequestDetails('owner/repo', 456))
        .rejects.toThrow('Failed to fetch pull request details for owner/repo#456');
    });

    it('should throw error when status is not 200', async () => {
      const mockOctokit = require('@octokit/core').Octokit;
      const mockRequest = jest.fn().mockResolvedValue({
        data: {
          id: 123,
          number: 456,
        },
        status: 404,
      });

      mockOctokit.mockImplementation(() => ({
        request: mockRequest,
      }));

      await expect(GitHubService.getPullRequestDetails('owner/repo', 456))
        .rejects.toThrow('Failed to fetch pull request: 404');
    });

    it('should handle pull request with labels', async () => {
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
          labels: [
            { name: 'bug', color: 'ff0000' },
            { name: 'urgent', color: '00ff00' },
          ],
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

      expect(result.labels).toEqual([
        { name: 'bug', color: 'ff0000' },
        { name: 'urgent', color: '00ff00' },
      ]);
    });

    it('should handle pull request without user', async () => {
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
          labels: null,
          mergeable_state: 'clean',
          merged: false,
          user: null,
        },
        status: 200,
      });

      mockOctokit.mockImplementation(() => ({
        request: mockRequest,
      }));

      const result = await GitHubService.getPullRequestDetails('owner/repo', 456);

      expect(result.author).toEqual({
        username: null,
        avatarUrl: null,
        htmlUrl: null,
      });
      expect(result.labels).toEqual([]);
    });
  });
});

