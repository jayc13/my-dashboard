import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingBackdrop from '../LoadingBackdrop';
import type { DetailedE2EReport } from '@my-dashboard/types';

describe('LoadingBackdrop', () => {
  const mockData: DetailedE2EReport = {
    summary: {
      id: 1,
      date: '2024-01-01',
      status: 'pending',
      totalRuns: 10,
      passedRuns: 0,
      failedRuns: 0,
      successRate: 0,
    },
    message: 'Running tests...',
    details: [],
  };

  it('renders backdrop open when loading and data status is pending', () => {
    const { container } = render(<LoadingBackdrop data={mockData} loading={true} />);
    expect(screen.getByText('Running tests...')).toBeInTheDocument();
    const backdrop = container.querySelector('.MuiBackdrop-root');
    expect(backdrop).not.toHaveStyle({ visibility: 'hidden' });
  });

  it('renders backdrop closed when not loading', () => {
    const { container } = render(<LoadingBackdrop data={mockData} loading={false} />);
    const backdrop = container.querySelector('.MuiBackdrop-root');
    expect(backdrop).toHaveStyle({ visibility: 'hidden' });
  });

  it('renders backdrop closed when data is null', () => {
    const { container } = render(<LoadingBackdrop data={null} loading={true} />);
    const backdrop = container.querySelector('.MuiBackdrop-root');
    expect(backdrop).toHaveStyle({ visibility: 'hidden' });
  });

  it('shows default message when no message in data', () => {
    const dataWithoutMessage: DetailedE2EReport = {
      ...mockData,
      message: undefined,
    };
    render(<LoadingBackdrop data={dataWithoutMessage} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders backdrop closed when status is not pending', () => {
    const completedData: DetailedE2EReport = {
      ...mockData,
      summary: {
        ...mockData.summary,
        status: 'ready',
      },
    };
    const { container } = render(<LoadingBackdrop data={completedData} loading={true} />);
    const backdrop = container.querySelector('.MuiBackdrop-root');
    expect(backdrop).toHaveStyle({ visibility: 'hidden' });
  });
});
