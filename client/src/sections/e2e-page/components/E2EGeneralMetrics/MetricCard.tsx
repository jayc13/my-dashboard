import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { MetricCardProps } from './types';
import { calculateTrend, formatTrendLabel, getLabelsColors } from './utils';
import TrendChip from './TrendChip';

const MetricCard = ({ stat }: MetricCardProps) => {
    const trend = calculateTrend(stat.value, stat.prevValue);
    const trendLabel = formatTrendLabel(stat.value, stat.prevValue, trend, stat.formattedValue);
    const trendColor = getLabelsColors(trend, stat.inverseTrend);
    const hasPreviousValue = stat.prevValue !== undefined;

    return (
        <Card variant="outlined" sx={{ height: '100%', flexGrow: 1, borderRadius: 4 }}>
            <CardContent sx={{ padding: 4 }}>
                <Stack
                    direction="column"
                    sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 0 }}
                >
                    <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <Typography component="h2" variant="h6" color="text.secondary">
                            <strong>{stat.label}</strong>
                        </Typography>
                        {hasPreviousValue && (
                            <TrendChip
                                trend={trend}
                                trendLabel={trendLabel}
                                color={trendColor}
                            />
                        )}
                    </Stack>
                    <Typography variant="h4" component="p">
                        {stat.formattedValue ? stat.formattedValue(stat.value) : stat.value}
                    </Typography>
                </Stack>
                {hasPreviousValue && (
                    <>
                        <Divider sx={{ my: 2 }}/>
                        <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                vs last 14 days
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                <strong>
                                    {stat.formattedValue 
                                        ? stat.formattedValue(stat.prevValue!)
                                        : stat.prevValue}
                                </strong>
                            </Typography>
                        </Stack>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default MetricCard;

