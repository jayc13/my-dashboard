import {
  Card,
  CardContent, Chip, Divider,
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
        {
          ticket.parent && (<>
            <Typography
              variant="caption"
              color="text.secondary"
              data-testid={`jira-card-parent-${ticket.key}`}
            >
              <strong>{ticket.parent.key}: </strong>
              {ticket.parent.summary}
            </Typography>
            <Divider sx={{ my: 0.5 }}/>
          </>)
        }
        <Typography
          variant="body1"
          sx={{ fontWeight: 'bold' }}
          data-testid={`jira-card-summary-${ticket.key}`}
        >
          {ticket.summary}
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
          <Chip
            label={ticket.key}
            icon={<AssignmentIcon/>}
            variant="outlined"
            color="success"
            sx={{ border: 'none' }}
          />
          <Chip label={ticket.status} variant="outlined" color="info" size="small"/>
        </Stack>
      </Stack>
    </CardContent>
  </Card>);
};

export default JiraCard;