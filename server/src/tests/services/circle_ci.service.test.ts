/**
 * CircleCI Service Tests
 * 
 * Tests for CircleCIService including:
 * - Triggering E2E runs
 * - Getting pipeline workflow status
 */

import { CircleCIService } from '../../services/circle_ci.service';

// Mock fetch
global.fetch = jest.fn();

describe('CircleCIService', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CIRCLE_CI_TOKEN = 'test-token';
    process.env.CIRCLE_CI_BASE_URL = 'https://circleci.com';
    process.env.CIRCLE_CI_API_BASE_URL = 'https://circleci.com';
    process.env.CIRCLE_CI_PROJECT_PATH = 'test-org/test-repo';
  });

  describe('triggerE2ERuns', () => {
    it('should trigger E2E runs successfully', async () => {
      const requestBody = JSON.stringify({
        branch: 'main',
        parameters: {
          run_e2e: true,
        },
      });

      const mockResponse = {
        id: 'pipeline-123',
        state: 'created',
        number: 456,
        created_at: '2025-10-08T10:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await CircleCIService.triggerE2ERuns(requestBody);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://circleci.com/v2/project/github/test-org/test-repo/pipeline',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'circle-token': 'test-token',
          },
          body: requestBody,
        },
      );
    });

    it('should throw error when CIRCLE_CI_TOKEN is missing', async () => {
      delete process.env.CIRCLE_CI_TOKEN;

      await expect(CircleCIService.triggerE2ERuns('{}')).rejects.toThrow(
        'CIRCLE_CI_TOKEN environment variable is required',
      );
    });

    it('should throw error when CIRCLE_CI_API_BASE_URL is missing', async () => {
      delete process.env.CIRCLE_CI_API_BASE_URL;

      await expect(CircleCIService.triggerE2ERuns('{}')).rejects.toThrow(
        'CIRCLE_CI_API_BASE_URL environment variable is required',
      );
    });

    it('should throw error when CIRCLE_CI_PROJECT_PATH is missing', async () => {
      delete process.env.CIRCLE_CI_PROJECT_PATH;

      await expect(CircleCIService.triggerE2ERuns('{}')).rejects.toThrow(
        'CIRCLE_CI_PROJECT_PATH environment variable is required',
      );
    });

    it('should throw error when request body is invalid JSON', async () => {
      await expect(CircleCIService.triggerE2ERuns('invalid json')).rejects.toThrow(
        'Invalid JSON format in request body parameter',
      );
    });

    it('should throw error when API request fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid parameters',
      } as Response);

      await expect(CircleCIService.triggerE2ERuns('{}')).rejects.toThrow(
        'Circle CI API request failed: 400 Bad Request - Invalid parameters',
      );
    });

    it('should throw error when fetch throws', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(CircleCIService.triggerE2ERuns('{}')).rejects.toThrow('Network error');
    });
  });

  describe('getPipelineLatestWorkflow', () => {
    it('should get pipeline latest workflow successfully', async () => {
      const mockWorkflow = {
        pipeline_id: 'pipeline-123',
        id: 'workflow-1',
        name: 'integration_tests',
        project_slug: 'gh/test-org/test-repo',
        status: 'success',
        started_by: 'user@example.com',
        pipeline_number: 456,
        created_at: '2025-10-08T10:00:00Z',
        stopped_at: '2025-10-08T10:30:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [mockWorkflow],
          next_page_token: null,
        }),
      } as Response);

      const result = await CircleCIService.getPipelineLatestWorkflow('pipeline-123');

      expect(result).toEqual(mockWorkflow);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://circleci.com/v2/pipeline/pipeline-123/workflow',
        {
          method: 'GET',
          headers: {
            'circle-token': 'test-token',
          },
        },
      );
    });

    it('should throw error when CIRCLE_CI_TOKEN is missing', async () => {
      delete process.env.CIRCLE_CI_TOKEN;

      await expect(CircleCIService.getPipelineLatestWorkflow('pipeline-123')).rejects.toThrow(
        'CIRCLE_CI_TOKEN environment variable is required',
      );
    });

    it('should throw error when CIRCLE_CI_BASE_URL is missing', async () => {
      delete process.env.CIRCLE_CI_BASE_URL;

      await expect(CircleCIService.getPipelineLatestWorkflow('pipeline-123')).rejects.toThrow(
        'CIRCLE_CI_BASE_URL environment variable is required',
      );
    });

    it('should throw error when pipeline ID is missing', async () => {
      await expect(CircleCIService.getPipelineLatestWorkflow('')).rejects.toThrow(
        'Pipeline ID is required',
      );
    });

    it('should throw error when no workflow found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
          next_page_token: null,
        }),
      } as Response);

      await expect(CircleCIService.getPipelineLatestWorkflow('pipeline-123')).rejects.toThrow(
        'No workflow named "integration_tests" found in the pipeline',
      );
    });

    it('should throw error when API request fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Pipeline not found',
      } as Response);

      await expect(CircleCIService.getPipelineLatestWorkflow('pipeline-123')).rejects.toThrow(
        'Circle CI API request failed: 404 Not Found - Pipeline not found',
      );
    });

    it('should handle multiple workflows and return first one', async () => {
      const mockWorkflows = [
        {
          pipeline_id: 'pipeline-123',
          id: 'workflow-1',
          name: 'integration_tests',
          project_slug: 'gh/test-org/test-repo',
          status: 'success',
          started_by: 'user@example.com',
          pipeline_number: 456,
          created_at: '2025-10-08T10:00:00Z',
        },
        {
          pipeline_id: 'pipeline-123',
          id: 'workflow-2',
          name: 'build',
          project_slug: 'gh/test-org/test-repo',
          status: 'success',
          started_by: 'user@example.com',
          pipeline_number: 456,
          created_at: '2025-10-08T09:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: mockWorkflows,
        }),
      } as Response);

      const result = await CircleCIService.getPipelineLatestWorkflow('pipeline-123');

      expect(result).toEqual(mockWorkflows[0]);
    });
  });
});

