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

    // Determine if Manual Testing section should be shown
    const hasManualTestingTickets = !isLoadingManualTesting &&
                                    !errorManualTesting &&
                                    manualTestingData &&
                                    manualTestingData.length > 0;

    // Calculate grid sizes based on whether Manual Testing is shown
    const todoGridSize = hasManualTestingTickets
        ? { xs: 12, sm: 6, md: 4 }  // Narrow mode
        : { xs: 12, sm: 12, md: 8 }; // Wide mode

    const myTicketsGridSize = hasManualTestingTickets
        ? { xs: 12, sm: 6, md: 4 }  // Normal size
        : { xs: 12, sm: 12, md: 4 }; // Normal size

    return (
        <Grid container spacing={2} data-testid="tasks-page">
            <Grid size={todoGridSize}>
                <ToDoListSection isWideMode={!hasManualTestingTickets} />
            </Grid>
            {hasManualTestingTickets && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <JiraListSection
                        title="Manual Testing"
                        data={manualTestingData || []}
                        isLoading={isLoadingManualTesting}
                        hasError={!!errorManualTesting}
                        refresh={refetchManualTesting}
                    />
                </Grid>
            )}
            <Grid size={myTicketsGridSize}>
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

