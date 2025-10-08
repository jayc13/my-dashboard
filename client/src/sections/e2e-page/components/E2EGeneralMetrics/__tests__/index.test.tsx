import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import E2EGeneralMetrics from '../index';
import type { E2EReportSummary } from '@my-dashboard/types';

// Mock the child components
vi.mock('../MetricCard', () => ({
  default: ({ stat }: any) => <div data-testid="metric-card">{stat.label}</div>,
}));

vi.mock('../MetricsGrid', () => ({
  default: ({ children }: any) => <div data-testid="metrics-grid">{children}</div>,
}));

vi.mock('../MetricsGridItem', () => ({
  default: ({ children }: any) => <div data-testid="metrics-grid-item">{children}</div>,
}));

describe('E2EGeneralMetrics', () => {
  const mockData: E2EReportSummary = {
    id: 1,
    date: '2024-01-01',
    status: 'ready',
    totalRuns: 100,
    passedRuns: 95,
    failedRuns: 5,
    successRate: 95,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeletons when isLoading is true', () => {
    const { container } = render(<E2EGeneralMetrics data={mockData} isLoading={true} />);

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBe(4);
  });

  it('renders metric cards when data is provided', () => {
    render(<E2EGeneralMetrics data={mockData} isLoading={false} />);

    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
    const metricCards = screen.getAllByTestId('metric-card');
    expect(metricCards.length).toBeGreaterThan(0);
  });

  it('renders with undefined data', () => {
    render(<E2EGeneralMetrics data={undefined} isLoading={false} />);

    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
  });

  it('renders with prevData', () => {
    const prevData: E2EReportSummary = {
      id: 1,
      date: '2024-01-01',
      status: 'ready',
      totalRuns: 90,
      passedRuns: 85,
      failedRuns: 5,
      successRate: 94.4,
    };

    render(<E2EGeneralMetrics data={mockData} prevData={prevData} isLoading={false} />);

    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
  });
});
