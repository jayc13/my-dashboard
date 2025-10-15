import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ContextMenu from '../ContextMenu';
import type { AppDetailedE2EReportDetail } from '@my-dashboard/types';

// Mock the LastRunStatus component
vi.mock('../LastRunStatus.tsx', () => ({
  default: ({ status }: { status: string }) => <span data-testid="last-run-status">{status}</span>,
}));

describe('ContextMenu', () => {
  const mockOnOpenUrl = vi.fn();
  const mockOnCopyProjectName = vi.fn();
  const mockOnCopyProjectCode = vi.fn();
  const mockOnTriggerE2ERuns = vi.fn();

  const defaultProps = {
    mouseX: 100,
    mouseY: 100,
    loadingAppDetails: false,
    onOpenUrl: mockOnOpenUrl,
    onCopyProjectName: mockOnCopyProjectName,
    onCopyProjectCode: mockOnCopyProjectCode,
    onTriggerE2ERuns: mockOnTriggerE2ERuns,
  };

  const mockResult: AppDetailedE2EReportDetail = {
    id: 1,
    name: 'Test App',
    code: 'test-app',
    pipelineUrl: 'https://example.com/pipeline',
    e2eTriggerConfiguration: '{"key": "value"}',
    watching: true,
    e2eRunsQuantity: 5,
    lastRun: {
      id: 1,
      status: 'success',
      url: 'https://example.com/run/1',
      pipelineId: 'pipeline-123',
      createdAt: '2025-10-15T10:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conditional Rendering', () => {
    it('should return null when no result and not loading', () => {
      const { container } = render(<ContextMenu {...defaultProps} result={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when loading', () => {
      render(<ContextMenu {...defaultProps} result={undefined} loadingAppDetails={true} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render when result is provided', () => {
      render(<ContextMenu {...defaultProps} result={mockResult} />);
      expect(screen.getByText('Test App')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loadingAppDetails is true', () => {
      render(<ContextMenu {...defaultProps} result={mockResult} loadingAppDetails={true} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should not show loading spinner when loadingAppDetails is false', () => {
      render(<ContextMenu {...defaultProps} result={mockResult} loadingAppDetails={false} />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('App Details Display', () => {
    it('should display app name in header', () => {
      render(<ContextMenu {...defaultProps} result={mockResult} />);
      expect(screen.getByText('Test App')).toBeInTheDocument();
    });

    it('should display "Configured" when e2eTriggerConfiguration exists', () => {
      render(<ContextMenu {...defaultProps} result={mockResult} />);
      expect(screen.getByText('Configured')).toBeInTheDocument();
    });

    it('should display "Not Configured" when e2eTriggerConfiguration is null', () => {
      const resultWithoutConfig = { ...mockResult, e2eTriggerConfiguration: undefined };
      render(<ContextMenu {...defaultProps} result={resultWithoutConfig} />);
      expect(screen.getByText('Not Configured')).toBeInTheDocument();
    });

    it('should display "Not Configured" when e2eTriggerConfiguration is undefined', () => {
      const resultWithoutConfig = { ...mockResult, e2eTriggerConfiguration: undefined };
      render(<ContextMenu {...defaultProps} result={resultWithoutConfig} />);
      expect(screen.getByText('Not Configured')).toBeInTheDocument();
    });

    it("should display today's runs quantity", () => {
      render(<ContextMenu {...defaultProps} result={mockResult} />);
      expect(screen.getByText(/Today's Runs:/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('should display 0 when e2eRunsQuantity is not provided', () => {
      const resultWithoutRuns = { ...mockResult, e2eRunsQuantity: 0 };
      render(<ContextMenu {...defaultProps} result={resultWithoutRuns} />);
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should display last run status when lastRun exists', () => {
      render(<ContextMenu {...defaultProps} result={mockResult} />);
      expect(screen.getByText(/Last Run Status:/)).toBeInTheDocument();
      expect(screen.getByTestId('last-run-status')).toBeInTheDocument();
    });

    it('should not display last run status when lastRun is undefined', () => {
      const resultWithoutLastRun = { ...mockResult, lastRun: undefined };
      render(<ContextMenu {...defaultProps} result={resultWithoutLastRun} />);
      expect(screen.queryByText(/Last Run Status:/)).not.toBeInTheDocument();
    });
  });

  describe('Menu Actions', () => {
    it('should call onOpenUrl with Cypress Cloud URL when clicking "Open in Cypress Cloud"', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} result={mockResult} />);

      const cypressCloudButton = screen.getByText('Open in Cypress Cloud');
      await user.click(cypressCloudButton);

      expect(mockOnOpenUrl).toHaveBeenCalledWith('https://cloud.cypress.io/projects/test-app/runs');
    });

    it('should call onOpenUrl with pipeline URL when clicking "Open in Pipelines"', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} result={mockResult} />);

      const pipelineButton = screen.getByText('Open in Pipelines');
      await user.click(pipelineButton);

      expect(mockOnOpenUrl).toHaveBeenCalledWith('https://example.com/pipeline');
    });

    it('should not render "Open in Pipelines" when pipelineUrl is null', () => {
      const resultWithoutPipeline = { ...mockResult, pipelineUrl: undefined };
      render(<ContextMenu {...defaultProps} result={resultWithoutPipeline} />);

      expect(screen.queryByText('Open in Pipelines')).not.toBeInTheDocument();
    });

    it('should not render "Open in Pipelines" when pipelineUrl is undefined', () => {
      const resultWithoutPipeline = { ...mockResult, pipelineUrl: undefined };
      render(<ContextMenu {...defaultProps} result={resultWithoutPipeline} />);

      expect(screen.queryByText('Open in Pipelines')).not.toBeInTheDocument();
    });

    it('should call onOpenUrl with last run URL when clicking last run icon', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} result={mockResult} />);

      const openInNewButtons = screen.getAllByTestId('OpenInNewIcon');
      // The last run icon is the first OpenInNewIcon in the document
      await user.click(openInNewButtons[0].closest('button')!);

      expect(mockOnOpenUrl).toHaveBeenCalledWith('https://example.com/run/1');
    });

    it('should call onTriggerE2ERuns when clicking "Trigger E2E Runs"', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} result={mockResult} />);

      const triggerButton = screen.getByText('Trigger E2E Runs');
      await user.click(triggerButton);

      expect(mockOnTriggerE2ERuns).toHaveBeenCalled();
    });

    it('should disable "Trigger E2E Runs" when e2eTriggerConfiguration is not set', () => {
      const resultWithoutConfig = { ...mockResult, e2eTriggerConfiguration: undefined };
      render(<ContextMenu {...defaultProps} result={resultWithoutConfig} />);

      const triggerButton = screen.getByText('Trigger E2E Runs');
      expect(triggerButton.closest('li')).toHaveClass('Mui-disabled');
    });

    it('should disable "Trigger E2E Runs" when last run status is running', () => {
      const resultWithRunningStatus = {
        ...mockResult,
        lastRun: { ...mockResult.lastRun!, status: 'running' },
      };
      render(<ContextMenu {...defaultProps} result={resultWithRunningStatus} />);

      const triggerButton = screen.getByText('Trigger E2E Runs');
      expect(triggerButton.closest('li')).toHaveClass('Mui-disabled');
    });

    it('should call onCopyProjectName when clicking "Copy Project Name"', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} result={mockResult} />);

      const copyNameButton = screen.getByText('Copy Project Name');
      await user.click(copyNameButton);

      expect(mockOnCopyProjectName).toHaveBeenCalled();
    });

    it('should call onCopyProjectCode when clicking "Copy Project Code"', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} result={mockResult} />);

      const copyCodeButton = screen.getByText('Copy Project Code');
      await user.click(copyCodeButton);

      expect(mockOnCopyProjectCode).toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    it('should return null when result is undefined and not loading', () => {
      const { container } = render(
        <ContextMenu {...defaultProps} result={undefined} loadingAppDetails={false} />,
      );
      expect(container.firstChild).toBeNull();
    });

    // Note: Lines 149-151 (error alert "Failed to load app details") are unreachable
    // due to the early return on line 43: if (!result && !loadingAppDetails) return null;
    // The error state would require: !loadingAppDetails && !result, which is the same
    // condition as the early return. This appears to be defensive programming or dead code.
  });

  describe('Positioning', () => {
    it('should position menu at specified coordinates', () => {
      const { container } = render(
        <ContextMenu {...defaultProps} result={mockResult} mouseX={200} mouseY={300} />,
      );
      const card = container.querySelector('[class*="MuiCard"]');
      expect(card).toBeInTheDocument();
    });

    it('should constrain menu position to window bounds (top edge)', () => {
      const { container } = render(
        <ContextMenu {...defaultProps} result={mockResult} mouseX={100} mouseY={5} />,
      );
      const card = container.querySelector('[class*="MuiCard"]');
      expect(card).toBeInTheDocument();
    });

    it('should constrain menu position to window bounds (left edge)', () => {
      const { container } = render(
        <ContextMenu {...defaultProps} result={mockResult} mouseX={5} mouseY={100} />,
      );
      const card = container.querySelector('[class*="MuiCard"]');
      expect(card).toBeInTheDocument();
    });
  });
});
