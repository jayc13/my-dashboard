import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TasksPage from '../TasksPage';
import type { TasksPageProps } from '../TasksPage';

// Mock the components
vi.mock('../components/ToDoListSection', () => ({
    default: () => <div data-testid="todo-list-section">To-Do List Section</div>,
}));

vi.mock('../components/JiraListSection', () => ({
    default: ({ title }: { title: string }) => (
        <div data-testid={`jira-list-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
        </div>
    ),
}));

vi.mock('@/components/common', () => ({
    TooltipIconButton: ({ children, onClick }: any) => (
        <button onClick={onClick} data-testid="refresh-button">
            {children}
        </button>
    ),
}));

const mockRefetchMyTickets = vi.fn();
const mockRefetchManualTesting = vi.fn();

const defaultProps: TasksPageProps = {
    myTicketsData: [],
    manualTestingData: [],
    isLoadingMyTickets: false,
    isLoadingManualTesting: false,
    errorMyTickets: null,
    errorManualTesting: null,
    refetchMyTickets: mockRefetchMyTickets,
    refetchManualTesting: mockRefetchManualTesting,
};

describe('TasksPage', () => {
    it('renders the tasks page with all sections', () => {
        render(<TasksPage {...defaultProps} />);

        expect(screen.getByTestId('tasks-page')).toBeInTheDocument();
        expect(screen.getByTestId('todo-list-section')).toBeInTheDocument();
        expect(screen.getByTestId('jira-list-section-manual-testing')).toBeInTheDocument();
        expect(screen.getByTestId('jira-list-section-my-tickets')).toBeInTheDocument();
    });

    it('renders section titles', () => {
        render(<TasksPage {...defaultProps} />);

        expect(screen.getByText('Manual Testing')).toBeInTheDocument();
        expect(screen.getByText('My Tickets')).toBeInTheDocument();
    });

    it('displays error message when myTickets has error', () => {
        const errorProps = {
            ...defaultProps,
            errorMyTickets: new Error('Failed to fetch my tickets'),
        };

        render(<TasksPage {...errorProps} />);

        expect(screen.getByText(/Error fetching information/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch my tickets/)).toBeInTheDocument();
    });

    it('displays error message when manualTesting has error', () => {
        const errorProps = {
            ...defaultProps,
            errorManualTesting: new Error('Failed to fetch manual testing'),
        };

        render(<TasksPage {...errorProps} />);

        expect(screen.getByText(/Error fetching information/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch manual testing/)).toBeInTheDocument();
    });

    it('displays error message when both have errors', () => {
        const errorProps = {
            ...defaultProps,
            errorMyTickets: new Error('Failed to fetch my tickets'),
            errorManualTesting: new Error('Failed to fetch manual testing'),
        };

        render(<TasksPage {...errorProps} />);

        expect(screen.getByText(/Error fetching information/)).toBeInTheDocument();
        // Should display the first error message
        expect(screen.getByText(/Failed to fetch my tickets/)).toBeInTheDocument();
    });
});

