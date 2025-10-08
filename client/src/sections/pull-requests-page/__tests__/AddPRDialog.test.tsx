import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddPRDialog from '../components/AddPRDialog';

describe('AddPRDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();
  const mockOnUrlChange = vi.fn();

  const defaultProps = {
    open: true,
    url: '',
    urlError: null,
    isAdding: false,
    onClose: mockOnClose,
    onAdd: mockOnAdd,
    onUrlChange: mockOnUrlChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(<AddPRDialog {...defaultProps} />);
    expect(screen.getByTestId('add-pr-dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Pull Request')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AddPRDialog {...defaultProps} open={false} />);
    expect(screen.queryByTestId('add-pr-dialog')).not.toBeInTheDocument();
  });

  it('renders URL input field', () => {
    render(<AddPRDialog {...defaultProps} />);
    const input = screen.getByTestId('pr-url-input');
    expect(input).toBeInTheDocument();
  });

  it('displays URL error when present', () => {
    const propsWithError = {
      ...defaultProps,
      urlError: 'Invalid URL format',
    };
    render(<AddPRDialog {...propsWithError} />);
    expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
  });

  it('calls onUrlChange when URL is changed', () => {
    render(<AddPRDialog {...defaultProps} />);
    const input = screen.getByTestId('pr-url-input').querySelector('input');
    fireEvent.change(input!, { target: { value: 'https://github.com/org/repo/pull/123' } });
    expect(mockOnUrlChange).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<AddPRDialog {...defaultProps} />);
    const cancelButton = screen.getByTestId('pr-cancel-button');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onAdd when add button is clicked', () => {
    const propsWithUrl = {
      ...defaultProps,
      url: 'https://github.com/org/repo/pull/123',
    };
    render(<AddPRDialog {...propsWithUrl} />);
    const addButton = screen.getByTestId('pr-add-button');
    fireEvent.click(addButton);
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it('disables add button when URL is empty', () => {
    render(<AddPRDialog {...defaultProps} />);
    const addButton = screen.getByTestId('pr-add-button');
    expect(addButton).toBeDisabled();
  });

  it('disables buttons when adding', () => {
    const propsAdding = {
      ...defaultProps,
      url: 'https://github.com/org/repo/pull/123',
      isAdding: true,
    };
    render(<AddPRDialog {...propsAdding} />);
    expect(screen.getByTestId('pr-cancel-button')).toBeDisabled();
    expect(screen.getByTestId('pr-add-button')).toBeDisabled();
  });
});
