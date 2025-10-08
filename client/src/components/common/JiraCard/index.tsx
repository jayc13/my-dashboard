import { Card, CardContent, Stack } from '@mui/material';
import type { JiraTicket } from '@/types';
import { getPriorityColor } from './utils';
import JiraCardParent from './JiraCardParent';
import JiraCardSummary from './JiraCardSummary';
import JiraCardLabels from './JiraCardLabels';
import JiraCardMetadata from './JiraCardMetadata';

interface JiraCardProps {
  ticket: JiraTicket;
}

/**
 * Main Jira Card component
 * Displays a clickable card with ticket information
 */
const JiraCard = (props: JiraCardProps) => {
  const { ticket } = props;
  const priorityColor = getPriorityColor(ticket.priority);

  return (
    <Card
      onClick={() => window.open(ticket.url, '_blank')}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        borderLeft: `4px solid ${priorityColor}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      variant="outlined"
      data-testid={`jira-card-${ticket.key}`}
    >
      <CardContent sx={{ padding: '12px 16px !important' }}>
        <Stack direction="column" spacing={1.5}>
          {/* Parent ticket section */}
          {ticket.parent && (
            <JiraCardParent
              parentKey={ticket.parent.key}
              parentSummary={ticket.parent.summary}
              ticketKey={ticket.key}
            />
          )}

          {/* Ticket summary */}
          <JiraCardSummary summary={ticket.summary} ticketKey={ticket.key} />

          {/* Labels section */}
          <JiraCardLabels labels={ticket.labels} />

          {/* Bottom section with metadata */}
          <JiraCardMetadata
            ticketKey={ticket.key}
            assignee={ticket.assignee}
            updated={ticket.updated}
            status={ticket.status}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JiraCard;
