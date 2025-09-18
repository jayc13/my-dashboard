import useSWR from 'swr';
import { API_BASE_URL } from '../utils/constants';
import TestResultsPerApp from '../components/widgets/TestResultsPerApp';
import E2EGeneralMetrics from '../components/widgets/E2EGeneralMetrics';
import { Alert, Card, Grid, Stack, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';


const E2EPage = () => {

    const {
        data: testResultReports,
        isLoading: isLoadingTestResultReport,
        error: errorTestResultReport,
        mutate: mutateTestResultReport,
    } = useSWR(`${API_BASE_URL}/api/e2e_reports`);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const {
        data: lastTestResultReports,
        error: errorLastTestResultReport,
        mutate: mutateLastTestResultReport,
    } = useSWR(`${API_BASE_URL}/api/e2e_reports?reportDate=${yesterday.toISOString().split('T')[0]}`);

    const thereIsError: boolean = errorLastTestResultReport || errorTestResultReport;

    if (thereIsError) {
        return <Card style={{ padding: 24, marginTop: 16 }}>
            <Alert severity="error">Error fetching information</Alert>
        </Card>;
    }

    return <Grid container spacing={4} data-testid="e2e-page">
        <Grid size={{ xs: 12 }}>
            <Stack direction="column" alignItems="left" width="100%">
                <Grid
                    container
                    direction="row"
                    sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <h2>E2E Tests</h2>
                    <Tooltip title="Refresh">
                        <IconButton
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => {
                                mutateTestResultReport().then();
                                mutateLastTestResultReport().then();
                            }}
                        >
                            <RefreshIcon/>
                        </IconButton>
                    </Tooltip>
                </Grid>
                <E2EGeneralMetrics
                    data={testResultReports}
                    prevData={lastTestResultReports}
                    isLoading={isLoadingTestResultReport}
                />
                <TestResultsPerApp data={testResultReports} isLoading={isLoadingTestResultReport} refetchData={mutateTestResultReport}/>
            </Stack>
        </Grid>
    </Grid>;
};

export default E2EPage;
