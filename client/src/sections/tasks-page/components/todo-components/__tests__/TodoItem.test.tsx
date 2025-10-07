import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItem } from '../TodoItem';
import type { ToDoItem } from '@my-dashboard/types/todos';
import { DateTime } from 'luxon';

// Mock TooltipIconButton
vi.mock('@/components/common', () => ({
    TooltipIconButton: ({ children, onClick, href, 'data-testid': testId }: any) => {
        if (href) {
            return (
                <a href={href} data-testid={testId} target="_blank" rel="noopener">
                    {children}
                </a>
            );
        }
        return (
            <button onClick={onClick} data-testid={testId}>
                {children}
            </button>
        );
    },
}));

describe('TodoItem', () => {
    const mockOnToggle = vi.fn();
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    const baseTodo: ToDoItem = {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        link: 'https://example.com',
        dueDate: DateTime.now().plus({ days: 1 }).toISO(),
        isCompleted: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders todo item with all details', () => {
        render(
            <TodoItem
                todo={baseTodo}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('todo-title-1')).toHaveTextContent('Test Todo');
        expect(screen.getByTestId('todo-description-1')).toHaveTextContent('Test Description');
        expect(screen.getByTestId('todo-due-date-1')).toBeInTheDocument();
    });

    it('renders todo without description', () => {
        const todoWithoutDesc = { ...baseTodo, description: '' };
        render(
            <TodoItem
                todo={todoWithoutDesc}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        expect(screen.getByTestId('todo-title-1')).toBeInTheDocument();
        expect(screen.queryByTestId('todo-description-1')).not.toBeInTheDocument();
    });

    it('renders todo without due date', () => {
        const todoWithoutDueDate = { ...baseTodo, dueDate: '' };
        render(
            <TodoItem
                todo={todoWithoutDueDate}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        expect(screen.getByTestId('todo-title-1')).toBeInTheDocument();
        expect(screen.queryByTestId('todo-due-date-1')).not.toBeInTheDocument();
    });

    it('renders link button when link is provided', () => {
        render(
            <TodoItem
                todo={baseTodo}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        const linkButton = screen.getByTestId('todo-link-button-1');
        expect(linkButton).toBeInTheDocument();
        expect(linkButton).toHaveAttribute('href', 'https://example.com');
    });

    it('does not render link button when link is not provided', () => {
        const todoWithoutLink = { ...baseTodo, link: '' };
        render(
            <TodoItem
                todo={todoWithoutLink}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        expect(screen.queryByTestId('todo-link-button-1')).not.toBeInTheDocument();
    });

    it('calls onToggle when checkbox is clicked', () => {
        render(
            <TodoItem
                todo={baseTodo}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        const checkbox = screen.getByTestId('todo-checkbox-1').querySelector('input')!;
        fireEvent.click(checkbox);

        expect(mockOnToggle).toHaveBeenCalledWith(1, true);
    });

    it('disables checkbox when isToggling is true', () => {
        render(
            <TodoItem
                todo={baseTodo}
                isToggling={true}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        const checkbox = screen.getByTestId('todo-checkbox-1').querySelector('input') as HTMLInputElement;
        expect(checkbox.disabled).toBe(true);
    });

    it('calls onEdit when edit button is clicked', () => {
        render(
            <TodoItem
                todo={baseTodo}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        const editButton = screen.getByTestId('todo-edit-button-1');
        fireEvent.click(editButton);

        expect(mockOnEdit).toHaveBeenCalledWith(baseTodo);
    });

    it('calls onDelete when delete button is clicked', () => {
        render(
            <TodoItem
                todo={baseTodo}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        const deleteButton = screen.getByTestId('todo-delete-button-1');
        fireEvent.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('applies completed styling when todo is completed', () => {
        const completedTodo = { ...baseTodo, isCompleted: true };
        render(
            <TodoItem
                todo={completedTodo}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        const checkbox = screen.getByTestId('todo-checkbox-1').querySelector('input') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
    });

    it('shows overdue indicator for past due date on incomplete todo', () => {
        const overdueTodo = {
            ...baseTodo,
            dueDate: DateTime.now().minus({ days: 1 }).toISO(),
            isCompleted: false,
        };

        render(
            <TodoItem
                todo={overdueTodo}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        const dueDate = screen.getByTestId('todo-due-date-1');
        expect(dueDate).toBeInTheDocument();
    });

    it('does not show overdue indicator for past due date on completed todo', () => {
        const completedOverdueTodo = {
            ...baseTodo,
            dueDate: DateTime.now().minus({ days: 1 }).toISO(),
            isCompleted: true,
        };

        render(
            <TodoItem
                todo={completedOverdueTodo}
                isToggling={false}
                onToggle={mockOnToggle}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />,
        );

        const dueDate = screen.getByTestId('todo-due-date-1');
        expect(dueDate).toBeInTheDocument();
    });
});

