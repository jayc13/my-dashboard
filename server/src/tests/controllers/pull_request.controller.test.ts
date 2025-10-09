/**
 * Pull Request Controller Tests
 *
 * Tests for PullRequestController including:
 * - List pull requests
 * - Add pull request
 * - Get pull request details
 * - Delete pull request
 */

import { Request, Response, NextFunction } from 'express';
import { NotFoundError, ValidationError, DatabaseError, ExternalServiceError } from '../../errors/AppError';

// Create mock instance
const mockPullRequestService = {
  listPullRequests: jest.fn(),
  addPullRequest: jest.fn(),
  getPullRequestById: jest.fn(),
  deletePullRequest: jest.fn(),
};

// Mock dependencies before importing controller
jest.mock('../../services/pull_request.service', () => {
  return {
    PullRequestService: jest.fn().mockImplementation(() => mockPullRequestService),
  };
});

jest.mock('../../services/github.service', () => ({
  GitHubService: {
    getPullRequestDetails: jest.fn(),
  },
}));

// Import after mocking
import { PullRequestController } from '../../controllers/pull_request.controller';
import { GitHubService } from '../../services/github.service';

describe('PullRequestController', () => {
  let controller: PullRequestController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new PullRequestController();
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('listPullRequests', () => {
    it('should return all pull requests', async () => {
      const mockPRs = [
        { id: 1, pullRequestNumber: 123, repository: 'repo1' },
        { id: 2, pullRequestNumber: 456, repository: 'repo2' },
      ];
      mockPullRequestService.listPullRequests.mockResolvedValue(mockPRs);

      await controller.listPullRequests(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPullRequestService.listPullRequests).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPRs,
      });
    });

    it('should call next with DatabaseError when service throws error', async () => {
      mockPullRequestService.listPullRequests.mockRejectedValue(new Error('Database error'));

      await controller.listPullRequests(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('addPullRequest', () => {
    it('should add a new pull request', async () => {
      const mockPR = { id: 1, pullRequestNumber: 123, repository: 'test-repo' };
      mockRequest.body = {
        pullRequestNumber: 123,
        repository: 'test-repo',
      };
      mockPullRequestService.addPullRequest.mockResolvedValue(mockPR);

      await controller.addPullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPullRequestService.addPullRequest).toHaveBeenCalledWith({
        pullRequestNumber: 123,
        repository: 'test-repo',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPR,
      });
    });

    it('should call next with ValidationError when required fields are missing', async () => {
      mockRequest.body = { pullRequestNumber: 123 };

      await controller.addPullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with ValidationError when pullRequestNumber is invalid', async () => {
      mockRequest.body = {
        pullRequestNumber: 'invalid',
        repository: 'test-repo',
      };

      await controller.addPullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      mockRequest.body = {
        pullRequestNumber: 123,
        repository: 'test-repo',
      };
      mockPullRequestService.addPullRequest.mockRejectedValue(new Error('Database error'));

      await controller.addPullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getPullRequestDetails', () => {
    it('should return pull request details from GitHub', async () => {
      const mockPR = { id: 1, pullRequestNumber: 123, repository: 'test-repo' };
      const mockDetails = {
        number: 123,
        title: 'Test PR',
        state: 'open',
        html_url: 'https://github.com/test-repo/pull/123',
      };
      mockRequest.params = { id: '1' };
      mockPullRequestService.getPullRequestById.mockResolvedValue(mockPR);
      (GitHubService.getPullRequestDetails as jest.Mock).mockResolvedValue(mockDetails);

      await controller.getPullRequestDetails(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPullRequestService.getPullRequestById).toHaveBeenCalledWith('1');
      expect(GitHubService.getPullRequestDetails).toHaveBeenCalledWith('test-repo', 123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDetails,
      });
    });

    it('should call next with NotFoundError when PR does not exist', async () => {
      mockRequest.params = { id: '999' };
      mockPullRequestService.getPullRequestById.mockRejectedValue(new Error('Pull request with id 999 not found'));

      await controller.getPullRequestDetails(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with ValidationError when id is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.getPullRequestDetails(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with ExternalServiceError when GitHub service throws error', async () => {
      const mockPR = { id: 1, pullRequestNumber: 123, repository: 'test-repo' };
      mockRequest.params = { id: '1' };
      mockPullRequestService.getPullRequestById.mockResolvedValue(mockPR);
      (GitHubService.getPullRequestDetails as jest.Mock).mockRejectedValue(new Error('GitHub API error'));

      await controller.getPullRequestDetails(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deletePullRequest', () => {
    it('should delete a pull request', async () => {
      const mockPR = { id: 1, pullRequestNumber: 123, repository: 'test-repo' };
      mockRequest.params = { id: '1' };
      mockPullRequestService.getPullRequestById.mockResolvedValue(mockPR);
      mockPullRequestService.deletePullRequest.mockResolvedValue(undefined);

      await controller.deletePullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPullRequestService.getPullRequestById).toHaveBeenCalledWith('1');
      expect(mockPullRequestService.deletePullRequest).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pull request deleted successfully',
      });
    });

    it('should call next with NotFoundError when PR does not exist', async () => {
      mockRequest.params = { id: '999' };
      mockPullRequestService.getPullRequestById.mockRejectedValue(new Error('Pull request with id 999 not found'));

      await controller.deletePullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with ValidationError when id is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.deletePullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      const mockPR = { id: 1, pullRequestNumber: 123, repository: 'test-repo' };
      mockRequest.params = { id: '1' };
      mockPullRequestService.getPullRequestById.mockResolvedValue(mockPR);
      mockPullRequestService.deletePullRequest.mockRejectedValue(new Error('Database error'));

      await controller.deletePullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

