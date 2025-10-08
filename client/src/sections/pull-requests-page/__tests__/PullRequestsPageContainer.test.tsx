import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PullRequestsPageContainer from '../PullRequestsPageContainer';

// Mock the hooks
const mockRefetch = vi.fn();
const mockAddPullRequest = vi.fn();
const mockDeletePullRequest = vi.fn();

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
  usePullRequestDetails: vi.fn(() => ({
    data: undefined,
    loading: false,
  })),
}));

// Mock notistack
vi.mock('notistack', () => ({
  enqueueSnackbar: vi.fn(),
}));

import { usePullRequests, useAddPullRequest, useDeletePullRequest } from '@/hooks';
import { enqueueSnackbar } from 'notistack';

describe('PullRequestsPageContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const input = screen.getByLabelText(/GitHub Pull Request URL/);
    fireEvent.change(input, { target: { value: 'invalid-url' } });

    // Click add
    const submitButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(submitButton);

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
    const input = screen.getByLabelText(/GitHub Pull Request URL/);
    fireEvent.change(input, {
      target: { value: 'https://github.com/owner/repo/pull/123' },
    });

    // Click add
    const submitButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(submitButton);

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
    const input = screen.getByLabelText(/GitHub Pull Request URL/);
    fireEvent.change(input, {
      target: { value: 'https://github.com/owner/repo/pull/123' },
    });

    // Click add
    const submitButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(submitButton);

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

    vi.mocked(usePullRequests).mockReturnValue({
      data: [mockPR],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<PullRequestsPageContainer />);

    // Should render the PR list
    expect(screen.getByTestId('pull-requests-page')).toBeInTheDocument();
  });

  it('handles delete pull request error', async () => {
    const mockPR = {
      id: 'pr-1',
      repository: 'owner/repo',
      pullRequestNumber: 123,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    vi.mocked(usePullRequests).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<PullRequestsPageContainer />);

    // Should render empty state
    expect(screen.getByText(/No pull requests found/)).toBeInTheDocument();
  });
});
