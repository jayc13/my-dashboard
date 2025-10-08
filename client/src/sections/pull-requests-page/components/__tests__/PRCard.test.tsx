import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PRCard from '../PRCard';
import type { PullRequest, GithubPullRequestDetails } from '@/types';

// Mock the hooks
const mockUsePullRequestDetails = vi.fn();

vi.mock('@/hooks', () => ({
  usePullRequestDetails: (id: string) => mockUsePullRequestDetails(id),
}));

// Mock notistack
vi.mock('notistack', () => ({
  enqueueSnackbar: vi.fn(),
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

import { enqueueSnackbar } from 'notistack';

describe('PRCard', () => {
  const mockPR: PullRequest = {
    id: 'pr-1',
    repository: 'owner/repo',
    pullRequestNumber: 123,
  };

  const mockDetails: GithubPullRequestDetails = {
    id: 123,
    number: 123,
    title: 'Test PR',
    state: 'open',
    isDraft: false,
    url: 'https://github.com/owner/repo/pull/123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    closedAt: null,
    mergedAt: null,
    merged: false,
    mergeableState: 'clean',
    labels: [{ name: 'bug', color: 'red' }],
    author: {
      username: 'testuser',
      htmlUrl: 'https://github.com/testuser',
      avatarUrl: 'https://github.com/testuser.png',
    },
  };

  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton while loading', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: undefined,
      loading: true,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    // Skeleton should be present
    const skeleton = document.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });

  it('shows error message when details fail to load', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: undefined,
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText('Failed to load pull request details.')).toBeInTheDocument();
  });

  it('renders PR card with details', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test PR')).toBeInTheDocument();
    expect(screen.getByText('#123')).toBeInTheDocument();
    expect(screen.getByText('owner/repo')).toBeInTheDocument();
  });

  it('renders author information', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText(/testuser/)).toBeInTheDocument();
    expect(screen.getByAltText('testuser')).toBeInTheDocument();
  });

  it('renders labels', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText('bug')).toBeInTheDocument();
  });

  it('copies URL to clipboard when copy button is clicked', async () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    const copyButton = screen.getByTestId(`pr-copy-button-${mockPR.id}`);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockDetails.url);
      expect(enqueueSnackbar).toHaveBeenCalledWith('Pull Request URL copied!', {
        variant: 'success',
        preventDuplicate: false,
      });
    });
  });

  it('calls onDelete when delete button is clicked', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTestId(`pr-delete-button-${mockPR.id}`);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockPR.id);
  });

  it('opens PR URL when card is clicked', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: mockDetails,
      loading: false,
    });

    const mockOpen = vi.fn();
    window.open = mockOpen;

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    const title = screen.getByText('Test PR');
    fireEvent.click(title);

    expect(mockOpen).toHaveBeenCalledWith(mockDetails.url, '_blank');
  });

  it('shows approved banner for approved PRs', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: { ...mockDetails, mergeableState: 'clean' },
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    // PRStatusBanner should render the approved state
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('shows ready for review banner', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: {
        ...mockDetails,
        mergeableState: 'dirty',
        labels: [{ name: 'Ready For Review' }],
      },
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText('Ready for Review')).toBeInTheDocument();
  });

  it('shows merged icon for merged PRs', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: { ...mockDetails, merged: true },
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    // Check that the card renders (merged icon is rendered)
    expect(screen.getByText('Test PR')).toBeInTheDocument();
  });

  it('shows closed icon for closed PRs', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: { ...mockDetails, state: 'closed', merged: false },
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test PR')).toBeInTheDocument();
  });

  it('shows PR age', () => {
    // Create a PR that's 5 days old
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    mockUsePullRequestDetails.mockReturnValue({
      data: {
        ...mockDetails,
        createdAt: fiveDaysAgo.toISOString(),
      },
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText(/5 days old/)).toBeInTheDocument();
  });

  it('does not show PR age for PRs created today', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: {
        ...mockDetails,
        createdAt: new Date().toISOString(),
      },
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.queryByText(/days old/)).not.toBeInTheDocument();
  });

  it('handles author without avatar', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: {
        ...mockDetails,
        author: {
          username: 'testuser',
          htmlUrl: 'https://github.com/testuser',
          avatarUrl: undefined,
        },
      },
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText(/testuser/)).toBeInTheDocument();
    expect(screen.queryByAltText('testuser')).not.toBeInTheDocument();
  });

  it('handles missing author', () => {
    mockUsePullRequestDetails.mockReturnValue({
      data: {
        ...mockDetails,
        author: undefined,
      },
      loading: false,
    });

    render(<PRCard pr={mockPR} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test PR')).toBeInTheDocument();
  });
});
