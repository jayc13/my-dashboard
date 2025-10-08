import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LastRunStatusIcon from '../LastRunStatusIcon';
import type { DetailedE2EReportDetail } from '@my-dashboard/types';

describe('LastRunStatusIcon', () => {
  const createMockResult = (status: string): DetailedE2EReportDetail => ({
    app: {
      id: 1,
      name: 'Test App',
      code: 'test-app',
      lastRun: {
        status,
        timestamp: '2024-01-01T00:00:00Z',
      },
    },
    lastRunStatus: status,
    tests: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
  });

  it('renders running icon', () => {
    const result = createMockResult('running');
    const { container } = render(<LastRunStatusIcon result={result} />);
    expect(container.querySelector('.spin')).toBeInTheDocument();
  });

  it('renders passed icon', () => {
    const result = createMockResult('passed');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders success icon', () => {
    const result = createMockResult('success');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders failed icon', () => {
    const result = createMockResult('failed');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders pending icon', () => {
    const result = createMockResult('pending');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders unknown icon for unrecognized status', () => {
    const result = createMockResult('unknown');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('uses lastRunStatus when app.lastRun is not available', () => {
    const result: DetailedE2EReportDetail = {
      lastRunStatus: 'passed',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
    };
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
