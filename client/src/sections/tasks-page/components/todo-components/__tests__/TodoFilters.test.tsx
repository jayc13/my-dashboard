import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoFilters } from '../TodoFilters';

describe('TodoFilters', () => {
  const mockOnFilterChange = vi.fn();

  const defaultProps = {
    filterType: 'all' as const,
    onFilterChange: mockOnFilterChange,
    overdueCount: 2,
    dueSoonCount: 3,
    dueTodayCount: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter buttons', () => {
    render(<TodoFilters {...defaultProps} />);

    expect(screen.getByText(/All/i)).toBeInTheDocument();
    expect(screen.getByText(/Overdue/i)).toBeInTheDocument();
    expect(screen.getByText(/Due Soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Today/i)).toBeInTheDocument();
  });

  it('displays correct counts for each filter', () => {
    render(<TodoFilters {...defaultProps} />);

    expect(screen.getByText('2')).toBeInTheDocument(); // overdue count
    expect(screen.getByText('3')).toBeInTheDocument(); // due soon count
    expect(screen.getByText('1')).toBeInTheDocument(); // today count
  });

  it('calls onFilterChange when a filter is clicked', () => {
    render(<TodoFilters {...defaultProps} />);

    const overdueButton = screen.getByText(/Overdue/i).closest('button');
    if (overdueButton) {
      fireEvent.click(overdueButton);
      expect(mockOnFilterChange).toHaveBeenCalledWith('overdue');
    }
  });

  it('highlights the selected filter', () => {
    render(<TodoFilters {...defaultProps} filterType="overdue" />);

    const overdueButton = screen.getByText(/Overdue/i).closest('button');
    expect(overdueButton).toHaveClass('Mui-selected');
  });

  it('does not call onFilterChange when clicking the already selected filter', () => {
    render(<TodoFilters {...defaultProps} filterType="all" />);

    const allButton = screen.getByText(/All/i).closest('button');
    if (allButton) {
      fireEvent.click(allButton);
      // The onChange handler receives null when clicking the same button
      // and our component ignores null values
      expect(mockOnFilterChange).not.toHaveBeenCalled();
    }
  });

  it('changes filter to due-soon', () => {
    render(<TodoFilters {...defaultProps} />);

    const dueSoonButton = screen.getByText(/Due Soon/i).closest('button');
    if (dueSoonButton) {
      fireEvent.click(dueSoonButton);
      expect(mockOnFilterChange).toHaveBeenCalledWith('due-soon');
    }
  });

  it('changes filter to today', () => {
    render(<TodoFilters {...defaultProps} />);

    const todayButton = screen.getByText(/Today/i).closest('button');
    if (todayButton) {
      fireEvent.click(todayButton);
      expect(mockOnFilterChange).toHaveBeenCalledWith('today');
    }
  });

  it('renders with zero counts', () => {
    render(<TodoFilters {...defaultProps} overdueCount={0} dueSoonCount={0} dueTodayCount={0} />);

    // When counts are 0, they are not displayed (only shown when > 0)
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
