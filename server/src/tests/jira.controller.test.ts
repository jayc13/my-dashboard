/**
 * Jira Controller Tests
 * 
 * Tests for JiraController including:
 * - Fetch issues
 */

import { Request, Response, NextFunction } from 'express';
import { JiraController } from '../controllers/jira_controller';
import { JiraService } from '../services/jira.service';

// Mock dependencies
jest.mock('../services/jira.service');

describe('JiraController', () => {
  let controller: JiraController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJiraService: jest.Mocked<JiraService>;

  beforeEach(() => {
    mockJiraService = {
      fetchIssues: jest.fn(),
      formatJiraIssue: jest.fn(),
    } as any;

    (JiraService as jest.MockedClass<typeof JiraService>).mockImplementation(() => mockJiraService);

    controller = new JiraController();
    mockRequest = {
      query: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('fetchIssues', () => {
    it('should fetch and format Jira issues', async () => {
      mockRequest.query = { jql: 'project = TEST' };

      const mockIssues = {
        issues: [
          {
            id: '1',
            key: 'TEST-1',
            fields: {
              summary: 'Test issue',
              status: { name: 'Open' },
              created: '2025-10-01T10:00:00Z',
              updated: '2025-10-08T10:00:00Z',
              assignee: { displayName: 'John Doe' },
              reporter: { displayName: 'Jane Smith' },
              labels: [],
              priority: { name: 'High' },
            },
          },
        ],
      };

      const mockFormattedIssue = {
        id: '1',
        key: 'TEST-1',
        url: 'https://jira.example.com/browse/TEST-1',
        summary: 'Test issue',
        status: 'Open',
        created: '2025-10-01T10:00:00Z',
        updated: '2025-10-08T10:00:00Z',
        assignee: 'John Doe',
        reporter: 'Jane Smith',
        labels: [],
        priority: 'High',
      };

      mockJiraService.fetchIssues.mockResolvedValue(mockIssues);
      mockJiraService.formatJiraIssue.mockReturnValue(mockFormattedIssue);

      await controller.fetchIssues(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJiraService.fetchIssues).toHaveBeenCalledWith('project = TEST');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockFormattedIssue],
      });
    });

    it('should call next with error when jql is missing', async () => {
      mockRequest.query = {};

      await controller.fetchIssues(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error on failure', async () => {
      mockRequest.query = { jql: 'project = TEST' };
      mockJiraService.fetchIssues.mockRejectedValue(new Error('Jira API error'));

      await controller.fetchIssues(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

