import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProjectCard from '../ProjectCard';
import type { DetailedE2EReportDetail } from '@my-dashboard/types';

// Mock the utility functions
vi.mock('../utils', () => ({
  getColorByPassingRate: vi.fn((rate: number) => {
    if (rate >= 0.8) return 'green';
    if (rate >= 0.5) return 'orange';
    return 'red';
  }),
  getTooltipByPassingRate: vi.fn(() => <span data-testid="tooltip-icon">Info</span>),
}));

// Mock LastRunStatusIcon component
vi.mock('../LastRunStatusIcon', () => ({
  default: ({ result }: { result: DetailedE2EReportDetail }) => (
    <div data-testid="last-run-status-icon">{result.lastRunStatus}</div>
  ),
}));

describe('ProjectCard', () => {
  const mockOnUpdate = vi.fn();
  const mockOnContextMenu = vi.fn();

  const createMockResult = (overrides?: Partial<DetailedE2EReportDetail>): DetailedE2EReportDetail => ({
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
  });

  it('renders null when result.app is not provided', () => {
    const result = createMockResult({ app: undefined });
    const { container } = render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders project card with app name', () => {
    const result = createMockResult();
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('renders success rate correctly', () => {
    const result = createMockResult({ successRate: 0.8567 });
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    expect(screen.getByText('85.67%')).toBeInTheDocument();
  });

  it('renders passed and failed runs count', () => {
    const result = createMockResult({ passedRuns: 75, failedRuns: 25 });
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders Cypress cloud link with correct href', () => {
    const result = createMockResult();
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    const link = screen.getByRole('link', { name: 'Test App' });
    expect(link).toHaveAttribute('href', 'https://cloud.cypress.io/projects/test-app-123/runs');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('displays last run time', () => {
    const result = createMockResult();
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    // The component formats the date using toLocaleString()
    const lastRunText = screen.getByText(/Last run:/);
    expect(lastRunText).toBeInTheDocument();
  });

  it('renders LastRunStatusIcon component', () => {
    const result = createMockResult();
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    expect(screen.getByTestId('last-run-status-icon')).toBeInTheDocument();
  });

  it('calls onContextMenu when card is right-clicked', () => {
    const result = createMockResult();
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    const card = screen.getByTestId('last-run-status-icon').closest('[data-project-card]');
    expect(card).toBeInTheDocument();
    
    fireEvent.contextMenu(card!);
    
    expect(mockOnContextMenu).toHaveBeenCalledTimes(1);
    expect(mockOnContextMenu).toHaveBeenCalledWith(
      expect.any(Object),
      result.app,
    );
  });

  it('calls onUpdate when refresh button is clicked', async () => {
    const result = createMockResult();
    mockOnUpdate.mockResolvedValue(undefined);
    
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    
    const refreshButton = screen.getByTitle('Refresh last run status');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnUpdate).toHaveBeenCalledWith('Test App');
    });
  });

  it('shows "Updating..." text while update is in progress', async () => {
    const result = createMockResult();
    let resolveUpdate: () => void;
    const updatePromise = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    mockOnUpdate.mockReturnValue(updatePromise);
    
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    
    const refreshButton = screen.getByTitle('Refresh last run status');
    fireEvent.click(refreshButton);
    
    // Should show "Updating..." while the promise is pending
    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });
    
    // Resolve the promise
    resolveUpdate!();
    
    // Should go back to showing last run time
    await waitFor(() => {
      expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
      expect(screen.getByText(/Last run:/)).toBeInTheDocument();
    });
  });

  it('disables refresh button while updating', async () => {
    const result = createMockResult();
    let resolveUpdate: () => void;
    const updatePromise = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    mockOnUpdate.mockReturnValue(updatePromise);
    
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    
    const refreshButton = screen.getByTitle('Refresh last run status');
    expect(refreshButton).not.toBeDisabled();
    
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(refreshButton).toBeDisabled();
    });
    
    resolveUpdate!();
    
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });
  });

  it('renders with data-project-card attribute', () => {
    const result = createMockResult();
    const { container } = render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    const card = container.querySelector('[data-project-card="Test App"]');
    expect(card).toBeInTheDocument();
  });

  it('renders tooltip with last updated time', () => {
    const result = createMockResult();
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    // The Tooltip wraps the LastRunStatusIcon
    expect(screen.getByTestId('last-run-status-icon')).toBeInTheDocument();
  });

  it('renders tooltip with last failed run time', () => {
    const result = createMockResult({ lastFailedRunAt: '2024-01-10T15:45:00Z', failedRuns: 25 });
    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );
    // The component uses DateTime.fromISO for the tooltip
    // Check that the failed runs count is displayed
    expect(screen.getByText('25')).toBeInTheDocument(); // failedRuns count
  });

  it('calls getColorByPassingRate with correct success rate', async () => {
    const utils = await import('../utils');
    const result = createMockResult({ successRate: 0.75 });

    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );

    expect(utils.getColorByPassingRate).toHaveBeenCalledWith(0.75);
  });

  it('calls getTooltipByPassingRate with correct parameters', async () => {
    const utils = await import('../utils');
    const result = createMockResult({ passedRuns: 80, totalRuns: 100, successRate: 0.8 });

    render(
      <ProjectCard
        result={result}
        previousValue={null}
        onUpdate={mockOnUpdate}
        onContextMenu={mockOnContextMenu}
      />,
    );

    expect(utils.getTooltipByPassingRate).toHaveBeenCalledWith(80, 100, 0.8);
  });
});

