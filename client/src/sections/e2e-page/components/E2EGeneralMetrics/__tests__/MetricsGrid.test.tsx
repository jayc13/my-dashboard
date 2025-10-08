import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricsGrid from '../MetricsGrid';

describe('MetricsGrid', () => {
  it('renders children', () => {
    render(
      <MetricsGrid>
        <div>Metric 1</div>
      </MetricsGrid>,
    );
    expect(screen.getByText('Metric 1')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <MetricsGrid>
        <div>Metric 1</div>
        <div>Metric 2</div>
        <div>Metric 3</div>
      </MetricsGrid>,
    );
    expect(screen.getByText('Metric 1')).toBeInTheDocument();
    expect(screen.getByText('Metric 2')).toBeInTheDocument();
    expect(screen.getByText('Metric 3')).toBeInTheDocument();
  });
});
