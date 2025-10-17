import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PullRequestsPage from '../PullRequestsPage';
import type { PullRequestsPageProps } from '../PullRequestsPage';

// Mock the components
vi.mock('../components/PRList', () => ({
  default: () => <div data-testid="pr-list">PR List</div>,
}));

vi.mock('../components/EmptyState', () => ({
  default: ({ onAddClick }: { onAddClick: () => void }) => (
    <div data-testid="empty-state">
      <button onClick={onAddClick} data-testid="empty-add-button">
        Add PR
      </button>
    </div>
  ),
}));

vi.mock('../components/AddPRButton', () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} data-testid="add-pr-button">
      Add Pull Request
    </button>
  ),
}));

vi.mock('../components/AddPRDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="add-pr-dialog">Add PR Dialog</div> : null,
}));

vi.mock('../components/DeletePRDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="delete-pr-dialog">Delete PR Dialog</div> : null,
}));

vi.mock('@/components/common', () => ({
  TooltipIconButton: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

const mockRefetch = vi.fn();
const mockHandleOpenAddDialog = vi.fn();
const mockHandleCloseAddDialog = vi.fn();
const mockHandleAdd = vi.fn();
const mockHandleDeleteClick = vi.fn();
const mockHandleConfirmDelete = vi.fn();
const mockHandleCancelDelete = vi.fn();
const mockSetUrl = vi.fn();
const mockSetUrlError = vi.fn();

const defaultProps: PullRequestsPageProps = {
  pullRequestsData: [],
  loading: false,
  error: null,
  refetch: mockRefetch,
  openAddDialog: false,
  openDeleteDialog: false,
  deleteId: null,
  url: '',
  urlError: null,
  isAdding: false,
  isDeleting: false,
  handleOpenAddDialog: mockHandleOpenAddDialog,
  handleCloseAddDialog: mockHandleCloseAddDialog,
  handleAdd: mockHandleAdd,
  handleDeleteClick: mockHandleDeleteClick,
  handleConfirmDelete: mockHandleConfirmDelete,
  handleCancelDelete: mockHandleCancelDelete,
  setUrl: mockSetUrl,
  setUrlError: mockSetUrlError,
};

describe('PullRequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(<PullRequestsPage {...defaultProps} loading={true} pullRequestsData={undefined} />);
    expect(screen.getByTestId('pull-requests-skeleton')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorProps = {
      ...defaultProps,
      error: new Error('Failed to fetch pull requests'),
    };
    render(<PullRequestsPage {...errorProps} />);
    expect(screen.getByText(/Error fetching pull requests/)).toBeInTheDocument();
  });

  it('renders empty state when no pull requests', () => {
    render(<PullRequestsPage {...defaultProps} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('add-pr-button')).not.toBeInTheDocument();
  });

  it('renders PR list when pull requests exist', () => {
    const propsWithData = {
      ...defaultProps,
      pullRequestsData: [{ id: '1', repository: 'org/repo', pullRequestNumber: 123 }],
    };
    render(<PullRequestsPage {...propsWithData} />);
    expect(screen.getByTestId('pr-list')).toBeInTheDocument();
    expect(screen.getByTestId('add-pr-button')).toBeInTheDocument();
  });

  it('calls refetch when refresh button is clicked', async () => {
    render(<PullRequestsPage {...defaultProps} />);
    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('opens add dialog when add button is clicked', () => {
    const propsWithData = {
      ...defaultProps,
      pullRequestsData: [{ id: '1', repository: 'org/repo', pullRequestNumber: 123 }],
    };
    render(<PullRequestsPage {...propsWithData} />);
    const addButton = screen.getByTestId('add-pr-button');
    fireEvent.click(addButton);
    expect(mockHandleOpenAddDialog).toHaveBeenCalled();
  });

  it('renders add dialog when open', () => {
    const propsWithDialog = {
      ...defaultProps,
      openAddDialog: true,
    };
    render(<PullRequestsPage {...propsWithDialog} />);
    expect(screen.getByTestId('add-pr-dialog')).toBeInTheDocument();
  });

  it('renders delete dialog when open', () => {
    const propsWithDialog = {
      ...defaultProps,
      openDeleteDialog: true,
    };
    render(<PullRequestsPage {...propsWithDialog} />);
    expect(screen.getByTestId('delete-pr-dialog')).toBeInTheDocument();
  });

  it('disables refresh button while refetching', async () => {
    let resolveRefetch: () => void;
    const slowRefetch = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRefetch = resolve;
        }),
    );

    const propsWithSlowRefetch = {
      ...defaultProps,
      refetch: slowRefetch,
    };

    render(<PullRequestsPage {...propsWithSlowRefetch} />);

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

    const propsWithSlowRefetch = {
      ...defaultProps,
      refetch: slowRefetch,
    };

    render(<PullRequestsPage {...propsWithSlowRefetch} />);

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

    const propsWithFailingRefetch = {
      ...defaultProps,
      refetch: failingRefetch,
    };

    render(<PullRequestsPage {...propsWithFailingRefetch} />);

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

    const propsWithSlowRefetch = {
      ...defaultProps,
      refetch: slowRefetch,
    };

    render(<PullRequestsPage {...propsWithSlowRefetch} />);

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
