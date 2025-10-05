import type { E2EReportSummary } from '@my-dashboard/types';
import type { ChipColor, MetricStat, TrendDirection } from './types';

export const getLabelsColors = (trend: TrendDirection, inverseTrend: boolean = false): ChipColor => {
    switch (trend) {
        case 'up':
            return inverseTrend ? 'error' : 'success';
        case 'down':
            return inverseTrend ? 'success' : 'error';
        default:
            return 'default';
    }
};

export const getTrendDirection = (trendValue: number): TrendDirection => {
    if (trendValue > 0) {
return 'up';
}
    if (trendValue < 0) {
return 'down';
}
    return 'neutral';
};

export const getStats = (data?: E2EReportSummary, prevData?: E2EReportSummary): MetricStat[] => {
    if (!data) {
        return [];
    }

    return [
        {
            label: 'Total Runs',
            value: data.totalRuns,
            prevValue: prevData?.totalRuns,
            hasTrend: false,
        },
        {
            label: 'Passed',
            value: data.passedRuns,
            prevValue: prevData?.passedRuns,
            hasTrend: false,
        },
        {
            label: 'Failed',
            value: data.failedRuns,
            prevValue: prevData?.failedRuns,
            hasTrend: false,
            inverseTrend: true,
        },
        {
            label: 'Passing Rate',
            value: data.successRate,
            prevValue: prevData?.successRate,
            hasTrend: true,
            formattedValue: (value: number) => Math.abs(value * 100).toFixed(2) + '%',
        },
    ];
};

export const calculateTrend = (currentValue: number, previousValue?: number): TrendDirection => {
    if (previousValue === undefined) {
        return 'neutral';
    }

    const trendValue = currentValue - previousValue;
    return getTrendDirection(trendValue);
};

export const formatTrendLabel = (
    currentValue: number,
    previousValue: number | undefined,
    trend: TrendDirection,
    formattedValue?: (value: number) => string,
): string => {
    if (previousValue === undefined) {
        return '';
    }

    const trendValue = currentValue - previousValue;
    const sign = trend === 'up' ? '+' : '-';
    const formattedTrendValue = formattedValue
        ? formattedValue(trendValue)
        : Math.abs(trendValue).toString();

    return `${sign}${formattedTrendValue}`;
};

