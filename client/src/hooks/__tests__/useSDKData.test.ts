import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { useSDKData, useSDKMutation } from '../useSDKData';
import { APIError } from '@my-dashboard/sdk';

// Mock the contexts
const mockLogout = vi.fn();
const mockApi = {
  someMethod: vi.fn(),
};

vi.mock('../../contexts/useSDK', () => ({
  useSDK: () => ({
    api: mockApi,
    isReady: true,
  }),
}));

vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

describe('useSDKData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('401 error handling', () => {
    it('should call logout when fetcher throws 401 APIError', async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new APIError(401, 'Unauthorized'));

      const { result } = renderHook(() => useSDKData(mockFetcher));

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });

      // Should not set error state when 401 occurs
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should not call logout for non-401 APIErrors', async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new APIError(500, 'Server Error'));

      const { result } = renderHook(() => useSDKData(mockFetcher));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(mockLogout).not.toHaveBeenCalled();
      expect(result.current.error?.message).toBe('Server Error');
    });

    it('should not call logout for non-APIError errors', async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useSDKData(mockFetcher));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(mockLogout).not.toHaveBeenCalled();
      expect(result.current.error?.message).toBe('Network Error');
    });
  });

  describe('successful data fetching', () => {
    it('should fetch and return data successfully', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const mockFetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useSDKData(mockFetcher));

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });
});

describe('useSDKMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('401 error handling', () => {
    it('should call logout when mutation throws 401 APIError', async () => {
      const mockMutationFn = vi.fn().mockRejectedValue(new APIError(401, 'Unauthorized'));

      const { result } = renderHook(() => useSDKMutation(mockMutationFn));

      await act(async () => {
        try {
          await result.current.mutate('test-data');
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });

      // Should still throw the error for the caller to handle
      expect(result.current.loading).toBe(false);
    });

    it('should not call logout for non-401 APIErrors', async () => {
      const mockMutationFn = vi.fn().mockRejectedValue(new APIError(500, 'Server Error'));

      const { result } = renderHook(() => useSDKMutation(mockMutationFn));

      await act(async () => {
        try {
          await result.current.mutate('test-data');
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(mockLogout).not.toHaveBeenCalled();
      expect(result.current.error?.message).toBe('Server Error');
    });
  });

  describe('successful mutation', () => {
    it('should execute mutation successfully', async () => {
      const mockResult = { id: 1, success: true };
      const mockMutationFn = vi.fn().mockResolvedValue(mockResult);

      const { result } = renderHook(() => useSDKMutation(mockMutationFn));

      let mutationResult;
      await act(async () => {
        mutationResult = await result.current.mutate('test-data');
      });

      expect(mutationResult).toEqual(mockResult);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });
});
