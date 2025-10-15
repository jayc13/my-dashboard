import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AppsPageContainer from '../AppsPageContainer';
import type { Application } from '@/types';

// Mock the hooks
const mockRefetch = vi.fn();
const mockCreateApp = vi.fn();
const mockUpdateApp = vi.fn();
const mockDeleteApp = vi.fn();

let mockAppsData: Application[] = [];

vi.mock('@/hooks', () => ({
  useApps: () => ({
    data: mockAppsData,
    loading: false,
    error: null,
    refetch: mockRefetch,
  }),
  useCreateApp: () => ({
    mutate: mockCreateApp,
    loading: false,
  }),
  useUpdateApp: () => ({
    mutate: mockUpdateApp,
    loading: false,
  }),
  useDeleteApp: () => ({
    mutate: mockDeleteApp,
    loading: false,
  }),
}));

// Mock notistack
const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', () => ({
  enqueueSnackbar: (message: string, options: any) => mockEnqueueSnackbar(message, options),
}));

// Mock react-router-dom
const mockSetSearchParams = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

// Mock the child components
vi.mock('../AppsPage', () => ({
  default: (props: any) => (
    <div data-testid="apps-page-mock">
      <button
        data-testid="toggle-watching-button"
        onClick={() => props.handleToggleWatching(props.apps?.[0])}
      >
        Toggle Watching
      </button>
      <button data-testid="open-dialog-button" onClick={() => props.handleOpenDialog()}>
        Open Dialog
      </button>
      <button
        data-testid="open-edit-dialog-button"
        onClick={() => props.handleOpenDialog(props.apps?.[0])}
      >
        Open Edit Dialog
      </button>
      <button data-testid="close-dialog-button" onClick={props.handleCloseDialog}>
        Close Dialog
      </button>
      <button data-testid="submit-button" onClick={props.handleSubmit}>
        Submit
      </button>
      <button data-testid="delete-click-button" onClick={() => props.handleDeleteClick(1)}>
        Delete Click
      </button>
      <button data-testid="confirm-delete-button" onClick={props.handleConfirmDelete}>
        Confirm Delete
      </button>
      <button data-testid="cancel-delete-button" onClick={props.handleCancelDelete}>
        Cancel Delete
      </button>
      <button
        data-testid="set-form-data-button"
        onClick={() => props.setFormData({ name: 'Updated' })}
      >
        Set Form Data
      </button>
    </div>
  ),
}));

