import { render, screen } from '@testing-library/react';
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
});
