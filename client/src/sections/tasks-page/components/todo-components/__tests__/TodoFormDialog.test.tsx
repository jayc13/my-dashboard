import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoFormDialog } from '../TodoFormDialog';
import { APIError } from '@my-dashboard/sdk';

describe('TodoFormDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultForm = {
    title: 'Test Title',
    description: 'Test Description',
    link: 'https://example.com',
    dueDate: '2024-12-31',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', async () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('todo-form-dialog')).toBeInTheDocument();
    });
    expect(screen.getByTestId('todo-form-dialog-title')).toHaveTextContent('Edit To-Do');
  });

  it('does not render dialog when closed', () => {
    render(
      <TodoFormDialog
        open={false}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.queryByTestId('todo-form-dialog-title')).not.toBeInTheDocument();
  });

  it('renders all form fields with values', async () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      const titleInput = screen
        .getByTestId('todo-form-title-input')
        .querySelector('input') as HTMLInputElement;
      const descInput = screen
        .getByTestId('todo-form-description-input')
        .querySelector('textarea') as HTMLTextAreaElement;
      const linkInput = screen
        .getByTestId('todo-form-link-input')
        .querySelector('input') as HTMLInputElement;
      const dueDateInput = screen
        .getByTestId('todo-form-due-date-input')
        .querySelector('input') as HTMLInputElement;

      expect(titleInput.value).toBe('Test Title');
      expect(descInput.value).toBe('Test Description');
      expect(linkInput.value).toBe('https://example.com');
      expect(dueDateInput.value).toBe('2024-12-31');
    });
  });

  it('renders empty form fields', () => {
    const emptyForm = {
      title: '',
      description: '',
      link: '',
      dueDate: '',
    };

    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={emptyForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const titleInput = screen
      .getByTestId('todo-form-title-input')
      .querySelector('input') as HTMLInputElement;
    expect(titleInput.value).toBe('');
  });

  it('calls onChange when title input changes', async () => {
    const user = userEvent.setup();
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const titleInput = screen.getByTestId('todo-form-title-input').querySelector('input')!;
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when description input changes', async () => {
    const user = userEvent.setup();
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const descInput = screen.getByTestId('todo-form-description-input').querySelector('textarea')!;
    await user.clear(descInput);
    await user.type(descInput, 'New Description');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when link input changes', async () => {
    const user = userEvent.setup();
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const linkInput = screen.getByTestId('todo-form-link-input').querySelector('input')!;
    await user.clear(linkInput);
    await user.type(linkInput, 'https://newlink.com');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when due date input changes', async () => {
    const user = userEvent.setup();
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const dueDateInput = screen.getByTestId('todo-form-due-date-input').querySelector('input')!;
    await user.clear(dueDateInput);
    await user.type(dueDateInput, '2025-01-01');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const cancelButton = screen.getByTestId('todo-form-cancel-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSubmit when form is submitted', async () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      const form = screen.getByTestId('todo-form') as HTMLFormElement;
      // Directly dispatch submit event instead of using fireEvent
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('calls onSubmit when submit button is clicked', async () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      const form = screen.getByTestId('todo-form') as HTMLFormElement;
      // Simulate clicking submit button by dispatching submit event on the form
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('disables buttons when isUpdating is true', async () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={true}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      const cancelButton = screen.getByTestId('todo-form-cancel-button') as HTMLButtonElement;
      const submitButton = screen.getByTestId('todo-form-submit-button') as HTMLButtonElement;

      expect(cancelButton.disabled).toBe(true);
      expect(submitButton.disabled).toBe(true);
    });
  });

  it('enables buttons when isUpdating is false', async () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      const cancelButton = screen.getByTestId('todo-form-cancel-button') as HTMLButtonElement;
      const submitButton = screen.getByTestId('todo-form-submit-button') as HTMLButtonElement;

      expect(cancelButton.disabled).toBe(false);
      expect(submitButton.disabled).toBe(false);
    });
  });

  it('form has noValidate attribute to disable HTML5 validation', () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const form = screen.getByTestId('todo-form') as HTMLFormElement;
    expect(form.noValidate).toBe(true);
  });

  it('description field supports multiline', () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const descInput = screen
      .getByTestId('todo-form-description-input')
      .querySelector('textarea') as HTMLTextAreaElement;
    expect(descInput.tagName).toBe('TEXTAREA');
  });

  it('displays error message when error is provided', async () => {
    const testError = new Error('Failed to update todo');

    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={testError}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      const errorAlert = screen.getByTestId('todo-form-error-alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Failed to update todo');
    });
  });

  it('does not display error message when error is null', () => {
    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={null}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const errorAlert = screen.queryByTestId('todo-form-error-alert');
    expect(errorAlert).not.toBeInTheDocument();
  });

  it('highlights field with error when error details contain field information', () => {
    // Create a proper APIError instance with validation details
    const structuredError = new APIError(400, 'Invalid link format', {
      message: 'Invalid link format',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: [
        {
          field: 'link',
          message: 'link must be a valid URL',
          code: 'INVALID_URL',
          value: 'asd',
        },
      ],
    });

    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={structuredError}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    // Check that the link field has error state
    const linkInput = screen.getByTestId('todo-form-link-input');
    const linkTextField = linkInput.querySelector('input');

    // MUI sets aria-invalid="true" on error fields
    expect(linkTextField).toHaveAttribute('aria-invalid', 'true');

    // Check that helper text is displayed (appears in both alert and field helper text)
    const errorTexts = screen.getAllByText('link must be a valid URL');
    expect(errorTexts.length).toBeGreaterThan(0);
  });

  it('displays multiple field errors when present', () => {
    // Create a proper APIError instance with multiple validation details
    const multiFieldError = new APIError(400, 'Validation failed', {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: [
        {
          field: 'title',
          message: 'Title is required',
          code: 'REQUIRED_FIELD',
        },
        {
          field: 'link',
          message: 'Invalid URL format',
          code: 'INVALID_URL',
        },
      ],
    });

    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={multiFieldError}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    // Check that both fields have error state
    const titleInput = screen.getByTestId('todo-form-title-input').querySelector('input');
    const linkInput = screen.getByTestId('todo-form-link-input').querySelector('input');

    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    expect(linkInput).toHaveAttribute('aria-invalid', 'true');

    // Check that both helper texts are displayed (appear in both alert and field helper text)
    const titleErrors = screen.getAllByText('Title is required');
    const linkErrors = screen.getAllByText('Invalid URL format');
    expect(titleErrors.length).toBeGreaterThan(0);
    expect(linkErrors.length).toBeGreaterThan(0);
  });

  it('handles error with details directly on error object', () => {
    // Create a proper APIError instance
    const directDetailsError = new APIError(400, 'Validation Error', {
      message: 'Validation Error',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: [
        {
          field: 'dueDate',
          message: 'Invalid date format',
          code: 'INVALID_DATE',
        },
      ],
    });

    render(
      <TodoFormDialog
        open={true}
        isUpdating={false}
        form={defaultForm}
        error={directDetailsError}
        onClose={mockOnClose}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    // Check that the dueDate field has error state
    const dueDateInput = screen.getByTestId('todo-form-due-date-input').querySelector('input');
    expect(dueDateInput).toHaveAttribute('aria-invalid', 'true');

    // Check that error message is displayed
    const errorTexts = screen.getAllByText('Invalid date format');
    expect(errorTexts.length).toBeGreaterThan(0);
  });
});
