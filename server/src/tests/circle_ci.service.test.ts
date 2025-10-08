/**
 * CircleCI Service Tests
 * 
 * Tests for CircleCIService
 */

import { CircleCIService } from '../services/circle_ci.service';

// Mock fetch
global.fetch = jest.fn();

describe('CircleCIService', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CIRCLE_CI_TOKEN = 'test-token';
  });

  describe('triggerE2ERuns', () => {
    it('should trigger E2E runs', async () => {
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

      const result = await CircleCIService.triggerE2ERuns(
        'https://circleci.com/api/v2/project/gh/owner/repo/pipeline',
        { branch: 'main' }
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should throw error when trigger fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid parameters' }),
      } as Response);

      await expect(
        CircleCIService.triggerE2ERuns(
          'https://circleci.com/api/v2/project/gh/owner/repo/pipeline',
          { branch: 'main' }
        )
      ).rejects.toThrow();
    });
  });

  describe('getWorkflowDetails', () => {
    it('should fetch workflow details', async () => {
      const mockResponse = {
        id: 'workflow-123',
        name: 'test-workflow',
        status: 'success',
        created_at: '2025-10-08T10:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await CircleCIService.getWorkflowDetails('workflow-123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(CircleCIService.getWorkflowDetails('workflow-123')).rejects.toThrow();
    });
  });
});

