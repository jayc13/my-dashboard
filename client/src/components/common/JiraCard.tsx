import {
  Box,
  Card,
  CardContent, Chip,
  Stack,
  Typography,
} from '@mui/material';
import type { JiraTicket } from '@/types';
import AssignmentIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

interface JiraCardProps {
  ticket: JiraTicket;
}


const JiraCard = (props: JiraCardProps) => {
  const { ticket } = props;
  return (<Card
    onClick={() => window.open(ticket.url, '_blank')}
    sx={{ cursor: 'pointer', borderRadius: 2 }}
    variant="outlined"
    data-testid={`jira-card-${ticket.key}`}
  >
    <CardContent sx={{ padding: '8px !important' }}>
      <Stack direction="column">
        <Typography
          variant="body1"
          sx={{ fontWeight: 'bold' }}
          data-testid={`jira-card-summary-${ticket.key}`}
        >
          {ticket.summary}
        </Typography>

        <Box sx={{ my: 1 }}>
          <Chip label={ticket.status} color="default" size="small"/>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
          <Chip
            label={ticket.key}
            icon={<AssignmentIcon/>}
            variant="outlined"
            color="info"
            sx={{ border: 'none' }}
          />
          <Typography variant="caption" color="text.secondary" data-testid={`jira-card-assignee-${ticket.key}`}>
            {ticket.assignee ? `Assignee: ${ticket.assignee}` : 'Unassigned'}
          </Typography>
        </Stack>
      </Stack>
    </CardContent>
  </Card>);
};

export default JiraCard;