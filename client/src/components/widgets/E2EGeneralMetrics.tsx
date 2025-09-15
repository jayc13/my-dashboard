import { Card, CardContent, Chip, Divider, Grid, Skeleton, Stack, Typography } from '@mui/material';
import TrendDownIcon from '@mui/icons-material/TrendingDown';
import TrendUpIcon from '@mui/icons-material/TrendingUp';

interface TestResult {
    projectName: string;
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    successRate: number;
}

interface E2EGeneralMetricsProps {
    data: TestResult[];
    prevData: TestResult[];
    isLoading?: boolean;
}

const parseTestResult = (results: TestResult[]) => {
    const passedRuns = results.reduce((acc, entry) => acc + entry.passedRuns, 0);
    const failedRuns = results.reduce((acc, entry) => acc + entry.failedRuns, 0);
    const totalRuns = passedRuns + failedRuns;
    const passingRate = totalRuns > 0 ? (passedRuns / totalRuns) * 100 : 0;
    return {
        totalRuns,
        passedRuns,
        failedRuns,
        passingRate,
    };
};

const getLabelsColors = (trend: string, inverseTrend: boolean = false): 'success' | 'error' | 'default' | 'primary' | 'secondary' | 'info' | 'warning' => {
    switch (trend) {
        case 'up':
            return inverseTrend ? 'error' : 'success';
        case 'down':
            return inverseTrend ? 'success' : 'error';
        default:
            return 'default';
    }
};

const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
        return <TrendUpIcon/>;
    } else {
        return <TrendDownIcon/>;
    }
};

const E2EGeneralMetrics = (props: E2EGeneralMetricsProps) => {
    const {
        data = [],
        prevData = [],
        isLoading = false,
    } = props;

    const actualParsedResults = parseTestResult(data);
    const prevParsedResults = parseTestResult(prevData);

    const stats = [
        {
            label: 'Total Runs',
            value: actualParsedResults.totalRuns,
            prevValue: prevParsedResults.totalRuns,
            hasTrend: false,
        },
        {
            label: 'Passed',
            value: actualParsedResults.passedRuns,
            prevValue: prevParsedResults.passedRuns,
            hasTrend: false,
        },
        {
            label: 'Failed',
            value: actualParsedResults.failedRuns,
            prevValue: prevParsedResults.failedRuns,
            hasTrend: false,
            inverseTrend: true,
        },
        {
            label: 'Passing Rate',
            value: actualParsedResults.passingRate,
            prevValue: prevParsedResults.passingRate,
            hasTrend: true,
            formattedValue: (value: number) => Math.abs(value).toFixed(2) + '%',
        },
    ];

    if (isLoading) {
        return (
            <Grid
                container
                direction="row"
                spacing={2}
                sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Skeleton variant="rounded" height={180}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Skeleton variant="rounded" height={180}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Skeleton variant="rounded" height={180}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Skeleton variant="rounded" height={180}/>
                </Grid>
            </Grid>
        );
    }

    return (<Grid
        container
        direction="row"
        spacing={2}
        sx={{
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        {stats.map((s) => {
            const trendValue = s.prevValue !== undefined ? (s.value - s.prevValue) : 0;

            const trend: string = trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'neutral';

            const trendLabel = `${trend === 'up' ? '+' : '-'}${s.formattedValue ? s.formattedValue(trendValue) : Math.abs(trendValue)}`;

            return <Grid key={s.label} size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
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
                                    <strong>{s.label}</strong>
                                </Typography>
                                {
                                    <Chip
                                        label={trendLabel}
                                        icon={getTrendIcon(trend)}
                                        color={getLabelsColors(trend, s.inverseTrend)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ marginBottom: 1 }}
                                    />
                                }
                            </Stack>
                            <Typography variant="h4" component="p">
                                {s.formattedValue ? s.formattedValue(s.value) : s.value}
                            </Typography>
                        </Stack>
                        <Divider sx={{ my: 2 }}/>
                        <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                vs last 14 days
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                <strong>{s.formattedValue ? s.formattedValue(s.prevValue) : s.prevValue}</strong>
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>;
        })}
    </Grid>);
};

export default E2EGeneralMetrics;