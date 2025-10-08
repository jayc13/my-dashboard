import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AppsHeader from '../AppsHeader';

describe('AppsHeader', () => {
  it('renders the add button', () => {
    const mockOnAddClick = vi.fn();
    render(<AppsHeader onAddClick={mockOnAddClick} />);

    expect(screen.getByTestId('add-app-button')).toBeInTheDocument();
    expect(screen.getByText('Add App')).toBeInTheDocument();
  });

  it('calls onAddClick when button is clicked', () => {
    const mockOnAddClick = vi.fn();
    render(<AppsHeader onAddClick={mockOnAddClick} />);

    const button = screen.getByTestId('add-app-button');
    fireEvent.click(button);

    expect(mockOnAddClick).toHaveBeenCalledTimes(1);
  });
});
