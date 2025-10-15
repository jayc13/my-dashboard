import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TestResultsPerApp from '../index';
import type { DetailedE2EReportDetail } from '@my-dashboard/types';

// Mock dependencies
const mockTriggerManualRun = vi.fn();
const mockGetAppLastStatus = vi.fn();
const mockRefetchData = vi.fn();
const mockEnqueueSnackbar = vi.fn();
const mockWindowOpen = vi.fn();
const mockApi = {
  applications: {
    getApplication: vi.fn(),
  },
};

vi.mock('@/hooks/useE2ERun', () => ({
  useTriggerManualRun: () => ({
    mutate: (data: any) => Promise.resolve(mockTriggerManualRun(data)),
  }),
  useGetAppLastStatus: () => ({
    mutate: (data: any) => Promise.resolve(mockGetAppLastStatus(data)),
  }),
}));

vi.mock('@/contexts/useSDK', () => ({
  useSDK: () => ({
    api: mockApi,
  }),
}));

vi.mock('notistack', () => ({
  enqueueSnackbar: (message: string, options: any) => mockEnqueueSnackbar(message, options),
}));

// Mock child components
vi.mock('../LoadingState', () => ({
  default: () => <div data-testid="loading-state">Loading...</div>,
}));

vi.mock('../EmptyStates', () => ({
  AllTestsPassing: () => <div data-testid="all-tests-passing">All tests passing!</div>,
  NoTestResults: () => <div data-testid="no-test-results">No test results</div>,
}));

vi.mock('../ProjectCard', () => ({
  default: ({ result, onUpdate, onContextMenu }: any) => (
    <div
      data-testid={`project-card-${result.appId}`}
      data-project-card={result.app?.name}
      onContextMenu={e => onContextMenu(e, result.app)}
    >
      <button onClick={() => onUpdate()}>Update</button>
      {result.app?.name}
    </div>
  ),
}));

vi.mock('../ContextMenu.tsx', () => ({
  default: ({
    loadingAppDetails,
    onOpenUrl,
    onCopyProjectName,
    onCopyProjectCode,
    onTriggerE2ERuns,
    result,
  }: any) => (
    <div data-testid="context-menu">
      {loadingAppDetails ? (
        <div data-testid="context-menu-loading">Loading...</div>
      ) : (
        <>
          <button onClick={() => onOpenUrl(result?.pipelineUrl || 'https://example.com')}>
            Open URL
          </button>
          <button onClick={onCopyProjectName}>Copy Name</button>
          <button onClick={onCopyProjectCode}>Copy Code</button>
          <button onClick={onTriggerE2ERuns}>Trigger E2E</button>
        </>
      )}
    </div>
  ),
}));

