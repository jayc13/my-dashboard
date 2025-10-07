import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoQuickAdd } from '../TodoQuickAdd';

describe('TodoQuickAdd', () => {
    const mockOnChange = vi.fn();
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnSubmit.mockImplementation((e) => e.preventDefault());
    });

    it('renders quick add form', () => {
        render(
            <TodoQuickAdd
                value=""
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        expect(screen.getByTestId('todo-quick-add-form')).toBeInTheDocument();
        expect(screen.getByTestId('todo-quick-add-input')).toBeInTheDocument();
        expect(screen.getByTestId('todo-quick-add-button')).toBeInTheDocument();
    });

    it('displays input value', () => {
        render(
            <TodoQuickAdd
                value="Test Todo"
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const input = screen.getByTestId('todo-quick-add-input').querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('Test Todo');
    });

    it('displays empty input', () => {
        render(
            <TodoQuickAdd
                value=""
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const input = screen.getByTestId('todo-quick-add-input').querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('');
    });

    it('calls onChange when input value changes', () => {
        render(
            <TodoQuickAdd
                value=""
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const input = screen.getByTestId('todo-quick-add-input').querySelector('input')!;
        fireEvent.change(input, { target: { value: 'New Todo' } });

        expect(mockOnChange).toHaveBeenCalledWith('New Todo');
    });

    it('calls onSubmit when form is submitted', () => {
        render(
            <TodoQuickAdd
                value="Test Todo"
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const form = screen.getByTestId('todo-quick-add-form');
        fireEvent.submit(form);

        expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('calls onSubmit when button is clicked', () => {
        render(
            <TodoQuickAdd
                value="Test Todo"
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const button = screen.getByTestId('todo-quick-add-button');
        fireEvent.click(button);

        expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('disables button when value is empty', () => {
        render(
            <TodoQuickAdd
                value=""
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const button = screen.getByTestId('todo-quick-add-button') as HTMLButtonElement;
        expect(button.disabled).toBe(true);
    });

    it('disables button when value is only whitespace', () => {
        render(
            <TodoQuickAdd
                value="   "
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const button = screen.getByTestId('todo-quick-add-button') as HTMLButtonElement;
        expect(button.disabled).toBe(true);
    });

    it('enables button when value has content', () => {
        render(
            <TodoQuickAdd
                value="Test Todo"
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const button = screen.getByTestId('todo-quick-add-button') as HTMLButtonElement;
        expect(button.disabled).toBe(false);
    });

    it('disables button when isCreating is true', () => {
        render(
            <TodoQuickAdd
                value="Test Todo"
                isCreating={true}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const button = screen.getByTestId('todo-quick-add-button') as HTMLButtonElement;
        expect(button.disabled).toBe(true);
    });

    it('disables button when both value is empty and isCreating is true', () => {
        render(
            <TodoQuickAdd
                value=""
                isCreating={true}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const button = screen.getByTestId('todo-quick-add-button') as HTMLButtonElement;
        expect(button.disabled).toBe(true);
    });

    it('input field is required', () => {
        render(
            <TodoQuickAdd
                value=""
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const input = screen.getByTestId('todo-quick-add-input').querySelector('input') as HTMLInputElement;
        expect(input.required).toBe(true);
    });

    it('renders add icon in button', () => {
        render(
            <TodoQuickAdd
                value="Test Todo"
                isCreating={false}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />,
        );

        const button = screen.getByTestId('todo-quick-add-button');
        expect(button.querySelector('svg')).toBeInTheDocument();
    });
});

