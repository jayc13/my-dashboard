import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LastRunStatusIcon from '../LastRunStatusIcon';
import type { DetailedE2EReportDetail } from '@my-dashboard/types';

describe('LastRunStatusIcon', () => {
  const createMockResult = (status: 'passed' | 'failed'): DetailedE2EReportDetail => ({
    id: 1,
    reportSummaryId: 1,
    appId: 1,
    totalRuns: 10,
    passedRuns: status === 'passed' ? 10 : 5,
    failedRuns: status === 'failed' ? 5 : 0,
    successRate: status === 'passed' ? 100 : 50,
    lastRunStatus: status,
    lastFailedRunAt: status === 'failed' ? '2024-01-01T00:00:00Z' : null,
    lastRunAt: '2024-01-01T00:00:00Z',
    app: {
      id: 1,
      name: 'Test App',
      code: 'test-app',
      pipelineUrl: '',
      e2eTriggerConfiguration: '',
      watching: false,
      e2eRunsQuantity: 10,
    },
  });

  it('renders passed icon', () => {
    const result = createMockResult('passed');
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
});
