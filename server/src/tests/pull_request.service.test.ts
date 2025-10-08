/**
 * Pull Request Service Tests
 *
 * Tests for PullRequestService including:
 * - List pull requests
 * - Get pull request by ID
 * - Add pull request
 * - Delete pull request
 */

import { PullRequestService } from '../services/pull_request.service';
import { db } from '../db/database';

// Mock dependencies
jest.mock('../db/database');

describe('PullRequestService', () => {
  const mockDb = db as jest.Mocked<typeof db>;
  let service: PullRequestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PullRequestService();
  });

  describe('listPullRequests', () => {
    it('should return all pull requests', async () => {
      const mockRows = [
        {
          id: 1,
          pull_request_number: 123,
          repo: 'owner/repo1',
        },
        {
          id: 2,
          pull_request_number: 124,
          repo: 'owner/repo2',
        },
      ];

      mockDb.all.mockResolvedValue(mockRows);

      const result = await service.listPullRequests();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        pullRequestNumber: 123,
        repository: 'owner/repo1',
      });
      expect(result[1]).toEqual({
        id: 2,
        pullRequestNumber: 124,
        repository: 'owner/repo2',
      });
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM pull_requests ORDER BY id DESC');
    });

    it('should return empty array when no pull requests exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await service.listPullRequests();

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      await expect(service.listPullRequests()).rejects.toThrow('Database error');
    });
  });

  describe('getPullRequestById', () => {
    it('should return pull request by id', async () => {
      const mockRow = {
        id: 1,
        pull_request_number: 123,
        repo: 'owner/repo',
      };

      mockDb.get.mockResolvedValue(mockRow);

      const result = await service.getPullRequestById(1);

      expect(result).toEqual({
        id: 1,
        pullRequestNumber: 123,
        repository: 'owner/repo',
      });
      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM pull_requests WHERE id = ?', [1]);
    });

    it('should throw error when pull request not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      await expect(service.getPullRequestById(999)).rejects.toThrow('Pull request with id 999 not found');
    });

    it('should throw error when database query fails', async () => {
      mockDb.get.mockRejectedValue(new Error('Database error'));

      await expect(service.getPullRequestById(1)).rejects.toThrow('Database error');
    });
  });

  describe('addPullRequest', () => {
    it('should add pull request', async () => {
      const input = {
        pullRequestNumber: 125,
        repository: 'owner/repo',
      };

      const mockCreatedPR = {
        id: 3,
        pull_request_number: 125,
        repo: 'owner/repo',
      };

      mockDb.run.mockResolvedValue({ insertId: 3 });
      mockDb.get.mockResolvedValue(mockCreatedPR);

      const result = await service.addPullRequest(input);

      expect(result).toEqual({
        id: 3,
        pullRequestNumber: 125,
        repository: 'owner/repo',
      });
      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO pull_requests (pull_request_number, repo) VALUES (?, ?)',
        [125, 'owner/repo'],
      );
    });

    it('should throw error when required fields are missing', async () => {
      await expect(service.addPullRequest({ pullRequestNumber: 0, repository: '' })).rejects.toThrow(
        'Pull request number and repository are required'
      );
    });

    it('should throw error when database insert fails', async () => {
      const input = {
        pullRequestNumber: 125,
        repository: 'owner/repo',
      };

      mockDb.run.mockRejectedValue(new Error('Database error'));

      await expect(service.addPullRequest(input)).rejects.toThrow('Database error');
    });

    it('should throw error when newly added PR cannot be retrieved', async () => {
      const input = {
        pullRequestNumber: 125,
        repository: 'owner/repo',
      };

      mockDb.run.mockResolvedValue({ insertId: 3 });
      mockDb.get.mockResolvedValue(undefined);

      await expect(service.addPullRequest(input)).rejects.toThrow('Failed to retrieve newly added pull request');
    });
  });

  describe('deletePullRequest', () => {
    it('should delete pull request', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await service.deletePullRequest(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM pull_requests WHERE id = ?', [1]);
    });

    it('should throw error when database delete fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Database error'));

      await expect(service.deletePullRequest(1)).rejects.toThrow('Database error');
    });
  });
});

