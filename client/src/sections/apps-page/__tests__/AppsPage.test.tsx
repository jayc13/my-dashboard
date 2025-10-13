import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppsPage from '../AppsPage';
import type { AppsPageProps } from '../AppsPage';
import type { Application } from '@/types';

// Mock the components
vi.mock('../components/AppsHeader', () => ({
  default: ({ onAddClick }: { onAddClick: () => void }) => (
    <button onClick={onAddClick} data-testid="apps-header">
      Add App
    </button>
  ),
}));

vi.mock('../components/AppsFilters', () => ({
  default: () => <div data-testid="apps-filters">Filters</div>,
}));

vi.mock('../components/AppsDataGrid', () => ({
  default: () => <div data-testid="apps-data-grid">Data Grid</div>,
}));

vi.mock('../components/AppDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="app-dialog">App Dialog</div> : null,
}));

vi.mock('../components/DeleteAppDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="delete-app-dialog">Delete Dialog</div> : null,
}));

vi.mock('@/components/common', () => ({
  TooltipIconButton: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

const mockRefetch = vi.fn();
const mockHandleOpenDialog = vi.fn();
const mockHandleCloseDialog = vi.fn();
const mockHandleSubmit = vi.fn();
const mockHandleDeleteClick = vi.fn();
const mockHandleConfirmDelete = vi.fn();
const mockHandleCancelDelete = vi.fn();
const mockHandleToggleWatching = vi.fn();
const mockSetFormData = vi.fn();
const mockSetShowOnlyWatching = vi.fn();
const mockSetSearchQuery = vi.fn();

const mockApp: Application = {
  id: 1,
  name: 'Test App',
  code: 'test-app',
  pipelineUrl: 'https://example.com',
  e2eTriggerConfiguration: '{}',
  watching: true,
};

const defaultProps: AppsPageProps = {
  apps: [mockApp],
  loading: false,
  error: null,
  refetch: mockRefetch,
  showOnlyWatching: true,
  searchQuery: '',
  setShowOnlyWatching: mockSetShowOnlyWatching,
  setSearchQuery: mockSetSearchQuery,
  openDialog: false,
  openDeleteDialog: false,
  editingApp: null,
  deleteAppId: null,
  formData: {},
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  handleOpenDialog: mockHandleOpenDialog,
  handleCloseDialog: mockHandleCloseDialog,
  handleSubmit: mockHandleSubmit,
  handleDeleteClick: mockHandleDeleteClick,
  handleConfirmDelete: mockHandleConfirmDelete,
  handleCancelDelete: mockHandleCancelDelete,
  handleToggleWatching: mockHandleToggleWatching,
  setFormData: mockSetFormData,
};

describe('AppsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the apps page with all components', () => {
    render(<AppsPage {...defaultProps} />);

    expect(screen.getByTestId('apps-page')).toBeInTheDocument();
    expect(screen.getByText('Apps Management')).toBeInTheDocument();
    expect(screen.getByTestId('apps-header')).toBeInTheDocument();
    expect(screen.getByTestId('apps-filters')).toBeInTheDocument();
    expect(screen.getByTestId('apps-data-grid')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorProps = {
      ...defaultProps,
      error: new Error('Failed to fetch apps'),
    };
    render(<AppsPage {...errorProps} />);

    expect(screen.getByText(/Error fetching apps/)).toBeInTheDocument();
  });

  it('calls refetch when refresh button is clicked', () => {
    render(<AppsPage {...defaultProps} />);

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('opens app dialog when add button is clicked', () => {
    render(<AppsPage {...defaultProps} />);

    const addButton = screen.getByTestId('apps-header');
    fireEvent.click(addButton);

    expect(mockHandleOpenDialog).toHaveBeenCalled();
  });

  it('renders app dialog when open', () => {
    const propsWithDialog = {
      ...defaultProps,
      openDialog: true,
    };
    render(<AppsPage {...propsWithDialog} />);

    expect(screen.getByTestId('app-dialog')).toBeInTheDocument();
  });

  it('renders delete dialog when open', () => {
    const propsWithDialog = {
      ...defaultProps,
      openDeleteDialog: true,
    };
    render(<AppsPage {...propsWithDialog} />);

    expect(screen.getByTestId('delete-app-dialog')).toBeInTheDocument();
  });

  it('filters apps correctly', () => {
    const { rerender } = render(<AppsPage {...defaultProps} />);

    // Initial render with watching filter
    expect(screen.getByTestId('apps-data-grid')).toBeInTheDocument();

    // Re-render with search query
    rerender(<AppsPage {...defaultProps} searchQuery="test" />);
    expect(screen.getByTestId('apps-data-grid')).toBeInTheDocument();
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

    render(<AppsPage {...propsWithSlowRefetch} />);

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

    render(<AppsPage {...propsWithSlowRefetch} />);

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

    const propsWithFailingRefetch = {
      ...defaultProps,
      refetch: failingRefetch,
    };

    render(<AppsPage {...propsWithFailingRefetch} />);

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

    render(<AppsPage {...propsWithSlowRefetch} />);

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
