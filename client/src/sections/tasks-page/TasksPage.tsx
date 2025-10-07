import { Grid } from '@mui/material';
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

    return (
        <Grid container spacing={2} data-testid="tasks-page">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ToDoListSection isWideMode={false} />
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

