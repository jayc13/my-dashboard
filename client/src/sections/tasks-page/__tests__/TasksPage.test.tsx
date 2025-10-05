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
        expect(screen.getByText('Tasks')).toBeInTheDocument();
        expect(screen.getByTestId('todo-list-section')).toBeInTheDocument();
        expect(screen.getByTestId('jira-list-section-manual-testing')).toBeInTheDocument();
        expect(screen.getByTestId('jira-list-section-my-tickets')).toBeInTheDocument();
    });

    it('renders refresh button', () => {
        render(<TasksPage {...defaultProps} />);

        const refreshButton = screen.getByTestId('refresh-button');
        expect(refreshButton).toBeInTheDocument();
    });

    it('calls refetch functions when refresh button is clicked', async () => {
        render(<TasksPage {...defaultProps} />);

        const refreshButton = screen.getByTestId('refresh-button');
        refreshButton.click();

        // Wait for async operations
        await vi.waitFor(() => {
            expect(mockRefetchMyTickets).toHaveBeenCalled();
            expect(mockRefetchManualTesting).toHaveBeenCalled();
        });
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