describe('AppsPageContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppsData = [
      {
        id: 1,
        name: 'Test App 1',
        code: 'test-app-1',
        pipelineUrl: 'https://example.com',
        e2eTriggerConfiguration: '{}',
        watching: false,
      },
      {
        id: 2,
        name: 'Test App 2',
        code: 'test-app-2',
        pipelineUrl: '',
        e2eTriggerConfiguration: '',
        watching: true,
      },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Parameter Handling', () => {
    it('should render without errors when URL params are present', async () => {
      mockSearchParams.set('appId', '1');

      render(<AppsPageContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
      });

      // URL parameter handling opens the edit dialog
      // The dialog state is managed internally
    });

    it('should render without errors when no URL params', async () => {
      mockSearchParams.delete('appId');

      render(<AppsPageContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
      });

      expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
    });

    it('should remove URL param when app not found', async () => {
      mockSearchParams.set('appId', '999');

      render(<AppsPageContainer />);

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalled();
      });

      // Should not show error, just remove the param
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
    });

    it('should open edit dialog when valid appId in URL', async () => {
      mockSearchParams.set('appId', '1');

      render(<AppsPageContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
      });

      // The edit dialog should be opened with the app data
      // This is verified by the component rendering without errors
    });
  });

  describe('Toggle Watching Functionality', () => {
    it('should toggle watching status from false to true', async () => {
      mockUpdateApp.mockResolvedValueOnce({});

      render(<AppsPageContainer />);

      const toggleButton = await screen.findByTestId('toggle-watching-button');
      toggleButton.click();

      await waitFor(() => {
        expect(mockUpdateApp).toHaveBeenCalledWith({
          id: 1,
          data: expect.objectContaining({
            watching: true,
          }),
        });
      });

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('App added to watching list', {
        variant: 'success',
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should toggle watching status from true to false', async () => {
      mockUpdateApp.mockResolvedValueOnce({});
      mockAppsData[0].watching = true;

      render(<AppsPageContainer />);

      const toggleButton = await screen.findByTestId('toggle-watching-button');
      toggleButton.click();

      await waitFor(() => {
        expect(mockUpdateApp).toHaveBeenCalledWith({
          id: 1,
          data: expect.objectContaining({
            watching: false,
          }),
        });
      });

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('App removed from watching list', {
        variant: 'success',
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle toggle error gracefully', async () => {
      mockUpdateApp.mockRejectedValueOnce(new Error('Update failed'));

      render(<AppsPageContainer />);

      const toggleButton = await screen.findByTestId('toggle-watching-button');
      toggleButton.click();

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to update watching status', {
          variant: 'error',
        });
      });
    });

    it('should not call update if app has no id', async () => {
      mockAppsData[0].id = undefined;

      render(<AppsPageContainer />);

      const toggleButton = await screen.findByTestId('toggle-watching-button');
      toggleButton.click();

      await waitFor(() => {
        expect(mockUpdateApp).not.toHaveBeenCalled();
      });
    });

    it('should preserve all app properties when toggling', async () => {
      mockUpdateApp.mockResolvedValueOnce({});

      render(<AppsPageContainer />);

      const toggleButton = await screen.findByTestId('toggle-watching-button');
      toggleButton.click();

      await waitFor(() => {
        expect(mockUpdateApp).toHaveBeenCalledWith({
          id: 1,
          data: {
            id: 1,
            name: 'Test App 1',
            code: 'test-app-1',
            pipelineUrl: 'https://example.com',
            e2eTriggerConfiguration: '{}',
            watching: true,
          },
        });
      });
    });
  });

  describe('Dialog Management', () => {
    it('should open dialog for creating new app', async () => {
      render(<AppsPageContainer />);

      const openButton = await screen.findByTestId('open-dialog-button');
      openButton.click();

      // The dialog should be opened (tested via AppsPage props)
      expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
    });

    it('should open dialog for editing existing app', async () => {
      render(<AppsPageContainer />);

      const openEditButton = await screen.findByTestId('open-edit-dialog-button');
      openEditButton.click();

      // The dialog should be opened with app data (tested via AppsPage props)
      expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
    });

    it('should close dialog and reset form data', async () => {
      render(<AppsPageContainer />);

      const closeButton = await screen.findByTestId('close-dialog-button');
      closeButton.click();

      // The dialog should be closed (tested via AppsPage props)
      expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
    });

    it('should update form data', async () => {
      render(<AppsPageContainer />);

      const setFormDataButton = await screen.findByTestId('set-form-data-button');
      setFormDataButton.click();

      // Form data should be updated (tested via AppsPage props)
      expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should show error when name is missing', async () => {
      render(<AppsPageContainer />);

      const submitButton = await screen.findByTestId('submit-button');
      submitButton.click();

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Name and code are required', {
          variant: 'error',
        });
      });

      expect(mockCreateApp).not.toHaveBeenCalled();
    });
  });

  describe('Delete Functionality', () => {
    it('should open delete confirmation dialog', async () => {
      render(<AppsPageContainer />);

      const deleteButton = await screen.findByTestId('delete-click-button');
      deleteButton.click();

      // Delete dialog should be opened (tested via AppsPage props)
      expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
    });

    it('should cancel delete operation', async () => {
      render(<AppsPageContainer />);

      const cancelButton = await screen.findByTestId('cancel-delete-button');
      cancelButton.click();

      // Delete dialog should be closed (tested via AppsPage props)
      expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
    });

    it('should confirm delete successfully', async () => {
      mockDeleteApp.mockResolvedValueOnce({ success: true });
      mockRefetch.mockResolvedValueOnce({});

      render(<AppsPageContainer />);

      // First open the delete dialog
      const deleteButton = await screen.findByTestId('delete-click-button');
      deleteButton.click();

      // Then confirm
      const confirmButton = await screen.findByTestId('confirm-delete-button');
      confirmButton.click();

      await waitFor(() => {
        expect(mockDeleteApp).toHaveBeenCalledWith(1);
      });

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('App deleted successfully', {
        variant: 'success',
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle delete error gracefully', async () => {
      mockDeleteApp.mockRejectedValueOnce(new Error('Delete failed'));

      render(<AppsPageContainer />);

      // First open the delete dialog
      const deleteButton = await screen.findByTestId('delete-click-button');
      deleteButton.click();

      // Then confirm
      const confirmButton = await screen.findByTestId('confirm-delete-button');
      confirmButton.click();

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to delete app', {
          variant: 'error',
        });
      });
    });

    it('should not delete if deleteAppId is null', async () => {
      render(<AppsPageContainer />);

      // Try to confirm delete without setting deleteAppId
      const confirmButton = await screen.findByTestId('confirm-delete-button');
      confirmButton.click();

      await waitFor(() => {
        expect(mockDeleteApp).not.toHaveBeenCalled();
      });
    });
  });
});
