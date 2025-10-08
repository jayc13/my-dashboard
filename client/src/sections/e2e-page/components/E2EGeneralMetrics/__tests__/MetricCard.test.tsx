import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricCard from '../MetricCard';
import type { MetricCardProps } from '../types';

describe('MetricCard', () => {
  it('renders metric label and value', () => {
    const stat: MetricCardProps['stat'] = {
      label: 'Total Tests',
      value: 100,
      hasTrend: false,
    };

    render(<MetricCard stat={stat} />);
    expect(screen.getByText('Total Tests')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders formatted value when formattedValue function is provided', () => {
    const stat: MetricCardProps['stat'] = {
      label: 'Duration',
      value: 3600,
      hasTrend: false,
      formattedValue: val => `${val}s`,
    };

    render(<MetricCard stat={stat} />);
    expect(screen.getByText('3600s')).toBeInTheDocument();
  });

  it('renders trend chip when prevValue is provided', () => {
    const stat: MetricCardProps['stat'] = {
      label: 'Pass Rate',
      value: 95,
      prevValue: 90,
      hasTrend: true,
    };

    render(<MetricCard stat={stat} />);
    expect(screen.getByText('vs last 14 days')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('does not render trend chip when prevValue is not provided', () => {
    const stat: MetricCardProps['stat'] = {
      label: 'Total Tests',
      value: 100,
      hasTrend: false,
    };

    render(<MetricCard stat={stat} />);
    expect(screen.queryByText('vs last 14 days')).not.toBeInTheDocument();
  });

  it('renders formatted prevValue when formattedValue function is provided', () => {
    const stat: MetricCardProps['stat'] = {
      label: 'Duration',
      value: 3600,
      prevValue: 3000,
      hasTrend: true,
      formattedValue: val => `${val}s`,
    };

    render(<MetricCard stat={stat} />);
    expect(screen.getByText('3000s')).toBeInTheDocument();
  });

  it('handles inverse trend', () => {
    const stat: MetricCardProps['stat'] = {
      label: 'Failed Tests',
      value: 5,
      prevValue: 10,
      hasTrend: true,
      inverseTrend: true,
    };

    render(<MetricCard stat={stat} />);
    expect(screen.getByText('Failed Tests')).toBeInTheDocument();
  });
});
