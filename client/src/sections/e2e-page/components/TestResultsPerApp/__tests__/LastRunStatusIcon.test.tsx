import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LastRunStatusIcon from '../LastRunStatusIcon';
import type { DetailedE2EReportDetail } from '@my-dashboard/types';

describe('LastRunStatusIcon', () => {
  const createMockResult = (
    status: 'passed' | 'failed' | 'running' | 'pending' | 'success' | 'unknown',
  ): DetailedE2EReportDetail => ({
    id: 1,
    reportSummaryId: 1,
    appId: 1,
    totalRuns: 10,
    passedRuns: status === 'passed' || status === 'success' ? 10 : 5,
    failedRuns: status === 'failed' ? 5 : 0,
    successRate: status === 'passed' || status === 'success' ? 100 : 50,
    lastRunStatus: status as any,
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
      lastRun: {
        status: status as any,
        id: 0,
        url: '',
        pipelineId: '',
        createdAt: '',
      },
    },
  });

  it('renders passed icon', () => {
    const result = createMockResult('passed');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    // Check for the title prop passed to the wrapper element
    const wrapper = container.querySelector('[title="Passed"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders failed icon', () => {
    const result = createMockResult('failed');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    const wrapper = container.querySelector('[title="Failed"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders running icon with animation', () => {
    const result = createMockResult('running');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    const wrapper = container.querySelector('[title="Running"]');
    expect(wrapper).toBeInTheDocument();
    // Check for the animated wrapper
    const animatedBox = container.querySelector('span');
    expect(animatedBox).toBeInTheDocument();
  });

  it('renders pending icon', () => {
    const result = createMockResult('pending');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    const wrapper = container.querySelector('[title="Pending"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders success icon (alias for passed)', () => {
    const result = createMockResult('success');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    const wrapper = container.querySelector('[title="Passed"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders unknown icon for unrecognized status', () => {
    const result = createMockResult('unknown');
    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    const wrapper = container.querySelector('[title="Unknown"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('uses app.lastRun.status when available', () => {
    const result: DetailedE2EReportDetail = {
      id: 1,
      reportSummaryId: 1,
      appId: 1,
      totalRuns: 10,
      passedRuns: 10,
      failedRuns: 0,
      successRate: 100,
      lastRunStatus: 'failed', // This should be overridden
      lastFailedRunAt: null,
      lastRunAt: '2024-01-01T00:00:00Z',
      app: {
        id: 1,
        name: 'Test App',
        code: 'test-app',
        pipelineUrl: '',
        e2eTriggerConfiguration: '',
        watching: false,
        e2eRunsQuantity: 10,
        lastRun: {
          status: 'passed',
          id: 0,
          url: '',
          pipelineId: '',
          createdAt: '',
        },
      },
    };

    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    const wrapper = container.querySelector('[title="Passed"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('falls back to lastRunStatus when app.lastRun.status is not available', () => {
    const result: DetailedE2EReportDetail = {
      id: 1,
      reportSummaryId: 1,
      appId: 1,
      totalRuns: 10,
      passedRuns: 0,
      failedRuns: 10,
      successRate: 0,
      lastRunStatus: 'failed',
      lastFailedRunAt: '2024-01-01T00:00:00Z',
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
    };

    const { container } = render(<LastRunStatusIcon result={result} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    const wrapper = container.querySelector('[title="Failed"]');
    expect(wrapper).toBeInTheDocument();
  });
});
