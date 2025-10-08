import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoEmptyState } from '../TodoEmptyState';

describe('TodoEmptyState', () => {
  it('renders the empty state with title', () => {
    render(<TodoEmptyState />);
    expect(screen.getByText('No To-Dos yet')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<TodoEmptyState />);
    expect(screen.getByText(/Start organizing your work/i)).toBeInTheDocument();
  });

  it('renders all feature items', () => {
    render(<TodoEmptyState />);

    // Check for feature descriptions
    expect(screen.getByText(/Track Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Set Deadlines/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay Organized/i)).toBeInTheDocument();
  });

  it('renders icons', () => {
    const { container } = render(<TodoEmptyState />);

    // Check that SVG icons are rendered
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
