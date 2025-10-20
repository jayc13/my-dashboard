/**
 * Jira Service Tests
 * 
 * Tests for JiraService including:
 * - Fetch issues
 * - Format Jira issue
 */

import { JiraService } from '../../services/jira.service';

// Mock fetch
global.fetch = jest.fn();

describe('JiraService', () => {
  let service: JiraService;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JIRA_BASE_URL = 'https://jira.example.com';
    process.env.JIRA_API_TOKEN = 'test-token';
    process.env.JIRA_EMAIL = 'test@example.com';
    service = new JiraService();
  });

  describe('fetchIssues', () => {
    it('should fetch issues successfully', async () => {
      const mockResponse = {
        issues: [
          {
            id: '1',
            key: 'TEST-1',
            fields: {
              summary: 'Test issue',
              status: { name: 'In Progress' },
              created: '2025-10-01T10:00:00Z',
              updated: '2025-10-08T10:00:00Z',
              assignee: { displayName: 'John Doe' },
              reporter: { displayName: 'Jane Smith' },
              labels: ['bug'],
              priority: { name: 'High' },
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.fetchIssues('project = TEST');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('jql=project%20%3D%20TEST'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'Accept': 'application/json',
          }),
        }),
      );
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid JQL' }),
      } as Response);

      await expect(service.fetchIssues('invalid jql')).rejects.toThrow('Failed to fetch issues');
    });
  });

  describe('formatJiraIssue', () => {
    it('should format issue with all fields', () => {
      const mockIssue = {
        id: '1',
        key: 'TEST-1',
        fields: {
          summary: 'Test issue',
          status: { name: 'In Progress' },
          created: '2025-10-01T10:00:00Z',
          updated: '2025-10-08T10:00:00Z',
          assignee: { displayName: 'John Doe' },
          reporter: { displayName: 'Jane Smith' },
          labels: ['bug', 'urgent'],
          priority: { name: 'High' },
          parent: {
            id: '2',
            key: 'TEST-2',
            fields: {
              summary: 'Parent issue',
            },
          },
        },
      };

      const result = service.formatJiraIssue(mockIssue as any);

      expect(result).toEqual({
        id: '1',
        key: 'TEST-1',
        url: 'https://jira.example.com/browse/TEST-1',
        summary: 'Test issue',
        status: 'In Progress',
        created: '2025-10-01T10:00:00Z',
        updated: '2025-10-08T10:00:00Z',
        assignee: 'John Doe',
        reporter: 'Jane Smith',
        labels: ['bug', 'urgent'],
        priority: 'High',
        parent: {
          id: '2',
          key: 'TEST-2',
          url: 'https://jira.example.com/browse/TEST-2',
          summary: 'Parent issue',
        },
      });
    });

    it('should format issue without optional fields', () => {
      const mockIssue = {
        id: '1',
        key: 'TEST-1',
        fields: {
          summary: 'Test issue',
          status: { name: 'Open' },
          created: '2025-10-01T10:00:00Z',
          updated: '2025-10-08T10:00:00Z',
          assignee: null,
          reporter: null,
          labels: [],
          priority: null,
          parent: null,
        },
      };

      const result = service.formatJiraIssue(mockIssue as any);

      expect(result).toEqual({
        id: '1',
        key: 'TEST-1',
        url: 'https://jira.example.com/browse/TEST-1',
        summary: 'Test issue',
        status: 'Open',
        created: '2025-10-01T10:00:00Z',
        updated: '2025-10-08T10:00:00Z',
        assignee: 'Unassigned',
        reporter: 'Unknown',
        labels: [],
        priority: 'None',
        parent: undefined,
      });
    });

    it('should format issue with undefined labels', () => {
      const mockIssue = {
        id: '1',
        key: 'TEST-1',
        fields: {
          summary: 'Test issue',
          status: { name: 'Open' },
          created: '2025-10-01T10:00:00Z',
          updated: '2025-10-08T10:00:00Z',
          assignee: { displayName: 'John Doe' },
          reporter: { displayName: 'Jane Smith' },
          labels: undefined,
          priority: { name: 'Medium' },
          parent: null,
        },
      };

      const result = service.formatJiraIssue(mockIssue as any);

      expect(result.labels).toEqual([]);
    });

    it('should format issue with falsy assignee', () => {
      const mockIssue = {
        id: '1',
        key: 'TEST-1',
        fields: {
          summary: 'Test issue',
          status: { name: 'Open' },
          created: '2025-10-01T10:00:00Z',
          updated: '2025-10-08T10:00:00Z',
          assignee: undefined,
          reporter: { displayName: 'Jane Smith' },
          labels: [],
          priority: { name: 'Medium' },
          parent: null,
        },
      };

      const result = service.formatJiraIssue(mockIssue as any);

      expect(result.assignee).toBe('Unassigned');
    });

    it('should format issue with falsy reporter', () => {
      const mockIssue = {
        id: '1',
        key: 'TEST-1',
        fields: {
          summary: 'Test issue',
          status: { name: 'Open' },
          created: '2025-10-01T10:00:00Z',
          updated: '2025-10-08T10:00:00Z',
          assignee: { displayName: 'John Doe' },
          reporter: undefined,
          labels: [],
          priority: { name: 'Medium' },
          parent: null,
        },
      };

      const result = service.formatJiraIssue(mockIssue as any);

      expect(result.reporter).toBe('Unknown');
    });

    it('should format issue with falsy priority', () => {
      const mockIssue = {
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
          priority: undefined,
          parent: null,
        },
      };

      const result = service.formatJiraIssue(mockIssue as any);

      expect(result.priority).toBe('None');
    });
  });
});

