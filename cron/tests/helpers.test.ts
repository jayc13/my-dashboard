/**
 * Helpers Utility Tests
 * 
 * Tests for helper functions including:
 * - apiFetch with API key injection
 * - Header handling (Headers, Array, Object)
 * - API key configuration
 */

import { apiFetch } from '../src/utils/helpers';

// Mock fetch
global.fetch = jest.fn();

describe('Helpers Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_SECURITY_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apiFetch', () => {
    it('should call fetch with API key in headers', async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('http://localhost:3000/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          headers: {
            'x-api-key': 'test-api-key',
          },
        },
      );
    });

    it('should merge API key with existing headers object', async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('http://localhost:3000/api/test', {
        headers: {
          'Content-Type': 'application/json',
          'Custom-Header': 'custom-value',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          headers: {
            'Content-Type': 'application/json',
            'Custom-Header': 'custom-value',
            'x-api-key': 'test-api-key',
          },
        },
      );
    });

    it('should handle Headers instance', async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Custom-Header', 'custom-value');

      await apiFetch('http://localhost:3000/api/test', {
        headers,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          headers: {
            'content-type': 'application/json',
            'custom-header': 'custom-value',
            'x-api-key': 'test-api-key',
          },
        },
      );
    });

    it('should handle headers as array of tuples', async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('http://localhost:3000/api/test', {
        headers: [
          ['Content-Type', 'application/json'],
          ['Custom-Header', 'custom-value'],
        ],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          headers: {
            'Content-Type': 'application/json',
            'Custom-Header': 'custom-value',
            'x-api-key': 'test-api-key',
          },
        },
      );
    });

    it('should not add API key if not configured', async () => {
      delete process.env.API_SECURITY_KEY;
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('http://localhost:3000/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should not add API key if empty string', async () => {
      process.env.API_SECURITY_KEY = '';
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('http://localhost:3000/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should pass through other fetch options', async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          method: 'POST',
          body: JSON.stringify({ data: 'test' }),
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          },
        },
      );
    });

    it('should return the fetch response', async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiFetch('http://localhost:3000/api/test');

      expect(result).toBe(mockResponse);
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(error);

      await expect(apiFetch('http://localhost:3000/api/test')).rejects.toThrow('Network error');
    });

    it('should work with no init parameter', async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('http://localhost:3000/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          headers: {
            'x-api-key': 'test-api-key',
          },
        },
      );
    });
  });
});

