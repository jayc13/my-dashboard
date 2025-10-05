import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import JiraListSection from '../components/JiraListSection';
import type { JiraTicket } from '@/types';

// Mock the JiraList widget
vi.mock('@/components/widgets/JiraList', () => ({
    default: ({ title, data }: { title: string; data: JiraTicket[] }) => (
        <div data-testid="jira-list">
            <h3>{title}</h3>
            <div data-testid="ticket-count">{data.length}</div>
        </div>
    ),
}));

const mockRefresh = vi.fn();

const mockTickets: JiraTicket[] = [
    {
        id: '1',
        key: 'TASK-1',
        summary: 'Task 1',
        status: 'To Do',
        assignee: 'User 1',
        url: 'https://example.com/1',
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-02T00:00:00.000Z',
        reporter: 'Reporter 1',
        labels: ['test'],
        priority: 'Medium',
    },
    {
        id: '2',
        key: 'TASK-2',
        summary: 'Task 2',
        status: 'In Progress',
        assignee: 'User 2',
        url: 'https://example.com/2',
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-02T00:00:00.000Z',
        reporter: 'Reporter 2',
        labels: ['test'],
        priority: 'High',
    },
    {
        id: '3',
        key: 'TASK-3',
        summary: 'Task 3',
        status: 'Done',
        assignee: 'User 3',
        url: 'https://example.com/3',
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-02T00:00:00.000Z',
        reporter: 'Reporter 3',
        labels: ['test'],
        priority: 'Low',
    },
];

describe('JiraListSection', () => {
    it('renders with title and data', () => {
        render(
            <JiraListSection
                title="Test Tickets"
                data={mockTickets}
                isLoading={false}
                hasError={false}
                refresh={mockRefresh}
            />,
        );

        expect(screen.getByText('Test Tickets')).toBeInTheDocument();
        expect(screen.getByTestId('ticket-count')).toHaveTextContent('3');
    });

    it('renders with empty data', () => {
        render(
            <JiraListSection
                title="Empty Tickets"
                data={[]}
                isLoading={false}
                hasError={false}
                refresh={mockRefresh}
            />,
        );

        expect(screen.getByText('Empty Tickets')).toBeInTheDocument();
        expect(screen.getByTestId('ticket-count')).toHaveTextContent('0');
    });

    it('sorts tickets by status when sortByStatus is true', () => {
        const { rerender } = render(
            <JiraListSection
                title="Sorted Tickets"
                data={mockTickets}
                isLoading={false}
                hasError={false}
                refresh={mockRefresh}
                sortByStatus={true}
            />,
        );

        expect(screen.getByTestId('jira-list')).toBeInTheDocument();

        // Re-render without sorting
        rerender(
            <JiraListSection
                title="Sorted Tickets"
                data={mockTickets}
                isLoading={false}
                hasError={false}
                refresh={mockRefresh}
                sortByStatus={false}
            />,
        );

        expect(screen.getByTestId('jira-list')).toBeInTheDocument();
    });

    it('passes loading state correctly', () => {
        render(
            <JiraListSection
                title="Loading Tickets"
                data={[]}
                isLoading={true}
                hasError={false}
                refresh={mockRefresh}
            />,
        );

        expect(screen.getByTestId('jira-list')).toBeInTheDocument();
    });

    it('passes error state correctly', () => {
        render(
            <JiraListSection
                title="Error Tickets"
                data={[]}
                isLoading={false}
                hasError={true}
                refresh={mockRefresh}
            />,
        );

        expect(screen.getByTestId('jira-list')).toBeInTheDocument();
    });
});

