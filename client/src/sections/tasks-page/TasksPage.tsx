import { Alert, Card, Grid, Stack } from '@mui/material';
import { TooltipIconButton } from '@/components/common';
import RefreshIcon from '@mui/icons-material/Refresh';
import ToDoListSection from './components/ToDoListSection';
import JiraListSection from './components/JiraListSection';
import type { JiraTicket } from '@/types';

export interface TasksPageProps {
    myTicketsData: JiraTicket[] | undefined;
    manualTestingData: JiraTicket[] | undefined;
    isLoadingMyTickets: boolean;
    isLoadingManualTesting: boolean;
    errorMyTickets: Error | null | undefined;
    errorManualTesting: Error | null | undefined;
    refetchMyTickets: () => Promise<void>;
    refetchManualTesting: () => Promise<void>;
}

const TasksPage = (props: TasksPageProps) => {
    const {
        myTicketsData,
        manualTestingData,
        isLoadingMyTickets,
        isLoadingManualTesting,
        errorMyTickets,
        errorManualTesting,
        refetchMyTickets,
        refetchManualTesting,
    } = props;

    if (errorMyTickets || errorManualTesting) {
        return (
            <Card style={{ padding: 24, marginTop: 16 }} data-testid="tasks-page">
                <Alert severity="error">
                    Error fetching information: {errorMyTickets?.message || errorManualTesting?.message}
                </Alert>
            </Card>
        );
    }

    return (
        <Grid container spacing={2} data-testid="tasks-page">
            <Grid size={{ xs: 12 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <h2>Tasks</h2>
                    <TooltipIconButton
                        tooltip="Refresh All"
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={async () => {
                            await Promise.all([refetchMyTickets(), refetchManualTesting()]);
                        }}
                    >
                        <RefreshIcon />
                    </TooltipIconButton>
                </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ToDoListSection />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <JiraListSection
                    title="Manual Testing"
                    data={manualTestingData || []}
                    isLoading={isLoadingManualTesting}
                    hasError={!!errorManualTesting}
                    refresh={refetchManualTesting}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <JiraListSection
                    title="My Tickets"
                    data={myTicketsData || []}
                    isLoading={isLoadingMyTickets}
                    hasError={!!errorMyTickets}
                    refresh={refetchMyTickets}
                    sortByStatus
                />
            </Grid>
        </Grid>
    );
};

export default TasksPage;

