/**
 * Pull Request Controller Tests
 * 
 * Tests for PullRequestController including:
 * - List pull requests
 * - Get pull request by ID
 * - Add pull request
 * - Delete pull request
 */

import { Request, Response, NextFunction } from 'express';
import { PullRequestController } from '../controllers/pull_request.controller';
import { PullRequestService } from '../services/pull_request.service';

// Mock dependencies
jest.mock('../services/pull_request.service');

describe('PullRequestController', () => {
  let controller: PullRequestController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockPRService: jest.Mocked<PullRequestService>;

  beforeEach(() => {
    mockPRService = {
      listPullRequests: jest.fn(),
      getPullRequestById: jest.fn(),
      addPullRequest: jest.fn(),
      deletePullRequest: jest.fn(),
    } as any;

    (PullRequestService as jest.MockedClass<typeof PullRequestService>).mockImplementation(() => mockPRService);

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
        { id: 1, pullRequestNumber: 123, repository: 'owner/repo1' },
        { id: 2, pullRequestNumber: 124, repository: 'owner/repo2' },
      ];

      mockPRService.listPullRequests.mockResolvedValue(mockPRs);

      await controller.listPullRequests(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPRService.listPullRequests).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPRs,
      });
    });

    it('should call next with error on failure', async () => {
      mockPRService.listPullRequests.mockRejectedValue(new Error('DB error'));

      await controller.listPullRequests(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getPullRequestById', () => {
    it('should return pull request by id', async () => {
      mockRequest.params = { id: '1' };
      const mockPR = { id: 1, pullRequestNumber: 123, repository: 'owner/repo' };

      mockPRService.getPullRequestById.mockResolvedValue(mockPR);

      await controller.getPullRequestById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPRService.getPullRequestById).toHaveBeenCalledWith('1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPR,
      });
    });

    it('should call next with error on failure', async () => {
      mockRequest.params = { id: '1' };
      mockPRService.getPullRequestById.mockRejectedValue(new Error('Not found'));

      await controller.getPullRequestById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('addPullRequest', () => {
    it('should add pull request', async () => {
      mockRequest.body = {
        pullRequestNumber: 125,
        repository: 'owner/repo',
      };

      const mockPR = { id: 3, pullRequestNumber: 125, repository: 'owner/repo' };
      mockPRService.addPullRequest.mockResolvedValue(mockPR);

      await controller.addPullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPRService.addPullRequest).toHaveBeenCalledWith({
        pullRequestNumber: 125,
        repository: 'owner/repo',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPR,
      });
    });

    it('should call next with error on failure', async () => {
      mockRequest.body = {
        pullRequestNumber: 125,
        repository: 'owner/repo',
      };

      mockPRService.addPullRequest.mockRejectedValue(new Error('DB error'));

      await controller.addPullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deletePullRequest', () => {
    it('should delete pull request', async () => {
      mockRequest.params = { id: '1' };
      mockPRService.deletePullRequest.mockResolvedValue(undefined);

      await controller.deletePullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPRService.deletePullRequest).toHaveBeenCalledWith('1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pull request deleted successfully',
      });
    });

    it('should call next with error on failure', async () => {
      mockRequest.params = { id: '1' };
      mockPRService.deletePullRequest.mockRejectedValue(new Error('DB error'));

      await controller.deletePullRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

