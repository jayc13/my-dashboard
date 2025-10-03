import TestResultsPerApp from '@/sections/e2e-page/components/TestResultsPerApp';
import E2EGeneralMetrics from './components/E2EGeneralMetrics';
import LoadingBackdrop from './components/LoadingBackdrop.tsx';
import { TooltipIconButton } from '@/components/common';
import { Alert, Card, Grid, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { DetailedE2EReport } from '@my-dashboard/types';

interface E2EPageProps {
    data: DetailedE2EReport | null | undefined;
    prevData: DetailedE2EReport | null | undefined;
    loading: boolean;
    error: Error | null | undefined;
    refetch: () => Promise<void>;
}

const E2EPage = (props: E2EPageProps) => {
  const {
    data,
    prevData,
    loading,
    error,
    refetch,
  } = props;

  if (error) {
    return <Card style={{ padding: 24, marginTop: 16 }}>
      <Alert severity="error">Error fetching information</Alert>
    </Card>;
  }

  return <>
    <LoadingBackdrop data={data} loading={loading} />
    <Grid container spacing={4} data-testid="e2e-page">
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
          <TooltipIconButton
            tooltip="Refresh"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => refetch()}
          >
            <RefreshIcon/>
          </TooltipIconButton>
        </Grid>
        <E2EGeneralMetrics
          data={data?.summary}
          prevData={prevData?.summary}
          isLoading={loading}
        />
        <TestResultsPerApp
          data={data?.details || []}
          isLoading={loading}
          refetchData={() => refetch()}
        />
      </Stack>
    </Grid>
  </Grid>
  </>;
};

export default E2EPage;
