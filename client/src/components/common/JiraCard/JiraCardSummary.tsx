import { Typography } from '@mui/material';

interface JiraCardSummaryProps {
  summary: string;
  ticketKey: string;
}

/**
 * Displays ticket summary with ellipsis after 2 lines
 */
const JiraCardSummary = (props: JiraCardSummaryProps) => {
  const { summary, ticketKey } = props;

  return (
    <Typography
      variant="body1"
      sx={{
        fontWeight: 600,
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
      data-testid={`jira-card-summary-${ticketKey}`}
    >
      {summary}
    </Typography>
  );
};

export default JiraCardSummary;
