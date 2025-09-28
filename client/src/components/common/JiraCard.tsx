import { Avatar, Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import type { JiraTicket } from '../../types';

interface JiraCardProps {
    ticket: JiraTicket;
}

function getAvatarByPriority(priority: string) {
    switch (priority.toLowerCase()) {
        case 'high':
            return <WarningIcon/>;
        case 'medium':
            return <PriorityHighIcon/>;
        default:
            return <LowPriorityIcon/>;
    }
}

function getColorByPriority(priority: string): string {
    switch (priority.toLowerCase()) {
        case 'high':
            return 'red';
        case 'medium':
            return 'orange';
        case 'low':
            return 'green';
        default:
            return 'gray'; // Default for no priority
    }
}


const JiraCard = (props: JiraCardProps) => {
    const { ticket } = props;
    return (<Card
        onClick={() => window.open(ticket.url, '_blank')} sx={{ cursor: 'pointer' }}
        variant="outlined"
        data-testid={`jira-card-${ticket.key}`}
    >
        <CardHeader
            avatar={
                <Avatar sx={{ bgcolor: getColorByPriority(ticket.priority) }} data-testid={`jira-card-priority-${ticket.key}`}>
                    {getAvatarByPriority(ticket.priority)}
                </Avatar>
            }
            title={<strong data-testid={`jira-card-key-${ticket.key}`}>{ticket.key}</strong>}
            subheader={<small data-testid={`jira-card-status-${ticket.key}`}>{ticket.status}</small>}
        />
        <CardContent style={{ paddingTop: 0 }}>
            <Stack direction="column">
                <Typography variant="body2" data-testid={`jira-card-summary-${ticket.key}`}>
                    {ticket.summary}
                </Typography>
            </Stack>
        </CardContent>
    </Card>);
};

export default JiraCard;