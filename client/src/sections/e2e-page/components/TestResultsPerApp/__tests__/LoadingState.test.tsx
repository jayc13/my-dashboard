import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingState from '../LoadingState';

describe('LoadingState', () => {
  it('renders loading skeletons', () => {
    const { container } = render(<LoadingState />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders multiple skeleton items', () => {
    const { container } = render(<LoadingState />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    // Should render PAGE_SIZE number of skeletons
    expect(skeletons.length).toBeGreaterThan(1);
  });
});
