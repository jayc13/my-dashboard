import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import E2EPage from '../E2EPage';
import type { DetailedE2EReport } from '@my-dashboard/types';

// Mock the child components
vi.mock('../components/TestResultsPerApp', () => ({
  default: () => <div data-testid="test-results-per-app">Test Results</div>,
}));

vi.mock('../components/E2EGeneralMetrics', () => ({
  default: () => <div data-testid="e2e-general-metrics">General Metrics</div>,
}));

vi.mock('../components/LoadingBackdrop.tsx', () => ({
  default: () => <div data-testid="loading-backdrop">Loading</div>,
}));

vi.mock('@/components/common', () => ({
  TooltipIconButton: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

describe('E2EPage', () => {
  const mockRefetch = vi.fn();

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
  });

  it('renders error state', () => {
    const error = new Error('Test error');
    render(
      <E2EPage data={null} prevData={null} loading={false} error={error} refetch={mockRefetch} />,
    );

    expect(screen.getByText('Error fetching information')).toBeInTheDocument();
  });

  it('renders main content when no error', () => {
    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={mockRefetch}
      />,
    );

    expect(screen.getByTestId('e2e-page')).toBeInTheDocument();
    expect(screen.getByTestId('test-results-per-app')).toBeInTheDocument();
    expect(screen.getByTestId('e2e-general-metrics')).toBeInTheDocument();
  });

  it('renders loading backdrop', () => {
    render(
      <E2EPage data={mockData} prevData={null} loading={true} error={null} refetch={mockRefetch} />,
    );

    expect(screen.getByTestId('loading-backdrop')).toBeInTheDocument();
  });

  it('renders with null data', () => {
    render(
      <E2EPage data={null} prevData={null} loading={false} error={null} refetch={mockRefetch} />,
    );

    expect(screen.getByTestId('e2e-page')).toBeInTheDocument();
  });

  it('calls refetch when refresh button is clicked', () => {
    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={mockRefetch}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('disables refresh button while refetching', async () => {
    let resolveRefetch: () => void;
    const slowRefetch = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRefetch = resolve;
        }),
    );

    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={slowRefetch}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button') as HTMLButtonElement;

    // Button should be enabled initially
    expect(refreshButton.disabled).toBe(false);

    // Click the refresh button
    fireEvent.click(refreshButton);

    // Button should be disabled while refetching
    await waitFor(() => {
      expect(refreshButton.disabled).toBe(true);
    });

    // Resolve the refetch promise
    resolveRefetch!();

    // Button should be enabled again after refetch completes
    await waitFor(() => {
      expect(refreshButton.disabled).toBe(false);
    });

    expect(slowRefetch).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator while refetching', async () => {
    let resolveRefetch: () => void;
    const slowRefetch = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRefetch = resolve;
        }),
    );

    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={slowRefetch}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button');

    // Click the refresh button
    fireEvent.click(refreshButton);

    // Should show CircularProgress while refetching
    await waitFor(() => {
      const circularProgress = refreshButton.querySelector('.MuiCircularProgress-root');
      expect(circularProgress).toBeInTheDocument();
    });

    // Resolve the refetch promise
    resolveRefetch!();

    // Should show RefreshIcon again after refetch completes
    await waitFor(() => {
      const circularProgress = refreshButton.querySelector('.MuiCircularProgress-root');
      expect(circularProgress).not.toBeInTheDocument();
    });
  });

  it('re-enables button even if refetch fails', async () => {
    const failingRefetch = vi.fn(() => Promise.reject(new Error('Refetch failed')));

    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={failingRefetch}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button') as HTMLButtonElement;

    // Click the refresh button
    fireEvent.click(refreshButton);

    // Button should be disabled while refetching
    await waitFor(() => {
      expect(refreshButton.disabled).toBe(true);
    });

    // Button should be enabled again even after failure
    await waitFor(() => {
      expect(refreshButton.disabled).toBe(false);
    });

    expect(failingRefetch).toHaveBeenCalledTimes(1);
  });

  it('prevents multiple simultaneous refetch calls', async () => {
    let resolveRefetch: () => void;
    const slowRefetch = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRefetch = resolve;
        }),
    );

    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={slowRefetch}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button') as HTMLButtonElement;

    // Click the refresh button multiple times
    fireEvent.click(refreshButton);
    fireEvent.click(refreshButton);
    fireEvent.click(refreshButton);

    // Should only call refetch once because button is disabled
    await waitFor(() => {
      expect(slowRefetch).toHaveBeenCalledTimes(1);
    });

    // Resolve the refetch promise
    resolveRefetch!();

    await waitFor(() => {
      expect(refreshButton.disabled).toBe(false);
    });
  });
});
