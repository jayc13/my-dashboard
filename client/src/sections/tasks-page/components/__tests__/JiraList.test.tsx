import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JiraList from '../JiraList';
import type { JiraTicket } from '@/types/index';

// Mock JiraCard component
vi.mock('@/components/common/JiraCard', () => ({
  default: ({ ticket }: { ticket: JiraTicket }) => (
    <div data-testid={`jira-card-${ticket.key}`}>{ticket.summary}</div>
  ),
}));

// Mock TooltipIconButton
vi.mock('@/components/common', () => ({
  TooltipIconButton: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

describe('JiraList', () => {
  const mockTickets: JiraTicket[] = [
    {
      key: 'TICKET-1',
      summary: 'Test ticket 1',
      status: 'In Progress',
      assignee: 'John Doe',
      priority: 'High',
      updated: '2024-01-01',
    } as JiraTicket,
    {
      key: 'TICKET-2',
      summary: 'Test ticket 2',
      status: 'To Do',
      assignee: 'Jane Smith',
      priority: 'Medium',
      updated: '2024-01-02',
    } as JiraTicket,
  ];

  const mockRefresh = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when loading and no data', () => {
    // Pass undefined to trigger loading skeleton (not empty array)
    render(
      <JiraList
        data={undefined as any}
        title="My Tickets"
        isLoading={true}
        hasError={false}
        refresh={mockRefresh}
      />,
    );

    expect(screen.getByTestId('jira-list-my-tickets')).toBeInTheDocument();
    expect(screen.getByTestId('jira-list-loading-my-tickets')).toBeInTheDocument();
    expect(screen.getByTestId('jira-list-title-my-tickets')).toHaveTextContent('My Tickets');
  });

  it('renders error state', () => {
    render(
      <JiraList
        data={[]}
        title="My Tickets"
        isLoading={false}
        hasError={true}
        refresh={mockRefresh}
      />,
    );

    expect(screen.getByTestId('jira-list-error-my-tickets')).toBeInTheDocument();
    expect(screen.getByText('Error loading tickets')).toBeInTheDocument();
  });

  it('renders empty state when no tickets', () => {
    render(
      <JiraList
        data={[]}
        title="My Tickets"
        isLoading={false}
        hasError={false}
        refresh={mockRefresh}
      />,
    );

    expect(screen.getByTestId('jira-list-empty-my-tickets')).toBeInTheDocument();
    expect(screen.getByText('No tickets found')).toBeInTheDocument();
  });

  it('renders tickets when data is available', () => {
    render(
      <JiraList
        data={mockTickets}
        title="My Tickets"
        isLoading={false}
        hasError={false}
        refresh={mockRefresh}
      />,
    );

    expect(screen.getByTestId('jira-list-container-my-tickets')).toBeInTheDocument();
    expect(screen.getByTestId('jira-card-TICKET-1')).toBeInTheDocument();
    expect(screen.getByTestId('jira-card-TICKET-2')).toBeInTheDocument();
    expect(screen.getByText('Test ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Test ticket 2')).toBeInTheDocument();
  });

  it('displays ticket count in title when data is available', () => {
    render(
      <JiraList
        data={mockTickets}
        title="My Tickets"
        isLoading={false}
        hasError={false}
        refresh={mockRefresh}
      />,
    );

    expect(screen.getByTestId('jira-list-title-my-tickets')).toHaveTextContent('My Tickets (2)');
  });

  it('calls refresh when refresh button is clicked', async () => {
    render(
      <JiraList
        data={mockTickets}
        title="My Tickets"
        isLoading={false}
        hasError={false}
        refresh={mockRefresh}
      />,
    );

    const refreshButton = screen.getByTestId('jira-list-refresh-my-tickets');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('uses default values when props are not provided', () => {
    render(<JiraList data={[]} title="Test" />);

    // Should render loading state by default (isLoading defaults to true)
    expect(screen.getByTestId('jira-list-test')).toBeInTheDocument();
  });

  it('does not show loading skeleton when loading but data exists', () => {
    render(
      <JiraList
        data={mockTickets}
        title="My Tickets"
        isLoading={true}
        hasError={false}
        refresh={mockRefresh}
      />,
    );

    // Should show the tickets, not the loading skeleton
    expect(screen.queryByTestId('jira-list-loading-my-tickets')).not.toBeInTheDocument();
    expect(screen.getByTestId('jira-list-container-my-tickets')).toBeInTheDocument();
  });

  it('handles title with multiple words correctly', () => {
    render(
      <JiraList
        data={mockTickets}
        title="Manual Testing Tasks"
        isLoading={false}
        hasError={false}
        refresh={mockRefresh}
      />,
    );

    expect(screen.getByTestId('jira-list-manual-testing-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('jira-list-title-manual-testing-tasks')).toHaveTextContent(
      'Manual Testing Tasks (2)',
    );
  });

  it('disables refresh button while refreshing', async () => {
    let resolveRefresh: () => void;
    const slowRefresh = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRefresh = resolve;
        }),
    );

    render(
      <JiraList
        data={mockTickets}
        title="My Tickets"
        isLoading={false}
        hasError={false}
        refresh={slowRefresh}
      />,
    );

    const refreshButton = screen.getByTestId('jira-list-refresh-my-tickets') as HTMLButtonElement;

    // Button should be enabled initially
    expect(refreshButton.disabled).toBe(false);

    // Click the refresh button
    fireEvent.click(refreshButton);

    // Button should be disabled while refreshing
    await waitFor(() => {
      expect(refreshButton.disabled).toBe(true);
    });

    // Resolve the refresh promise
    resolveRefresh!();

    // Button should be enabled again after refresh completes
    await waitFor(() => {
      expect(refreshButton.disabled).toBe(false);
    });

    expect(slowRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator while refreshing', async () => {
    let resolveRefresh: () => void;
    const slowRefresh = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRefresh = resolve;
        }),
    );

    render(
      <JiraList
        data={mockTickets}
        title="My Tickets"
        isLoading={false}
        hasError={false}
        refresh={slowRefresh}
      />,
    );

    const refreshButton = screen.getByTestId('jira-list-refresh-my-tickets');

    // Click the refresh button
    fireEvent.click(refreshButton);

    // Should show CircularProgress while refreshing
    await waitFor(() => {
      const circularProgress = refreshButton.querySelector('.MuiCircularProgress-root');
      expect(circularProgress).toBeInTheDocument();
    });

    // Resolve the refresh promise
    resolveRefresh!();

    // Should show RefreshIcon again after refresh completes
    await waitFor(() => {
      const circularProgress = refreshButton.querySelector('.MuiCircularProgress-root');
      expect(circularProgress).not.toBeInTheDocument();
    });
  });

  it('re-enables button even if refresh fails', async () => {
    const failingRefresh = vi.fn(() => Promise.reject(new Error('Refresh failed')));

    render(
      <JiraList
        data={mockTickets}
        title="My Tickets"
        isLoading={false}
        hasError={false}
        refresh={failingRefresh}
      />,
    );

    const refreshButton = screen.getByTestId('jira-list-refresh-my-tickets') as HTMLButtonElement;

    // Click the refresh button
    fireEvent.click(refreshButton);

    // Button should be disabled while refreshing
    await waitFor(() => {
      expect(refreshButton.disabled).toBe(true);
    });

    // Button should be enabled again even after failure
    await waitFor(() => {
      expect(refreshButton.disabled).toBe(false);
    });

    expect(failingRefresh).toHaveBeenCalledTimes(1);
  });
});
