import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TestResultsPerApp from '../index';
import type { DetailedE2EReportDetail } from '@my-dashboard/types';

// Mock dependencies
const mockTriggerManualRun = vi.fn();
const mockGetAppLastStatus = vi.fn();
const mockRefetchData = vi.fn();
const mockEnqueueSnackbar = vi.fn();
const mockApi = {
  applications: {
    getApplication: vi.fn(),
  },
};

vi.mock('@/hooks/useE2ERun', () => ({
  useTriggerManualRun: () => ({
    mutate: mockTriggerManualRun,
  }),
  useGetAppLastStatus: () => ({
    mutate: mockGetAppLastStatus,
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
      onContextMenu={(e) => onContextMenu(e, result)}
    >
      <button onClick={() => onUpdate()}>Update</button>
      {result.app?.name}
    </div>
  ),
}));

vi.mock('../ContextMenu.tsx', () => ({
  default: ({ onOpenUrl, onCopyProjectName, onCopyProjectCode, onTriggerE2ERuns }: any) => (
    <div data-testid="context-menu">
      <button onClick={() => onOpenUrl('https://example.com')}>Open URL</button>
      <button onClick={onCopyProjectName}>Copy Name</button>
      <button onClick={onCopyProjectCode}>Copy Code</button>
      <button onClick={onTriggerE2ERuns}>Trigger E2E</button>
    </div>
  ),
}));

describe('TestResultsPerApp index', () => {
  const createMockData = (overrides?: Partial<DetailedE2EReportDetail>): DetailedE2EReportDetail => ({
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
    mockApi.applications.getApplication.mockResolvedValue({
      id: 1,
      name: 'Test App',
      code: 'test-app-123',
    });
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
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

  it('renders project cards for apps with failures', () => {
    const data = [
      createMockData({ appId: 1, failedRuns: 10 }),
      createMockData({ appId: 2, failedRuns: 5 }),
    ];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);
    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-2')).toBeInTheDocument();
  });

  it('filters out apps without failures', () => {
    const data = [
      createMockData({ appId: 1, failedRuns: 10 }),
      createMockData({ appId: 2, failedRuns: 0 }),
    ];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);
    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('project-card-2')).not.toBeInTheDocument();
  });

  it('sorts data by success rate ascending', () => {
    const data = [
      createMockData({ appId: 1, successRate: 0.8, failedRuns: 10 }),
      createMockData({ appId: 2, successRate: 0.5, failedRuns: 20 }),
      createMockData({ appId: 3, successRate: 0.9, failedRuns: 5 }),
    ];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);
    const cards = screen.getAllByTestId(/project-card-/);
    // Should be sorted: 0.5, 0.8, 0.9
    expect(cards[0]).toHaveAttribute('data-testid', 'project-card-2');
    expect(cards[1]).toHaveAttribute('data-testid', 'project-card-1');
    expect(cards[2]).toHaveAttribute('data-testid', 'project-card-3');
  });

  it('calls onUpdate when update button is clicked', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10, reportSummaryId: 100 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockGetAppLastStatus).toHaveBeenCalledWith({ summaryId: 100, appId: 1 });
    });
  });

  it('opens context menu on right click', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });
  });

  it('fetches app details when context menu is opened', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(mockApi.applications.getApplication).toHaveBeenCalledWith(1);
    });
  });

  it('handles context menu open URL action', async () => {
    const mockWindowOpen = vi.fn();
    window.open = mockWindowOpen;

    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    const openUrlButton = screen.getByText('Open URL');
    fireEvent.click(openUrlButton);

    expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('handles context menu copy project name action', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    const copyNameButton = screen.getByText('Copy Name');
    fireEvent.click(copyNameButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test App');
    });
  });

  it('handles context menu copy project code action', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    const copyCodeButton = screen.getByText('Copy Code');
    fireEvent.click(copyCodeButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-app-123');
    });
  });

  it('handles context menu trigger E2E runs action', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Trigger E2E');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(mockTriggerManualRun).toHaveBeenCalledWith(1);
      expect(mockRefetchData).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'E2E run for Test App were triggered successfully!',
        expect.objectContaining({ variant: 'success' }),
      );
    });
  });

  it('handles error when fetching app details fails', async () => {
    mockApi.applications.getApplication.mockResolvedValue(null);

    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Failed to fetch application details.',
        expect.objectContaining({ variant: 'error' }),
      );
    });
  });

  it('handles error when API is not available', async () => {
    vi.mocked(require('@/contexts/useSDK').useSDK).mockReturnValue({ api: null });

    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'API is not available.',
        expect.objectContaining({ variant: 'error' }),
      );
    });
  });

  it('handles error when triggering E2E runs fails', async () => {
    mockTriggerManualRun.mockRejectedValue(new Error('Trigger failed'));

    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Trigger E2E');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Failed to trigger E2E runs: Trigger failed',
        expect.objectContaining({ variant: 'error' }),
      );
    });
  });

  it('renders pagination when there are more than PAGE_SIZE items', () => {
    const data = Array.from({ length: 15 }, (_, i) =>
      createMockData({ appId: i + 1, failedRuns: 10 }));
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    // Should show pagination
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('does not render pagination when items fit on one page', () => {
    const data = Array.from({ length: 5 }, (_, i) =>
      createMockData({ appId: i + 1, failedRuns: 10 }));
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    // Should not show pagination
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('changes page when pagination is clicked', async () => {
    const data = Array.from({ length: 15 }, (_, i) =>
      createMockData({ appId: i + 1, failedRuns: 10, successRate: 0.5 + i * 0.01 }));
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    // Click page 2
    const page2Button = screen.getByRole('button', { name: /go to page 2/i });
    fireEvent.click(page2Button);

    await waitFor(() => {
      // Should show different cards on page 2
      expect(screen.queryByTestId('project-card-1')).not.toBeInTheDocument();
    });
  });

  it('closes context menu when clicking outside', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
    });
  });

  it('closes context menu when right-clicking on a different card', async () => {
    const data = [
      createMockData({ appId: 1, failedRuns: 10, app: { ...createMockData().app!, name: 'App 1' } }),
      createMockData({ appId: 2, failedRuns: 10, app: { ...createMockData().app!, name: 'App 2' } }),
    ];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card1 = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card1);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    // Right-click on different card
    const card2 = screen.getByTestId('project-card-2');
    fireEvent.contextMenu(card2);

    // Context menu should update
    await waitFor(() => {
      expect(mockApi.applications.getApplication).toHaveBeenCalledWith(2);
    });
  });

  it('handles missing app ID when triggering E2E runs', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10, id: undefined })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const card = screen.getByTestId('project-card-1');
    fireEvent.contextMenu(card);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Trigger E2E');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'App ID is missing. Cannot trigger E2E runs.',
        expect.objectContaining({ variant: 'error' }),
      );
    });
  });

  it('refetches data after updating last run status', async () => {
    const data = [createMockData({ appId: 1, failedRuns: 10, reportSummaryId: 100 })];
    render(<TestResultsPerApp data={data} isLoading={false} refetchData={mockRefetchData} />);

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockRefetchData).toHaveBeenCalled();
    });
  });
});
