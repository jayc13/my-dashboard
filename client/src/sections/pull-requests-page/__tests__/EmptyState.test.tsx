import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../components/EmptyState';

describe('EmptyState', () => {
    it('renders empty state message', () => {
        const mockOnAddClick = vi.fn();
        render(<EmptyState onAddClick={mockOnAddClick} />);

        expect(screen.getByText('No pull requests found')).toBeInTheDocument();
        expect(screen.getByText('Add a GitHub pull request to get started.')).toBeInTheDocument();
    });

    it('renders add button', () => {
        const mockOnAddClick = vi.fn();
        render(<EmptyState onAddClick={mockOnAddClick} />);

        const addButton = screen.getByTestId('add-pr-button-empty');
        expect(addButton).toBeInTheDocument();
        expect(addButton).toHaveTextContent('Add Pull Request');
    });

    it('calls onAddClick when button is clicked', () => {
        const mockOnAddClick = vi.fn();
        render(<EmptyState onAddClick={mockOnAddClick} />);

        const addButton = screen.getByTestId('add-pr-button-empty');
        fireEvent.click(addButton);

        expect(mockOnAddClick).toHaveBeenCalledTimes(1);
    });

    it('renders icon', () => {
        const mockOnAddClick = vi.fn();
        render(<EmptyState onAddClick={mockOnAddClick} />);

        expect(screen.getByTestId('pr-empty-state')).toBeInTheDocument();
    });
});

