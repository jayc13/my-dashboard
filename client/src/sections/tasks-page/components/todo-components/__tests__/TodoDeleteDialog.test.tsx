import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoDeleteDialog } from '../TodoDeleteDialog';

describe('TodoDeleteDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <TodoDeleteDialog
        open={true}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByTestId('todo-delete-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('todo-delete-dialog-title')).toHaveTextContent('Delete To-Do');
    expect(screen.getByTestId('todo-delete-dialog-message')).toHaveTextContent(
      'Are you sure you want to delete this to-do item?',
    );
  });

  it('does not render dialog when closed', () => {
    render(
      <TodoDeleteDialog
        open={false}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.queryByTestId('todo-delete-dialog-title')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TodoDeleteDialog
        open={true}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = screen.getByTestId('todo-delete-cancel-button');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when delete button is clicked', () => {
    render(
      <TodoDeleteDialog
        open={true}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const deleteButton = screen.getByTestId('todo-delete-confirm-button');
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('disables buttons when isDeleting is true', () => {
    render(
      <TodoDeleteDialog
        open={true}
        isDeleting={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = screen.getByTestId('todo-delete-cancel-button') as HTMLButtonElement;
    const deleteButton = screen.getByTestId('todo-delete-confirm-button') as HTMLButtonElement;

    expect(cancelButton.disabled).toBe(true);
    expect(deleteButton.disabled).toBe(true);
  });

  it('enables buttons when isDeleting is false', () => {
    render(
      <TodoDeleteDialog
        open={true}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = screen.getByTestId('todo-delete-cancel-button') as HTMLButtonElement;
    const deleteButton = screen.getByTestId('todo-delete-confirm-button') as HTMLButtonElement;

    expect(cancelButton.disabled).toBe(false);
    expect(deleteButton.disabled).toBe(false);
  });

  it('renders cancel button with correct text', () => {
    render(
      <TodoDeleteDialog
        open={true}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = screen.getByTestId('todo-delete-cancel-button');
    expect(cancelButton).toHaveTextContent('Cancel');
  });

  it('renders delete button with correct text', () => {
    render(
      <TodoDeleteDialog
        open={true}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const deleteButton = screen.getByTestId('todo-delete-confirm-button');
    expect(deleteButton).toHaveTextContent('Delete');
  });

  it('does not call handlers when buttons are disabled', () => {
    render(
      <TodoDeleteDialog
        open={true}
        isDeleting={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = screen.getByTestId('todo-delete-cancel-button');
    const deleteButton = screen.getByTestId('todo-delete-confirm-button');

    fireEvent.click(cancelButton);
    fireEvent.click(deleteButton);

    // Buttons are disabled, so handlers should not be called
    expect(mockOnCancel).not.toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
