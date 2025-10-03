import type { E2EReportSummary } from '@my-dashboard/types';

export interface E2EGeneralMetricsProps {
    data?: E2EReportSummary;
    prevData?: E2EReportSummary;
    isLoading?: boolean;
}

export interface MetricStat {
    label: string;
    value: number;
    prevValue?: number;
    hasTrend: boolean;
    inverseTrend?: boolean;
    formattedValue?: (value: number) => string;
}

export interface MetricCardProps {
    stat: MetricStat;
}

export type TrendDirection = 'up' | 'down' | 'neutral';

export type ChipColor = 'success' | 'error' | 'default' | 'primary' | 'secondary' | 'info' | 'warning';

