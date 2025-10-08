/**
 * Cypress Service Tests
 * 
 * Tests for CypressService
 */

import { CypressService } from '../services/cypress.service';

// Mock fetch
global.fetch = jest.fn();

describe('CypressService', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CYPRESS_DASHBOARD_API_KEY = 'test-api-key';
  });

  describe('constructor', () => {
    it('should create instance with API key', () => {
      const service = new CypressService();
      expect(service).toBeDefined();
    });
  });

  describe('getRunDetails', () => {
    it('should fetch run details', async () => {
      const service = new CypressService();
      const mockResponse = {
        runId: 'run-123',
        status: 'passed',
        totalTests: 10,
        passedTests: 10,
        failedTests: 0,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.getRunDetails('run-123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should throw error when fetch fails', async () => {
      const service = new CypressService();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(service.getRunDetails('run-123')).rejects.toThrow();
    });
  });
});

