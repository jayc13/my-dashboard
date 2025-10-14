import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import E2EPageContainer from '../E2EPageContainer';
import type { DetailedE2EReport } from '@my-dashboard/types';

const mockRefetchData = vi.fn();

// Mock the hooks
vi.mock('@/hooks', () => ({
  useE2ERunReport: vi.fn(),
}));

// Mock E2EPage component
vi.mock('../E2EPage.tsx', () => ({
  default: ({ loading, error, refetch }: any) => (
    <div data-testid="e2e-page">
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error ? 'Error' : 'No Error'}</div>
      <button onClick={() => refetch()} data-testid="refetch-button">
        Refetch
      </button>
      <button onClick={() => refetch(true)} data-testid="force-refetch-button">
        Force Refetch
      </button>
    </div>
  ),
}));

describe('E2EPageContainer', () => {
  const mockData: DetailedE2EReport = {
    summary: {
      id: 1,
      date: '2024-01-01',
      status: 'ready',
      totalRuns: 100,
      passedRuns: 95,
      failedRuns: 5,
      successRate: 95,
    },
    message: 'Tests completed',
    details: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders E2EPage with data', async () => {
    const { useE2ERunReport } = await import('@/hooks');
    vi.mocked(useE2ERunReport).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: mockRefetchData,
    });

    render(<E2EPageContainer />);

    expect(screen.getByTestId('e2e-page')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
  });

  it('renders loading state', async () => {
    const { useE2ERunReport } = await import('@/hooks');
    vi.mocked(useE2ERunReport).mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      refetch: mockRefetchData,
    });

    render(<E2EPageContainer />);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('renders error state', async () => {
    const { useE2ERunReport } = await import('@/hooks');
    const error = new Error('Test error');
    vi.mocked(useE2ERunReport).mockReturnValue({
      data: undefined,
      loading: false,
      error,
      refetch: mockRefetchData,
    });

    render(<E2EPageContainer />);

    expect(screen.getByTestId('error')).toHaveTextContent('Error');
  });

  it('polls when status is pending', async () => {
    const { useE2ERunReport } = await import('@/hooks');
    const pendingData: DetailedE2EReport = {
      ...mockData,
      summary: {
        ...mockData.summary,
        status: 'pending',
      },
    };

    vi.mocked(useE2ERunReport).mockReturnValue({
      data: pendingData,
      loading: false,
      error: null,
      refetch: mockRefetchData,
    });

    render(<E2EPageContainer />);

    // Fast-forward time by 5 seconds
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockRefetchData).toHaveBeenCalled();
  });

  it('does not poll when status is not pending', async () => {
    const { useE2ERunReport } = await import('@/hooks');
    vi.mocked(useE2ERunReport).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: mockRefetchData,
    });

    render(<E2EPageContainer />);

    // Fast-forward time by 5 seconds
    vi.advanceTimersByTime(5000);

    // Should not have been called since status is 'passed'
    expect(mockRefetchData).not.toHaveBeenCalled();
  });

  it('calls both refetchData and refetchPrevData when refetch is called', async () => {
    const { useE2ERunReport } = await import('@/hooks');
    const mockRefetchPrevData = vi.fn().mockResolvedValue(undefined);
    mockRefetchData.mockResolvedValue(undefined);

    let callCount = 0;
    vi.mocked(useE2ERunReport).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call returns current data
        return {
          data: mockData,
          loading: false,
          error: null,
          refetch: mockRefetchData,
        };
      } else {
        // Second call returns previous data
        return {
          data: mockData,
          loading: false,
          error: null,
          refetch: mockRefetchPrevData,
        };
      }
    });

    render(<E2EPageContainer />);

    const refetchButton = screen.getByTestId('refetch-button');
    refetchButton.click();

    await vi.waitFor(() => {
      expect(mockRefetchData).toHaveBeenCalledWith(undefined);
      expect(mockRefetchPrevData).toHaveBeenCalledWith(undefined);
    });
  });

  it('calls both refetchData and refetchPrevData with force=true when force refetch is called', async () => {
    const { useE2ERunReport } = await import('@/hooks');
    const mockRefetchPrevData = vi.fn().mockResolvedValue(undefined);
    mockRefetchData.mockResolvedValue(undefined);

    let callCount = 0;
    vi.mocked(useE2ERunReport).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call returns current data
        return {
          data: mockData,
          loading: false,
          error: null,
          refetch: mockRefetchData,
        };
      } else {
        // Second call returns previous data
        return {
          data: mockData,
          loading: false,
          error: null,
          refetch: mockRefetchPrevData,
        };
      }
    });

    render(<E2EPageContainer />);

    const forceRefetchButton = screen.getByTestId('force-refetch-button');
    forceRefetchButton.click();

    await vi.waitFor(() => {
      expect(mockRefetchData).toHaveBeenCalledWith(true);
      expect(mockRefetchPrevData).toHaveBeenCalledWith(true);
    });
  });
});
