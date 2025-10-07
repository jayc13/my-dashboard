import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ToDoListWidget from '../ToDoList';
import type { ToDoItem } from '@my-dashboard/types/todos';
import { DateTime } from 'luxon';

// Mock the hooks
const mockUseTodos = vi.fn();
const mockUseCreateTodo = vi.fn();
const mockUseUpdateTodo = vi.fn();
const mockUseDeleteTodo = vi.fn();
const mockUseToggleTodo = vi.fn();

vi.mock('@/hooks', () => ({
    useTodos: () => mockUseTodos(),
    useCreateTodo: () => mockUseCreateTodo(),
    useUpdateTodo: () => mockUseUpdateTodo(),
    useDeleteTodo: () => mockUseDeleteTodo(),
    useToggleTodo: () => mockUseToggleTodo(),
}));

// Mock child components
vi.mock('../todo-components', () => ({
    TodoItem: ({ todo, onToggle, onEdit, onDelete }: any) => (
        <div data-testid={`todo-item-${todo.id}`}>
            <span data-testid={`todo-title-${todo.id}`}>{todo.title}</span>
            <button onClick={() => onToggle(todo.id, !todo.isCompleted)} data-testid={`todo-checkbox-${todo.id}`}>
                Toggle
            </button>
            <button onClick={() => onEdit(todo)} data-testid={`todo-edit-button-${todo.id}`}>
                Edit
            </button>
            <button onClick={() => onDelete(todo.id)} data-testid={`todo-delete-button-${todo.id}`}>
                Delete
            </button>
        </div>
    ),
    TodoFormDialog: ({ open, form, onClose, onChange, onSubmit }: any) =>
        open ? (
            <div data-testid="todo-form-dialog">
                <form onSubmit={onSubmit} data-testid="todo-form">
                    <input
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        data-testid="todo-form-title-input"
                    />
                    <input
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        data-testid="todo-form-description-input"
                    />
                    <button type="button" onClick={onClose} data-testid="todo-form-cancel-button">
                        Cancel
                    </button>
                    <button type="submit" data-testid="todo-form-submit-button">
                        Submit
                    </button>
                </form>
            </div>
        ) : null,
    TodoDeleteDialog: ({ open, onConfirm, onCancel }: any) =>
        open ? (
            <div data-testid="todo-delete-dialog">
                <button onClick={onCancel} data-testid="todo-delete-cancel-button">
                    Cancel
                </button>
                <button onClick={onConfirm} data-testid="todo-delete-confirm-button">
                    Delete
                </button>
            </div>
        ) : null,
    TodoQuickAdd: ({ value, onChange, onSubmit }: any) => (
        <form onSubmit={onSubmit} data-testid="todo-quick-add-form">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                data-testid="todo-quick-add-input"
            />
            <button type="submit" data-testid="todo-quick-add-button">
                Add
            </button>
        </form>
    ),
    TodoStats: ({ todos }: any) => (
        <div data-testid="todo-stats">
            {todos.length} todos
        </div>
    ),
    TodoEmptyState: () => (
        <div data-testid="todo-empty-state">
            No todos
        </div>
    ),
    TodoFilters: ({ filterType, onFilterChange, overdueCount, dueSoonCount, dueTodayCount }: any) => (
        <div data-testid="todo-filters">
            <button onClick={() => onFilterChange('all')} data-testid="filter-all">All</button>
            <button onClick={() => onFilterChange('overdue')} data-testid="filter-overdue">Overdue ({overdueCount})</button>
            <button onClick={() => onFilterChange('today')} data-testid="filter-today">Today ({dueTodayCount})</button>
            <button onClick={() => onFilterChange('due-soon')} data-testid="filter-due-soon">Due Soon ({dueSoonCount})</button>
        </div>
    ),
}));

