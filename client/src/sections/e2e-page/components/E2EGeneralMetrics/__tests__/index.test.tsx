import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import E2EGeneralMetrics from '../index';
import type { DetailedE2EReport } from '@my-dashboard/types';

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
  const mockData: DetailedE2EReport = {
    summary: {
      status: 'passed',
      totalTests: 100,
      passedTests: 95,
      failedTests: 5,
      skippedTests: 0,
      duration: 1000,
    },
    message: 'Tests completed',
    projects: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeletons when isLoading is true', () => {
    const { container } = render(
      <E2EGeneralMetrics data={mockData} prevData={null} isLoading={true} />,
    );

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBe(4);
  });

  it('renders metric cards when data is provided', () => {
    render(<E2EGeneralMetrics data={mockData} prevData={null} isLoading={false} />);

    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
    const metricCards = screen.getAllByTestId('metric-card');
    expect(metricCards.length).toBeGreaterThan(0);
  });

  it('renders with null data', () => {
    render(<E2EGeneralMetrics data={null} prevData={null} isLoading={false} />);

    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
  });

  it('renders with prevData', () => {
    const prevData: DetailedE2EReport = {
      summary: {
        status: 'passed',
        totalTests: 90,
        passedTests: 85,
        failedTests: 5,
        skippedTests: 0,
        duration: 900,
      },
      message: 'Tests completed',
      projects: [],
    };

    render(<E2EGeneralMetrics data={mockData} prevData={prevData} isLoading={false} />);

    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
  });
});
