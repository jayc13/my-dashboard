import { Typography, Divider } from '@mui/material';

interface JiraCardParentProps {
  parentKey: string;
  parentSummary: string;
  ticketKey: string;
}

/**
 * Displays parent ticket information
 */
const JiraCardParent = (props: JiraCardParentProps) => {
  const { parentKey, parentSummary, ticketKey } = props;

  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        data-testid={`jira-card-parent-${ticketKey}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <strong>{parentKey}:</strong>
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {parentSummary}
        </span>
      </Typography>
      <Divider sx={{ my: 0.5 }} />
    </>
  );
};

export default JiraCardParent;

