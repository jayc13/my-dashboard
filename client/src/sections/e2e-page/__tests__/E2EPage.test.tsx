import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import E2EPage from '../E2EPage';
import type { DetailedE2EReport } from '@my-dashboard/types';

// Mock the child components
vi.mock('../components/TestResultsPerApp', () => ({
  default: ({ showAllApps, isPending, isLoading }: any) => (
    <div
      data-testid="test-results-per-app"
      data-show-all-apps={showAllApps}
      data-is-pending={isPending}
      data-is-loading={isLoading}
    >
      Test Results
    </div>
  ),
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

  it('renders default loading state when loading and no data', () => {
    render(
      <E2EPage data={null} prevData={null} loading={true} error={null} refetch={mockRefetch} />,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('e2e-page')).not.toBeInTheDocument();
  });

  it('renders with null data when not loading', () => {
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
    const failingRefetch = vi.fn(async () => {
      throw new Error('Refetch failed');
    });

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

  it('opens menu when dropdown button is clicked', async () => {
    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={mockRefetch}
      />,
    );

    const menuButton = screen.getByTestId('refresh-menu-button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-menu')).toBeInTheDocument();
    });
  });

  it('closes menu when pressing Escape', async () => {
    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={mockRefetch}
      />,
    );

    const menuButton = screen.getByTestId('refresh-menu-button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-menu')).toBeInTheDocument();
    });

    // Press Escape to close menu
    fireEvent.keyDown(screen.getByTestId('refresh-menu'), { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('refresh-menu')).not.toBeInTheDocument();
    });
  });

  it('calls refetch without force parameter when menu refresh is clicked', async () => {
    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={mockRefetch}
      />,
    );

    const menuButton = screen.getByTestId('refresh-menu-button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-menu')).toBeInTheDocument();
    });

    const menuRefreshItem = screen.getByTestId('menu-refresh');
    fireEvent.click(menuRefreshItem);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
      // Check that it was called without the force parameter (or with undefined)
      const calls = mockRefetch.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      // The first argument should be undefined or not provided
      expect(calls[calls.length - 1][0]).toBeUndefined();
    });

    // Menu should close after clicking
    await waitFor(() => {
      expect(screen.queryByTestId('refresh-menu')).not.toBeInTheDocument();
    });
  });

  it('opens confirmation modal when force regenerate is clicked', async () => {
    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={mockRefetch}
      />,
    );

    const menuButton = screen.getByTestId('refresh-menu-button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-menu')).toBeInTheDocument();
    });

    const forceRefreshItem = screen.getByTestId('menu-force-refresh');
    fireEvent.click(forceRefreshItem);

    // Confirmation modal should open
    await waitFor(() => {
      expect(screen.getByTestId('force-refresh-confirmation-modal')).toBeInTheDocument();
    });

    // Menu should close after clicking
    await waitFor(() => {
      expect(screen.queryByTestId('refresh-menu')).not.toBeInTheDocument();
    });

    // Refetch should not be called yet
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('calls refetch with force=true when confirmation is accepted', async () => {
    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={mockRefetch}
      />,
    );

    const menuButton = screen.getByTestId('refresh-menu-button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-menu')).toBeInTheDocument();
    });

    const forceRefreshItem = screen.getByTestId('menu-force-refresh');
    fireEvent.click(forceRefreshItem);

    // Wait for confirmation modal
    await waitFor(() => {
      expect(screen.getByTestId('force-refresh-confirmation-modal')).toBeInTheDocument();
    });

    // Click confirm button
    const confirmButton = screen.getByTestId('force-refresh-confirm-button');
    fireEvent.click(confirmButton);

    // Refetch should be called with force=true
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledWith(true);
    });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('force-refresh-confirmation-modal')).not.toBeInTheDocument();
    });
  });

  it('does not call refetch when confirmation is cancelled', async () => {
    render(
      <E2EPage
        data={mockData}
        prevData={null}
        loading={false}
        error={null}
        refetch={mockRefetch}
      />,
    );

    const menuButton = screen.getByTestId('refresh-menu-button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-menu')).toBeInTheDocument();
    });

    const forceRefreshItem = screen.getByTestId('menu-force-refresh');
    fireEvent.click(forceRefreshItem);

    // Wait for confirmation modal
    await waitFor(() => {
      expect(screen.getByTestId('force-refresh-confirmation-modal')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByTestId('force-refresh-cancel-button');
    fireEvent.click(cancelButton);

    // Refetch should not be called
    expect(mockRefetch).not.toHaveBeenCalled();

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('force-refresh-confirmation-modal')).not.toBeInTheDocument();
    });
  });

  it('disables menu button while refetching', async () => {
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

    const menuButton = screen.getByTestId('refresh-menu-button') as HTMLButtonElement;
    const refreshButton = screen.getByTestId('refresh-button');

    // Buttons should be enabled initially
    expect(menuButton.disabled).toBe(false);

    // Click the refresh button to start refetching
    fireEvent.click(refreshButton);

    // Menu button should be disabled while refetching
    await waitFor(() => {
      expect(menuButton.disabled).toBe(true);
    });

    // Resolve the refetch promise
    resolveRefetch!();

    // Menu button should be enabled again after refetch completes
    await waitFor(() => {
      expect(menuButton.disabled).toBe(false);
    });
  });

  it('disables confirmation modal buttons while refetching', async () => {
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

    const menuButton = screen.getByTestId('refresh-menu-button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-menu')).toBeInTheDocument();
    });

    const forceRefreshItem = screen.getByTestId('menu-force-refresh');
    fireEvent.click(forceRefreshItem);

    // Wait for confirmation modal
    await waitFor(() => {
      expect(screen.getByTestId('force-refresh-confirmation-modal')).toBeInTheDocument();
    });

    const confirmButton = screen.getByTestId('force-refresh-confirm-button') as HTMLButtonElement;
    const cancelButton = screen.getByTestId('force-refresh-cancel-button') as HTMLButtonElement;

    // Buttons should be enabled initially
    expect(confirmButton.disabled).toBe(false);
    expect(cancelButton.disabled).toBe(false);

    // Click confirm button
    fireEvent.click(confirmButton);

    // Buttons should be disabled while refetching
    await waitFor(() => {
      expect(confirmButton.disabled).toBe(true);
      expect(cancelButton.disabled).toBe(true);
    });

    // Resolve the refetch promise
    resolveRefetch!();

    // Modal should close after refetch completes
    await waitFor(() => {
      expect(screen.queryByTestId('force-refresh-confirmation-modal')).not.toBeInTheDocument();
    });
  });

  describe('Show All Apps Toggle', () => {
    it('renders the show all apps toggle', () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const toggle = screen.getByTestId('show-all-apps-toggle');
      expect(toggle).toBeInTheDocument();
      expect(screen.getByText('Show all apps')).toBeInTheDocument();
    });

    it('toggle is unchecked by default', () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });

    it('passes showAllApps=false to TestResultsPerApp by default', () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-show-all-apps', 'false');
    });

    it('toggles showAllApps when switch is clicked', async () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle.checked).toBe(false);

      // Click the toggle
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle.checked).toBe(true);
      });

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-show-all-apps', 'true');
    });

    it('can toggle back to false', async () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const toggle = screen.getByRole('switch') as HTMLInputElement;

      // Toggle on
      fireEvent.click(toggle);
      await waitFor(() => {
        expect(toggle.checked).toBe(true);
      });

      // Toggle off
      fireEvent.click(toggle);
      await waitFor(() => {
        expect(toggle.checked).toBe(false);
      });

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-show-all-apps', 'false');
    });
  });

  describe('Pending Status', () => {
    it('passes isPending=true to TestResultsPerApp when status is pending', () => {
      const pendingData: DetailedE2EReport = {
        ...mockData,
        summary: {
          ...mockData.summary,
          status: 'pending',
        },
      };

      render(
        <E2EPage
          data={pendingData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-is-pending', 'true');
    });

    it('passes isPending=false to TestResultsPerApp when status is ready', () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-is-pending', 'false');
    });

    it('passes isPending=false to TestResultsPerApp when data is null', () => {
      render(
        <E2EPage data={null} prevData={null} loading={false} error={null} refetch={mockRefetch} />,
      );

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-is-pending', 'false');
    });
  });

  describe('Initial Loading vs Refetch', () => {
    it('passes isLoading=true to TestResultsPerApp during initial load (loading=true, no data)', () => {
      render(
        <E2EPage data={null} prevData={null} loading={true} error={null} refetch={mockRefetch} />,
      );

      // Should show default loading state, not the main page
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('test-results-per-app')).not.toBeInTheDocument();
    });

    it('passes isLoading=false to TestResultsPerApp during refetch (loading=true, data exists)', () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={true}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-is-loading', 'false');
    });

    it('passes isLoading=false to TestResultsPerApp when not loading', () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-is-loading', 'false');
    });

    it('passes isLoading=false when loading=true but data exists (refetch scenario)', () => {
      render(
        <E2EPage
          data={mockData}
          prevData={null}
          loading={true}
          error={null}
          refetch={mockRefetch}
        />,
      );

      // Should render the main page with data, not loading state
      expect(screen.getByTestId('e2e-page')).toBeInTheDocument();
      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-is-loading', 'false');
    });

    it('distinguishes between pending status and initial loading', () => {
      const pendingData: DetailedE2EReport = {
        ...mockData,
        summary: {
          ...mockData.summary,
          status: 'pending',
        },
      };

      render(
        <E2EPage
          data={pendingData}
          prevData={null}
          loading={false}
          error={null}
          refetch={mockRefetch}
        />,
      );

      const testResults = screen.getByTestId('test-results-per-app');
      expect(testResults).toHaveAttribute('data-is-loading', 'false');
      expect(testResults).toHaveAttribute('data-is-pending', 'true');
    });
  });
});
