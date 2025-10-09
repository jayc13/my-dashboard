/**
 * Jira Controller Tests
 *
 * Tests for jira_controller including:
 * - Get manual QA tasks
 * - Get my tickets
 */

import { Request, Response, NextFunction } from 'express';
import { ExternalServiceError } from '../../errors';

// Create mock instance
const mockJiraService = {
  fetchIssues: jest.fn(),
  formatJiraIssue: jest.fn(),
};

// Mock dependencies before importing controller
jest.mock('../../services/jira.service', () => {
  return {
    JiraService: jest.fn().mockImplementation(() => mockJiraService),
  };
});

// Import after mocking
import { getManualQATasks, getMyTickets } from '../../controllers/jira_controller';

describe('Jira Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      query: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('getManualQATasks', () => {
    it('should return manual QA tasks', async () => {
      const mockIssues = [
        { key: 'ISSUE-1', summary: 'Task 1', status: 'In Progress' },
        { key: 'ISSUE-2', summary: 'Task 2', status: 'In Review' },
      ];
      const mockFormattedIssues = [
        { key: 'ISSUE-1', title: 'Task 1', status: 'In Progress' },
        { key: 'ISSUE-2', title: 'Task 2', status: 'In Review' },
      ];
      
      mockJiraService.fetchIssues.mockResolvedValue({
        total: 2,
        issues: mockIssues,
      } as any);
      
      mockJiraService.formatJiraIssue
        .mockReturnValueOnce(mockFormattedIssues[0] as any)
        .mockReturnValueOnce(mockFormattedIssues[1] as any);

      await getManualQATasks(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJiraService.fetchIssues).toHaveBeenCalledWith(
        expect.stringContaining('labels in ("manual_qa")')
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: 2,
          issues: mockFormattedIssues,
        },
      });
    });

    it('should call next with ExternalServiceError when service throws error', async () => {
      mockJiraService.fetchIssues.mockRejectedValue(new Error('Jira API error'));

      await getManualQATasks(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ExternalServiceError));
    });
  });

  describe('getMyTickets', () => {
    it('should return my tickets', async () => {
      const mockIssues = [
        { key: 'ISSUE-3', summary: 'My Task 1', status: 'To Do' },
        { key: 'ISSUE-4', summary: 'My Task 2', status: 'In Progress' },
      ];
      const mockFormattedIssues = [
        { key: 'ISSUE-3', title: 'My Task 1', status: 'To Do' },
        { key: 'ISSUE-4', title: 'My Task 2', status: 'In Progress' },
      ];
      
      mockJiraService.fetchIssues.mockResolvedValue({
        total: 2,
        issues: mockIssues,
      } as any);
      
      mockJiraService.formatJiraIssue
        .mockReturnValueOnce(mockFormattedIssues[0] as any)
        .mockReturnValueOnce(mockFormattedIssues[1] as any);

      await getMyTickets(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJiraService.fetchIssues).toHaveBeenCalledWith(
        expect.stringContaining('assignee = currentUser()')
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: 2,
          issues: mockFormattedIssues,
        },
      });
    });

    it('should call next with ExternalServiceError when service throws error', async () => {
      mockJiraService.fetchIssues.mockRejectedValue(new Error('Jira API error'));

      await getMyTickets(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ExternalServiceError));
    });
  });
});

