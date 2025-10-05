import MetricCard from './MetricCard';
import MetricsGrid from './MetricsGrid';
import MetricsGridItem from './MetricsGridItem';
import type { E2EGeneralMetricsProps } from './types';
import { getStats } from './utils';
import { Skeleton } from '@mui/material';

const E2EGeneralMetrics = (props: E2EGeneralMetricsProps) => {
    const {
        data,
        prevData,
        isLoading = false,
    } = props;

    const stats = getStats(data, prevData);

    if (isLoading) {
        return (
            <MetricsGrid>
                {[1, 2, 3, 4].map((index) => (
                    <MetricsGridItem key={index}>
                        <Skeleton variant="rounded" height={180}/>
                    </MetricsGridItem>
                ))}
            </MetricsGrid>
        );
    }

    return (
        <MetricsGrid>
            {stats.map((stat) => (
                <MetricsGridItem key={stat.label}>
                    <MetricCard stat={stat} />
                </MetricsGridItem>
            ))}
        </MetricsGrid>
    );
};

export default E2EGeneralMetrics;

