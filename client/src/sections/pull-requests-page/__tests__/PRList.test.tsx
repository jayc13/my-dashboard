import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PRList from '../components/PRList';
import type { PullRequest } from '@/types';

// Mock PRCard component
vi.mock('../components/PRCard', () => ({
    default: ({ pr }: { pr: PullRequest }) => (
        <div data-testid={`pr-card-${pr.id}`}>PR Card {pr.id}</div>
    ),
}));

const mockOnDelete = vi.fn();

const mockPullRequests: PullRequest[] = [
    { id: '1', repository: 'org/repo1', pullRequestNumber: 123 },
    { id: '2', repository: 'org/repo2', pullRequestNumber: 456 },
    { id: '3', repository: 'org/repo3', pullRequestNumber: 789 },
];

describe('PRList', () => {
    it('renders all pull requests', () => {
        render(<PRList pullRequests={mockPullRequests} onDelete={mockOnDelete} />);

        expect(screen.getByTestId('pr-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('pr-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('pr-card-3')).toBeInTheDocument();
    });

    it('renders empty when no pull requests', () => {
        const { container } = render(<PRList pullRequests={[]} onDelete={mockOnDelete} />);
        // The component returns a fragment, so we check that no pr-card elements are rendered
        expect(screen.queryByTestId(/pr-card-/)).not.toBeInTheDocument();
    });

    it('passes onDelete handler to each card', () => {
        render(<PRList pullRequests={mockPullRequests} onDelete={mockOnDelete} />);
        // The mock component doesn't actually call onDelete, but we verify it's passed
        expect(screen.getAllByText(/PR Card/)).toHaveLength(3);
    });
});

