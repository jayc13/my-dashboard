import ToDoListWidget from '../components/widgets/ToDoList';
import JiraList from '../components/widgets/JiraList';
import {
    Alert,
    Card,
    Grid,
} from '@mui/material';
import { useMyJiraTickets, useManualQATasks } from '../hooks';
import type { JiraTicket } from '../types';

const sortTicketsByStatus = (tickets: JiraTicket[] = []) => {
    const statusOrder: Record<string, number> = Object.freeze({
        'In Progress': 1,
        'In Review': 2,
        'To Do': 3,
        'Done': 4,
    });

    return tickets.sort((a: JiraTicket, b: JiraTicket) => {
        const statusA = a.status;
        const statusB = b.status;

        return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99);
    });
};

const TasksPage = () => {
    // SDK hooks
    const { data: myTicketsData, loading: isLoadingMyTickets, error: errorMyTickets, refetch: refetchMyTickets } = useMyJiraTickets();
    const { data: manualTestingData, loading: isLoadingManualTesting, error: errorManualTesting, refetch: refetchManualTesting } = useManualQATasks();

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
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <h2>To-Do List</h2>
                <ToDoListWidget/>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <JiraList
                    title="Manual Testing"
                    refresh={refetchManualTesting}
                    data={manualTestingData?.issues || []}
                    isLoading={isLoadingManualTesting}
                    hasError={!!errorManualTesting}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <JiraList
                    title="My Tickets"
                    refresh={refetchMyTickets}
                    data={sortTicketsByStatus(myTicketsData?.issues || [])}
                    isLoading={isLoadingMyTickets}
                    hasError={!!errorMyTickets}
                />
            </Grid>
        </Grid>
    );
};

export default TasksPage;