describe('TestResultsPerApp index', () => {
  const createMockData = (
    overrides?: Partial<DetailedE2EReportDetail>,
  ): DetailedE2EReportDetail => ({
    id: 1,
    reportSummaryId: 1,
    appId: 1,
    totalRuns: 100,
    passedRuns: 80,
    failedRuns: 20,
    successRate: 0.8,
    lastRunStatus: 'passed',
    lastFailedRunAt: '2024-01-01T00:00:00Z',
    lastRunAt: '2024-01-15T10:30:00Z',
    app: {
      id: 1,
      name: 'Test App',
      code: 'test-app-123',
      pipelineUrl: 'https://example.com/pipeline',
      e2eTriggerConfiguration: '{}',
      watching: true,
      e2eRunsQuantity: 100,
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetchData.mockResolvedValue(undefined);
    mockTriggerManualRun.mockResolvedValue(undefined);
    mockGetAppLastStatus.mockResolvedValue(undefined);
    // Return the full app structure that the component expects
    mockApi.applications.getApplication.mockResolvedValue({
      id: 1,
      name: 'Test App',
      code: 'test-app-123',
      pipelineUrl: 'https://example.com/pipeline',
      e2eTriggerConfiguration: '{}',
      watching: true,
      e2eRunsQuantity: 100,
    });
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    // Mock window.open
    global.window.open = mockWindowOpen;
  });

  it('renders loading state when isLoading is true', () => {
    render(<TestResultsPerApp data={[]} isLoading={true} refetchData={mockRefetchData} />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders no test results when data is empty', () => {
    render(<TestResultsPerApp data={[]} isLoading={false} refetchData={mockRefetchData} />);
    expect(screen.getByTestId('no-test-results')).toBeInTheDocument();
  });

  it('renders all tests passing when no failures', () => {
    const data = [createMockData({ failedRuns: 0 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);
    expect(screen.getByTestId('all-tests-passing')).toBeInTheDocument();
  });

  it('renders project cards with failures', () => {
    const data = [createMockData()];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);
    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('sorts data by success rate ascending', () => {
    const data = [
      createMockData({
        appId: 1,
        successRate: 0.9,
        app: { id: 1, name: 'App 1', code: 'app-1', e2eRunsQuantity: 10, watching: true },
      }),
      createMockData({
        appId: 2,
        successRate: 0.5,
        app: { id: 2, name: 'App 2', code: 'app-2', e2eRunsQuantity: 20, watching: false },
      }),
      createMockData({
        appId: 3,
        successRate: 0.7,
        app: { id: 3, name: 'App 3', code: 'app-3', e2eRunsQuantity: 30, watching: true },
      }),
    ];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const cards = screen.getAllByTestId(/project-card-/);
    // App 2 should be first (lowest success rate)
    expect(cards[0]).toHaveAttribute('data-testid', 'project-card-2');
  });

  it('calls updateLastRunStatus when update button is clicked', async () => {
    const data = [createMockData()];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const updateButton = screen.getByText('Update');
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(mockGetAppLastStatus).toHaveBeenCalledWith({ summaryId: 1, appId: 1 });
      expect(mockRefetchData).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('does not show pagination when there is only one page', () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('shows pagination when there are multiple pages', () => {
      // Create 13 items to have 2 pages (PAGE_SIZE is 12)
      const data = Array.from({ length: 13 }, (_, i) =>
        createMockData({
          appId: i + 1,
          id: i + 1,
          app: {
            id: i + 1,
            name: `App ${i + 1}`,
            code: `app-${i + 1}`,
            e2eRunsQuantity: 100 + i,
            watching: i % 2 === 0,
          },
        }),
      );
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('changes page when pagination is clicked', async () => {
      const data = Array.from({ length: 13 }, (_, i) =>
        createMockData({
          appId: i + 1,
          id: i + 1,
          successRate: 0.5 + i * 0.01,
          app: {
            id: i + 1,
            name: `App ${i + 1}`,
            code: `app-${i + 1}`,
            e2eRunsQuantity: 100 + i,
            watching: i % 2 === 0,
          },
        }),
      );
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const page2Button = screen.getByRole('button', { name: 'Go to page 2' });
      await userEvent.click(page2Button);

      // Should show the 13th item on page 2
      await waitFor(() => {
        expect(screen.getByTestId('project-card-13')).toBeInTheDocument();
      });
    });
  });

  describe('Context Menu', () => {
    it('opens context menu on right click', async () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      // First it should show loading
      await waitFor(
        () => {
          expect(screen.getByTestId('context-menu-loading')).toBeInTheDocument();
        },
        { timeout: 1000 },
      );

      // Then it should show the actual menu after loading
      await waitFor(
        () => {
          expect(screen.getByText('Open URL')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('shows error when fetching app details fails', async () => {
      mockApi.applications.getApplication.mockResolvedValueOnce(null);
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to fetch application details.', {
            variant: 'error',
          });
        },
        { timeout: 3000 },
      );
    });

    it('opens URL in new tab when clicking Open URL', async () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      // Wait for menu to finish loading
      await waitFor(
        () => {
          expect(screen.getByText('Open URL')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const openUrlButton = screen.getByText('Open URL');
      await userEvent.click(openUrlButton);

      expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/pipeline', '_blank');

      // Context menu should be closed
      await waitFor(
        () => {
          expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('copies project name to clipboard', async () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(screen.getByText('Copy Name')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const copyNameButton = screen.getByText('Copy Name');
      await userEvent.click(copyNameButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test App');

      // Context menu should be closed
      await waitFor(
        () => {
          expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('copies project code to clipboard', async () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(screen.getByText('Copy Code')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const copyCodeButton = screen.getByText('Copy Code');
      await userEvent.click(copyCodeButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-app-123');

      // Context menu should be closed
      await waitFor(
        () => {
          expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('triggers E2E runs successfully', async () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(screen.getByText('Trigger E2E')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const triggerButton = screen.getByText('Trigger E2E');
      await userEvent.click(triggerButton);

      await waitFor(
        () => {
          expect(mockTriggerManualRun).toHaveBeenCalledWith(1);
          expect(mockRefetchData).toHaveBeenCalled();
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            'E2E run for Test App were triggered successfully!',
            { variant: 'success', autoHideDuration: 10000 },
          );
        },
        { timeout: 3000 },
      );
    });

    it('shows error when triggering E2E runs fails', async () => {
      mockTriggerManualRun.mockRejectedValueOnce(new Error('Network error'));
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(screen.getByText('Trigger E2E')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const triggerButton = screen.getByText('Trigger E2E');
      await userEvent.click(triggerButton);

      await waitFor(
        () => {
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            'Failed to trigger E2E runs: Network error',
            { variant: 'error' },
          );
        },
        { timeout: 3000 },
      );
    });

    it('shows error when triggering E2E runs with unknown error', async () => {
      mockTriggerManualRun.mockRejectedValueOnce('Unknown error');
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(screen.getByText('Trigger E2E')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const triggerButton = screen.getByText('Trigger E2E');
      await userEvent.click(triggerButton);

      await waitFor(
        () => {
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            'Failed to trigger E2E runs: Unknown error',
            { variant: 'error' },
          );
        },
        { timeout: 3000 },
      );
    });

    it('closes context menu when clicking outside', async () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Click outside the context menu
      fireEvent.mouseDown(document.body);

      await waitFor(
        () => {
          expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('closes context menu when right-clicking on a different card', async () => {
      const data = [
        createMockData({
          appId: 1,
          app: { id: 1, name: 'App 1', code: 'app-1', e2eRunsQuantity: 10, watching: true },
        }),
        createMockData({
          appId: 2,
          app: { id: 2, name: 'App 2', code: 'app-2', e2eRunsQuantity: 20, watching: false },
        }),
      ];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card1 = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card1);

      // Wait for first context menu to appear
      await waitFor(
        () => {
          expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Right-click on a different card - the component's event listener closes the menu
      const card2 = screen.getByTestId('project-card-2');
      fireEvent.contextMenu(card2);

      // The context menu should be closed
      await waitFor(
        () => {
          expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('does not close context menu when right-clicking on the same card', async () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Right-click on the same card again
      fireEvent.contextMenu(card);

      // Context menu should still be visible
      await waitFor(
        () => {
          expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });

    it('does not close context menu when clicking inside it', async () => {
      const data = [createMockData()];
      render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

      const card = screen.getByTestId('project-card-1');
      fireEvent.contextMenu(card);

      await waitFor(
        () => {
          expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.mouseDown(contextMenu);

      // Context menu should still be visible after a short wait
      await waitFor(
        () => {
          expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });
  });
});
