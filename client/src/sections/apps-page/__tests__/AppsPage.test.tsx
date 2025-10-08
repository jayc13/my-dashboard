import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
  TooltipIconButton: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="refresh-button">
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
});
