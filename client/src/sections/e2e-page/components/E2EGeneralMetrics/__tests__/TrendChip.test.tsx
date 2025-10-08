import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrendChip from '../TrendChip';

describe('TrendChip', () => {
  it('renders with up trend', () => {
    render(<TrendChip trend="up" trendLabel="+5%" color="success" />);
    expect(screen.getByText('+5%')).toBeInTheDocument();
    expect(screen.getByTestId('TrendingUpIcon')).toBeInTheDocument();
  });

  it('renders with down trend', () => {
    render(<TrendChip trend="down" trendLabel="-3%" color="error" />);
    expect(screen.getByText('-3%')).toBeInTheDocument();
    expect(screen.getByTestId('TrendingDownIcon')).toBeInTheDocument();
  });

  it('renders with different colors', () => {
    const { rerender } = render(<TrendChip trend="up" trendLabel="+10%" color="success" />);
    expect(screen.getByText('+10%')).toBeInTheDocument();

    rerender(<TrendChip trend="down" trendLabel="-5%" color="error" />);
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });
});
