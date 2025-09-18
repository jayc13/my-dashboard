import useSWR from 'swr';
import { API_BASE_URL } from '../utils/constants';
import ToDoListWidget from '../components/widgets/ToDoList';
import JiraList from '../components/widgets/JiraList';
import {
    Alert,
    Card,
    Grid,
} from '@mui/material';
import type { JiraTicket } from '../types';

const sortTicketsByStatus = (tickets: JiraTicket[]) => {
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
    const {
        data: myTicketsData,
        isLoading: isLoadingMyTickets,
        error: errorMyTickets,
        mutate: mutateMyTickets,
    } = useSWR(`${API_BASE_URL}/api/jira/my_tickets`);

    const {
        data: manualTestingData,
        isLoading: isLoadingManualTesting,
        error: errorManualTesting,
        mutate: mutateManualTesting,
    } = useSWR(`${API_BASE_URL}/api/jira/manual_qa`);

    if (errorMyTickets || errorManualTesting) {
        return (
            <Card style={{ padding: 24, marginTop: 16 }} data-testid="tasks-page">
                <Alert severity="error">Error fetching information</Alert>
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
                    refresh={mutateManualTesting}
                    data={manualTestingData?.issues ?? []}
                    isLoading={isLoadingManualTesting}
                    hasError={errorManualTesting || !!manualTestingData?.error}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <JiraList
                    title="My Tickets"
                    refresh={mutateMyTickets}
                    data={sortTicketsByStatus(myTicketsData?.issues ?? [])}
                    isLoading={isLoadingMyTickets}
                    hasError={errorMyTickets || !!myTicketsData?.error}
                />
            </Grid>
        </Grid>
    );
};

export default TasksPage;