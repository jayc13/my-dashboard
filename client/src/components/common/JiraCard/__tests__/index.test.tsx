import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JiraCard from '../index';
import type { JiraTicket } from '@/types';

// Mock window.open
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

describe('JiraCard index', () => {
  const mockTicket: JiraTicket = {
    id: '10001',
    key: 'TEST-123',
    summary: 'Test ticket summary',
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Doe',
    reporter: 'Jane Smith',
    created: '2024-01-10T10:30:00Z',
    updated: '2024-01-15T10:30:00Z',
    url: 'https://jira.example.com/browse/TEST-123',
    labels: ['frontend', 'urgent'],
  };

  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  it('renders JiraCard component', () => {
    render(<JiraCard ticket={mockTicket} />);
    expect(screen.getByTestId('jira-card-TEST-123')).toBeInTheDocument();
  });

  it('displays ticket summary', () => {
    render(<JiraCard ticket={mockTicket} />);
    expect(screen.getByText('Test ticket summary')).toBeInTheDocument();
  });

  it('displays ticket key', () => {
    render(<JiraCard ticket={mockTicket} />);
    expect(screen.getByText('TEST-123')).toBeInTheDocument();
  });

  it('displays ticket status', () => {
    render(<JiraCard ticket={mockTicket} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('displays ticket labels', () => {
    render(<JiraCard ticket={mockTicket} />);
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('opens ticket URL in new tab when clicked', () => {
    render(<JiraCard ticket={mockTicket} />);
    const card = screen.getByTestId('jira-card-TEST-123');
    card.click();
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://jira.example.com/browse/TEST-123',
      '_blank',
    );
  });

  it('renders parent ticket when present', () => {
    const ticketWithParent: JiraTicket = {
      ...mockTicket,
      parent: {
        id: '10002',
        key: 'PARENT-456',
        url: 'https://jira.example.com/browse/PARENT-456',
        summary: 'Parent ticket summary',
      },
    };
    render(<JiraCard ticket={ticketWithParent} />);
    expect(screen.getByText(/PARENT-456/)).toBeInTheDocument();
    expect(screen.getByText(/Parent ticket summary/)).toBeInTheDocument();
  });

  it('does not render parent section when parent is not present', () => {
    render(<JiraCard ticket={mockTicket} />);
    expect(screen.queryByTestId(/jira-card-parent/)).not.toBeInTheDocument();
  });

  it('renders with different priority colors', () => {
    const { rerender } = render(<JiraCard ticket={{ ...mockTicket, priority: 'Critical' }} />);
    expect(screen.getByTestId('jira-card-TEST-123')).toBeInTheDocument();

    rerender(<JiraCard ticket={{ ...mockTicket, priority: 'Low' }} />);
    expect(screen.getByTestId('jira-card-TEST-123')).toBeInTheDocument();
  });

  it('renders assignee information', () => {
    render(<JiraCard ticket={mockTicket} />);
    expect(screen.getByText('J')).toBeInTheDocument(); // First letter of John Doe
  });

  it('renders without labels when labels array is empty', () => {
    const ticketWithoutLabels: JiraTicket = {
      ...mockTicket,
      labels: [],
    };
    render(<JiraCard ticket={ticketWithoutLabels} />);
    expect(screen.getByTestId('jira-card-TEST-123')).toBeInTheDocument();
  });

  it('renders with minimal ticket data', () => {
    const minimalTicket: JiraTicket = {
      id: '10003',
      key: 'MIN-1',
      summary: 'Minimal ticket',
      status: 'To Do',
      priority: 'Medium',
      assignee: '',
      reporter: 'Unknown',
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      url: 'https://jira.example.com/browse/MIN-1',
      labels: [],
    };
    render(<JiraCard ticket={minimalTicket} />);
    expect(screen.getByTestId('jira-card-MIN-1')).toBeInTheDocument();
    expect(screen.getByText('Minimal ticket')).toBeInTheDocument();
  });
});
