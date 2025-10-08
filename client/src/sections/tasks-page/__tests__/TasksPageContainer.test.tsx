import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TasksPageContainer from '../TasksPageContainer';

// Mock the hooks
const mockUseMyJiraTickets = vi.fn();
const mockUseManualQATasks = vi.fn();

vi.mock('@/hooks', () => ({
  useMyJiraTickets: () => mockUseMyJiraTickets(),
  useManualQATasks: () => mockUseManualQATasks(),
}));

// Mock TasksPage component
vi.mock('../TasksPage', () => ({
  default: (props: any) => (
    <div data-testid="tasks-page-mock">
      <div data-testid="my-tickets-loading">{String(props.isLoadingMyTickets)}</div>
      <div data-testid="manual-testing-loading">{String(props.isLoadingManualTesting)}</div>
      <div data-testid="my-tickets-count">{props.myTicketsData?.length || 0}</div>
      <div data-testid="manual-testing-count">{props.manualTestingData?.length || 0}</div>
    </div>
  ),
}));

describe('TasksPageContainer', () => {
  const mockRefetchMyTickets = vi.fn();
  const mockRefetchManualTesting = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with loading state', () => {
    mockUseMyJiraTickets.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetchMyTickets,
    });

    mockUseManualQATasks.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetchManualTesting,
    });

    render(<TasksPageContainer />);

    expect(screen.getByTestId('tasks-page-mock')).toBeInTheDocument();
    expect(screen.getByTestId('my-tickets-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('manual-testing-loading')).toHaveTextContent('true');
  });

  it('renders with data', () => {
    const mockMyTickets = {
      issues: [
        { id: '1', key: 'TICKET-1', summary: 'Test ticket 1', status: 'In Progress' },
        { id: '2', key: 'TICKET-2', summary: 'Test ticket 2', status: 'To Do' },
      ],
    };

    const mockManualTesting = {
      issues: [{ id: '3', key: 'TEST-1', summary: 'Test task 1', status: 'In Progress' }],
    };

    mockUseMyJiraTickets.mockReturnValue({
      data: mockMyTickets,
      loading: false,
      error: null,
      refetch: mockRefetchMyTickets,
    });

    mockUseManualQATasks.mockReturnValue({
      data: mockManualTesting,
      loading: false,
      error: null,
      refetch: mockRefetchManualTesting,
    });

    render(<TasksPageContainer />);

    expect(screen.getByTestId('my-tickets-count')).toHaveTextContent('2');
    expect(screen.getByTestId('manual-testing-count')).toHaveTextContent('1');
  });

  it('renders with error state', () => {
    mockUseMyJiraTickets.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch tickets'),
      refetch: mockRefetchMyTickets,
    });

    mockUseManualQATasks.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch tasks'),
      refetch: mockRefetchManualTesting,
    });

    render(<TasksPageContainer />);

    expect(screen.getByTestId('tasks-page-mock')).toBeInTheDocument();
  });

  it('handles undefined data', () => {
    mockUseMyJiraTickets.mockReturnValue({
      data: undefined,
      loading: false,
      error: null,
      refetch: mockRefetchMyTickets,
    });

    mockUseManualQATasks.mockReturnValue({
      data: undefined,
      loading: false,
      error: null,
      refetch: mockRefetchManualTesting,
    });

    render(<TasksPageContainer />);

    expect(screen.getByTestId('my-tickets-count')).toHaveTextContent('0');
    expect(screen.getByTestId('manual-testing-count')).toHaveTextContent('0');
  });
});