describe('ToDoListWidget', () => {
    const mockRefetch = vi.fn();
    const mockCreateMutate = vi.fn();
    const mockUpdateMutate = vi.fn();
    const mockDeleteMutate = vi.fn();
    const mockToggleMutate = vi.fn();

    const sampleTodos: ToDoItem[] = [
        {
            id: 1,
            title: 'Todo 1',
            description: 'Description 1',
            link: 'https://example.com/1',
            dueDate: DateTime.now().plus({ days: 1 }).toISO(),
            isCompleted: false,
        },
        {
            id: 2,
            title: 'Todo 2',
            description: 'Description 2',
            link: '',
            dueDate: '',
            isCompleted: true,
        },
        {
            id: 3,
            title: 'Todo 3',
            description: '',
            link: '',
            dueDate: DateTime.now().plus({ days: 2 }).toISO(),
            isCompleted: false,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseTodos.mockReturnValue({
            data: sampleTodos,
            loading: false,
            error: null,
            refetch: mockRefetch,
        });

        mockUseCreateTodo.mockReturnValue({
            mutate: mockCreateMutate,
            loading: false,
        });

        mockUseUpdateTodo.mockReturnValue({
            mutate: mockUpdateMutate,
            loading: false,
        });

        mockUseDeleteTodo.mockReturnValue({
            mutate: mockDeleteMutate,
            loading: false,
        });

        mockUseToggleTodo.mockReturnValue({
            mutate: mockToggleMutate,
            loading: false,
        });

        mockCreateMutate.mockResolvedValue({});
        mockUpdateMutate.mockResolvedValue({});
        mockDeleteMutate.mockResolvedValue({});
        mockToggleMutate.mockResolvedValue({});
        mockRefetch.mockResolvedValue({});
    });

    it('renders the widget', () => {
        render(<ToDoListWidget />);
        expect(screen.getByTestId('todo-widget')).toBeInTheDocument();
    });

    it('renders loading state', () => {
        mockUseTodos.mockReturnValue({
            data: null,
            loading: true,
            error: null,
            refetch: mockRefetch,
        });

        render(<ToDoListWidget />);
        expect(screen.getByTestId('todo-loading')).toBeInTheDocument();
    });

    it('renders error state', () => {
        const error = new Error('Failed to load todos');
        mockUseTodos.mockReturnValue({
            data: [],
            loading: false,
            error,
            refetch: mockRefetch,
        });

        render(<ToDoListWidget />);
        expect(screen.getByTestId('todo-error-alert')).toBeInTheDocument();
        expect(screen.getByText(/Failed to load todos/)).toBeInTheDocument();
    });

    it('renders empty state when no todos', () => {
        mockUseTodos.mockReturnValue({
            data: [],
            loading: false,
            error: null,
            refetch: mockRefetch,
        });

        render(<ToDoListWidget />);
        expect(screen.getByTestId('todo-empty-state')).toBeInTheDocument();
        expect(screen.getByText('No To-Dos yet')).toBeInTheDocument();
    });

    it('renders todo items', () => {
        render(<ToDoListWidget />);

        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
        expect(screen.getByTestId('todo-item-3')).toBeInTheDocument();
    });

    it('renders quick add form', () => {
        render(<ToDoListWidget />);
        expect(screen.getByTestId('todo-quick-add-form')).toBeInTheDocument();
    });

    describe('Quick Add Functionality', () => {
        it('updates quick add input value', () => {
            render(<ToDoListWidget />);

            const input = screen.getByTestId('todo-quick-add-input') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'New Quick Todo' } });

            expect(input.value).toBe('New Quick Todo');
        });

        it('creates todo on quick add submit', async () => {
            render(<ToDoListWidget />);

            const input = screen.getByTestId('todo-quick-add-input');
            const form = screen.getByTestId('todo-quick-add-form');

            fireEvent.change(input, { target: { value: 'New Quick Todo' } });
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockCreateMutate).toHaveBeenCalledWith({
                    title: 'New Quick Todo',
                    isCompleted: false,
                });
            });

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('does not create todo when quick add input is empty', async () => {
            render(<ToDoListWidget />);

            const form = screen.getByTestId('todo-quick-add-form');
            fireEvent.submit(form);

            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('does not create todo when quick add input is only whitespace', async () => {
            render(<ToDoListWidget />);

            const input = screen.getByTestId('todo-quick-add-input');
            const form = screen.getByTestId('todo-quick-add-form');

            fireEvent.change(input, { target: { value: '   ' } });
            fireEvent.submit(form);

            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('clears quick add input after successful creation', async () => {
            render(<ToDoListWidget />);

            const input = screen.getByTestId('todo-quick-add-input') as HTMLInputElement;
            const form = screen.getByTestId('todo-quick-add-form');

            fireEvent.change(input, { target: { value: 'New Quick Todo' } });
            fireEvent.submit(form);

            await waitFor(() => {
                expect(input.value).toBe('');
            });
        });
    });

    describe('Toggle Functionality', () => {
        it('toggles todo completion', async () => {
            render(<ToDoListWidget />);

            const toggleButton = screen.getByTestId('todo-checkbox-1');
            fireEvent.click(toggleButton);

            await waitFor(() => {
                expect(mockToggleMutate).toHaveBeenCalledWith({
                    id: 1,
                    isCompleted: true,
                });
            });

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled();
            });
        });
    });

    describe('Edit Functionality', () => {
        it('opens edit dialog when edit button is clicked', () => {
            render(<ToDoListWidget />);

            const editButton = screen.getByTestId('todo-edit-button-1');
            fireEvent.click(editButton);

            expect(screen.getByTestId('todo-form-dialog')).toBeInTheDocument();
        });

        it('pre-fills form with todo data when editing', () => {
            render(<ToDoListWidget />);

            const editButton = screen.getByTestId('todo-edit-button-1');
            fireEvent.click(editButton);

            const titleInput = screen.getByTestId('todo-form-title-input') as HTMLInputElement;
            const descInput = screen.getByTestId('todo-form-description-input') as HTMLInputElement;

            expect(titleInput.value).toBe('Todo 1');
            expect(descInput.value).toBe('Description 1');
        });

        it('closes edit dialog when cancel is clicked', () => {
            render(<ToDoListWidget />);

            const editButton = screen.getByTestId('todo-edit-button-1');
            fireEvent.click(editButton);

            const cancelButton = screen.getByTestId('todo-form-cancel-button');
            fireEvent.click(cancelButton);

            expect(screen.queryByTestId('todo-form-dialog')).not.toBeInTheDocument();
        });

        it('updates todo when form is submitted', async () => {
            render(<ToDoListWidget />);

            const editButton = screen.getByTestId('todo-edit-button-1');
            fireEvent.click(editButton);

            const titleInput = screen.getByTestId('todo-form-title-input');
            fireEvent.change(titleInput, { target: { name: 'title', value: 'Updated Title' } });

            const form = screen.getByTestId('todo-form');
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockUpdateMutate).toHaveBeenCalledWith({
                    id: 1,
                    data: expect.objectContaining({
                        title: 'Updated Title',
                    }),
                });
            });

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('closes dialog after successful update', async () => {
            render(<ToDoListWidget />);

            const editButton = screen.getByTestId('todo-edit-button-1');
            fireEvent.click(editButton);

            const form = screen.getByTestId('todo-form');
            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.queryByTestId('todo-form-dialog')).not.toBeInTheDocument();
            });
        });

        it('handles form field changes', () => {
            render(<ToDoListWidget />);

            const editButton = screen.getByTestId('todo-edit-button-1');
            fireEvent.click(editButton);

            const titleInput = screen.getByTestId('todo-form-title-input') as HTMLInputElement;
            fireEvent.change(titleInput, { target: { name: 'title', value: 'New Title' } });

            expect(titleInput.value).toBe('New Title');
        });
    });

    describe('Delete Functionality', () => {
        it('opens delete dialog when delete button is clicked', () => {
            render(<ToDoListWidget />);

            const deleteButton = screen.getByTestId('todo-delete-button-1');
            fireEvent.click(deleteButton);

            expect(screen.getByTestId('todo-delete-dialog')).toBeInTheDocument();
        });

        it('closes delete dialog when cancel is clicked', () => {
            render(<ToDoListWidget />);

            const deleteButton = screen.getByTestId('todo-delete-button-1');
            fireEvent.click(deleteButton);

            const cancelButton = screen.getByTestId('todo-delete-cancel-button');
            fireEvent.click(cancelButton);

            expect(screen.queryByTestId('todo-delete-dialog')).not.toBeInTheDocument();
        });

        it('deletes todo when confirm is clicked', async () => {
            render(<ToDoListWidget />);

            const deleteButton = screen.getByTestId('todo-delete-button-1');
            fireEvent.click(deleteButton);

            const confirmButton = screen.getByTestId('todo-delete-confirm-button');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockDeleteMutate).toHaveBeenCalledWith(1);
            });

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('closes delete dialog after successful deletion', async () => {
            render(<ToDoListWidget />);

            const deleteButton = screen.getByTestId('todo-delete-button-1');
            fireEvent.click(deleteButton);

            const confirmButton = screen.getByTestId('todo-delete-confirm-button');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByTestId('todo-delete-dialog')).not.toBeInTheDocument();
            });
        });
    });

    describe('Sorting Functionality', () => {
        it('sorts incomplete todos before completed todos', () => {
            const mixedTodos: ToDoItem[] = [
                { id: 1, title: 'Completed', description: '', link: '', dueDate: '', isCompleted: true },
                { id: 2, title: 'Incomplete', description: '', link: '', dueDate: '', isCompleted: false },
            ];

            mockUseTodos.mockReturnValue({
                data: mixedTodos,
                loading: false,
                error: null,
                refetch: mockRefetch,
            });

            render(<ToDoListWidget />);

            const items = screen.getAllByTestId(/^todo-item-/);
            expect(items[0]).toHaveAttribute('data-testid', 'todo-item-2'); // Incomplete first
            expect(items[1]).toHaveAttribute('data-testid', 'todo-item-1'); // Completed second
        });

        it('sorts incomplete todos without due date before those with due date', () => {
            const todosWithDates: ToDoItem[] = [
                {
                    id: 1,
                    title: 'With Date',
                    description: '',
                    link: '',
                    dueDate: DateTime.now().plus({ days: 1 }).toISO(),
                    isCompleted: false,
                },
                {
                    id: 2,
                    title: 'No Date',
                    description: '',
                    link: '',
                    dueDate: '',
                    isCompleted: false,
                },
            ];

            mockUseTodos.mockReturnValue({
                data: todosWithDates,
                loading: false,
                error: null,
                refetch: mockRefetch,
            });

            render(<ToDoListWidget />);

            const items = screen.getAllByTestId(/^todo-item-/);
            expect(items[0]).toHaveAttribute('data-testid', 'todo-item-2'); // No date first
            expect(items[1]).toHaveAttribute('data-testid', 'todo-item-1'); // With date second
        });

        it('sorts incomplete todos by due date ascending', () => {
            const todosWithDates: ToDoItem[] = [
                {
                    id: 1,
                    title: 'Later',
                    description: '',
                    link: '',
                    dueDate: DateTime.now().plus({ days: 5 }).toISO(),
                    isCompleted: false,
                },
                {
                    id: 2,
                    title: 'Sooner',
                    description: '',
                    link: '',
                    dueDate: DateTime.now().plus({ days: 1 }).toISO(),
                    isCompleted: false,
                },
            ];

            mockUseTodos.mockReturnValue({
                data: todosWithDates,
                loading: false,
                error: null,
                refetch: mockRefetch,
            });

            render(<ToDoListWidget />);

            const items = screen.getAllByTestId(/^todo-item-/);
            expect(items[0]).toHaveAttribute('data-testid', 'todo-item-2'); // Sooner first
            expect(items[1]).toHaveAttribute('data-testid', 'todo-item-1'); // Later second
        });
    });

    describe('Edge Cases', () => {
        it('handles todo with missing optional fields', () => {
            const minimalTodo: ToDoItem = {
                id: 1,
                title: 'Minimal Todo',
                description: '',
                link: '',
                dueDate: '',
                isCompleted: false,
            };

            mockUseTodos.mockReturnValue({
                data: [minimalTodo],
                loading: false,
                error: null,
                refetch: mockRefetch,
            });

            render(<ToDoListWidget />);
            expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
        });

        it('handles todo with due date that needs slicing', () => {
            const todoWithFullDate: ToDoItem = {
                id: 1,
                title: 'Todo',
                description: '',
                link: '',
                dueDate: '2024-12-31T23:59:59.000Z',
                isCompleted: false,
            };

            mockUseTodos.mockReturnValue({
                data: [todoWithFullDate],
                loading: false,
                error: null,
                refetch: mockRefetch,
            });

            render(<ToDoListWidget />);

            const editButton = screen.getByTestId('todo-edit-button-1');
            fireEvent.click(editButton);

            // The date should be sliced to YYYY-MM-DD format
            expect(screen.getByTestId('todo-form-dialog')).toBeInTheDocument();
        });
    });
});

