import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PullRequestsPageContainer from '../PullRequestsPageContainer';

// Mock the hooks
const mockRefetch = vi.fn();
const mockAddPullRequest = vi.fn();
const mockDeletePullRequest = vi.fn();
const mockUsePullRequestDetails = vi.fn();

vi.mock('@/hooks', () => ({
  usePullRequests: vi.fn(() => ({
    data: [],
    loading: false,
    error: null,
    refetch: mockRefetch,
  })),
  useAddPullRequest: vi.fn(() => ({
    mutate: mockAddPullRequest,
    loading: false,
  })),
  useDeletePullRequest: vi.fn(() => ({
    mutate: mockDeletePullRequest,
    loading: false,
  })),
  usePullRequestDetails: (id: string) => mockUsePullRequestDetails(id),
}));

// Mock notistack
vi.mock('notistack', () => ({
  enqueueSnackbar: vi.fn(),
}));

import { usePullRequests } from '@/hooks';
import { enqueueSnackbar } from 'notistack';

describe('PullRequestsPageContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockResolvedValue(undefined);
    // Default mock for usePullRequestDetails
    mockUsePullRequestDetails.mockReturnValue({
      data: undefined,
      loading: false,
    });
  });

  it('renders with loading state', () => {
    vi.mocked(usePullRequests).mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<PullRequestsPageContainer />);
    expect(screen.getByTestId('pull-requests-skeleton')).toBeInTheDocument();
  });

  it('renders with error state', () => {
    const error = new Error('Failed to fetch');
    vi.mocked(usePullRequests).mockReturnValue({
      data: undefined,
      loading: false,
      error,
      refetch: mockRefetch,
    });

    render(<PullRequestsPageContainer />);
    expect(screen.getByText(/Error fetching pull requests/)).toBeInTheDocument();
  });

  it('renders empty state when no pull requests', () => {
    vi.mocked(usePullRequests).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<PullRequestsPageContainer />);
    expect(screen.getByText(/No pull requests found/)).toBeInTheDocument();
  });

  it('opens add dialog when clicking add button', () => {
    vi.mocked(usePullRequests).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<PullRequestsPageContainer />);

    const addButton = screen.getByText(/Add Pull Request/);
    fireEvent.click(addButton);

    expect(screen.getByTestId('add-pr-dialog')).toBeInTheDocument();
  });

  it('validates PR URL format', async () => {
    vi.mocked(usePullRequests).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<PullRequestsPageContainer />);

    // Open dialog
    const addButton = screen.getByText(/Add Pull Request/);
    fireEvent.click(addButton);

    // Enter invalid URL
    const input = screen.getByTestId('pr-url-input').querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'invalid-url' } });

    // Try to add
    const addPRButton = screen.getByTestId('pr-add-button');
    fireEvent.click(addPRButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid GitHub Pull Request URL format/)).toBeInTheDocument();
    });

    expect(mockAddPullRequest).not.toHaveBeenCalled();
  });

  it('adds pull request with valid URL', async () => {
    vi.mocked(usePullRequests).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockAddPullRequest.mockResolvedValue({});

    render(<PullRequestsPageContainer />);

    // Open dialog
    const addButton = screen.getByText(/Add Pull Request/);
    fireEvent.click(addButton);

    // Enter valid URL
    const input = screen.getByTestId('pr-url-input').querySelector('input') as HTMLInputElement;
    fireEvent.change(input, {
      target: { value: 'https://github.com/owner/repo/pull/123' },
    });

    // Add
    const addPRButton = screen.getByTestId('pr-add-button');
    fireEvent.click(addPRButton);

    await waitFor(() => {
      expect(mockAddPullRequest).toHaveBeenCalledWith({
        repository: 'owner/repo',
        pullRequestNumber: 123,
      });
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith('Pull request added successfully', {
      variant: 'success',
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles add pull request error', async () => {
    vi.mocked(usePullRequests).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockAddPullRequest.mockRejectedValue(new Error('Failed to add'));

    render(<PullRequestsPageContainer />);

    // Open dialog
    const addButton = screen.getByText(/Add Pull Request/);
    fireEvent.click(addButton);

    // Enter valid URL
    const input = screen.getByTestId('pr-url-input').querySelector('input') as HTMLInputElement;
    fireEvent.change(input, {
      target: { value: 'https://github.com/owner/repo/pull/123' },
    });

    // Try to add
    const addPRButton = screen.getByTestId('pr-add-button');
    fireEvent.click(addPRButton);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith('Failed to add pull request', {
        variant: 'error',
      });
    });
  });

  it('renders with pull requests data', () => {
    const mockPR = {
      id: 'pr-1',
      repository: 'owner/repo',
      pullRequestNumber: 123,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockDetails = {
      id: 'pr-1',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      state: 'open',
      merged: false,
      mergeableState: 'clean',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: {
        username: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        htmlUrl: 'https://github.com/testuser',
      },
      labels: [],
    };

    vi.mocked(usePullRequests).mockReturnValue({
      data: [mockPR],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    render(<PullRequestsPageContainer />);

    expect(screen.getByTestId('pr-card-pr-1')).toBeInTheDocument();
    expect(screen.getByText('Test PR')).toBeInTheDocument();
  });

  it('handles delete pull request error', async () => {
    const mockPR = {
      id: 'pr-1',
      repository: 'owner/repo',
      pullRequestNumber: 123,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockDetails = {
      id: 'pr-1',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      state: 'open',
      merged: false,
      mergeableState: 'clean',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: {
        username: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        htmlUrl: 'https://github.com/testuser',
      },
      labels: [],
    };

    vi.mocked(usePullRequests).mockReturnValue({
      data: [mockPR],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    mockDeletePullRequest.mockRejectedValue(new Error('Failed to delete'));

    render(<PullRequestsPageContainer />);

    // Open delete dialog
    const deleteButton = screen.getByTestId('pr-delete-button-pr-1');
    fireEvent.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByTestId('pr-delete-confirm-button');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith('Failed to delete pull request', {
        variant: 'error',
      });
    });
  });

  it('closes add dialog when handleCloseAddDialog is called', async () => {
    vi.mocked(usePullRequests).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<PullRequestsPageContainer />);

    // Open dialog
    const addButton = screen.getByText(/Add Pull Request/);
    fireEvent.click(addButton);

    expect(screen.getByTestId('add-pr-dialog')).toBeInTheDocument();

    // Close dialog
    const cancelButton = screen.getByTestId('pr-cancel-button');
    fireEvent.click(cancelButton);

    // Wait for the dialog to close (MUI dialogs have exit animations)
    await waitFor(() => {
      expect(screen.queryByTestId('add-pr-dialog')).not.toBeInTheDocument();
    });
  });

  it('opens delete dialog when handleDeleteClick is called', async () => {
    const mockPR = {
      id: 'pr-1',
      repository: 'owner/repo',
      pullRequestNumber: 123,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockDetails = {
      id: 'pr-1',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      state: 'open',
      merged: false,
      mergeableState: 'clean',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: {
        username: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        htmlUrl: 'https://github.com/testuser',
      },
      labels: [],
    };

    vi.mocked(usePullRequests).mockReturnValue({
      data: [mockPR],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    render(<PullRequestsPageContainer />);

    // Find and click delete button
    const deleteButton = screen.getByTestId('pr-delete-button-pr-1');
    fireEvent.click(deleteButton);

    // Delete dialog should be open
    expect(screen.getByTestId('delete-pr-dialog')).toBeInTheDocument();
  });

  it('confirms delete and calls deletePullRequest', async () => {
    const mockPR = {
      id: 'pr-1',
      repository: 'owner/repo',
      pullRequestNumber: 123,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockDetails = {
      id: 'pr-1',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      state: 'open',
      merged: false,
      mergeableState: 'clean',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: {
        username: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        htmlUrl: 'https://github.com/testuser',
      },
      labels: [],
    };

    vi.mocked(usePullRequests).mockReturnValue({
      data: [mockPR],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    mockDeletePullRequest.mockResolvedValue({});

    render(<PullRequestsPageContainer />);

    // Open delete dialog
    const deleteButton = screen.getByTestId('pr-delete-button-pr-1');
    fireEvent.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByTestId('pr-delete-confirm-button');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeletePullRequest).toHaveBeenCalledWith('pr-1');
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith('Pull request deleted successfully', {
      variant: 'success',
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles delete error and shows error message', async () => {
    const mockPR = {
      id: 'pr-1',
      repository: 'owner/repo',
      pullRequestNumber: 123,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockDetails = {
      id: 'pr-1',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      state: 'open',
      merged: false,
      mergeableState: 'clean',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: {
        username: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        htmlUrl: 'https://github.com/testuser',
      },
      labels: [],
    };

    vi.mocked(usePullRequests).mockReturnValue({
      data: [mockPR],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    mockDeletePullRequest.mockRejectedValue(new Error('Network error'));

    render(<PullRequestsPageContainer />);

    // Open delete dialog
    const deleteButton = screen.getByTestId('pr-delete-button-pr-1');
    fireEvent.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByTestId('pr-delete-confirm-button');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith('Failed to delete pull request', {
        variant: 'error',
      });
    });
  });

  it('cancels delete and closes dialog', async () => {
    const mockPR = {
      id: 'pr-1',
      repository: 'owner/repo',
      pullRequestNumber: 123,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockDetails = {
      id: 'pr-1',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      state: 'open',
      merged: false,
      mergeableState: 'clean',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: {
        username: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        htmlUrl: 'https://github.com/testuser',
      },
      labels: [],
    };

    vi.mocked(usePullRequests).mockReturnValue({
      data: [mockPR],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    render(<PullRequestsPageContainer />);

    // Open delete dialog
    const deleteButton = screen.getByTestId('pr-delete-button-pr-1');
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('delete-pr-dialog')).toBeInTheDocument();

    // Cancel delete
    const cancelButton = screen.getByTestId('pr-delete-cancel-button');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('delete-pr-dialog')).not.toBeInTheDocument();
    });

    expect(mockDeletePullRequest).not.toHaveBeenCalled();
  });
});
