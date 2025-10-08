import { Stack, Chip } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import JiraCardAssignee from './JiraCardAssignee';
import JiraCardLastUpdated from './JiraCardLastUpdated';
import JiraCardStatus from './JiraCardStatus';

interface JiraCardMetadataProps {
  ticketKey: string;
  assignee: string;
  updated: string;
  status: string;
}

/**
 * Displays ticket metadata (key, priority, assignee, time, status)
 */
const JiraCardMetadata = (props: JiraCardMetadataProps) => {
  const { ticketKey, assignee, updated, status } = props;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={1}
    >
      {/* Left section: Key, Assignee */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={ticketKey}
          icon={<AssignmentIcon />}
          variant="filled"
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: 'action.hover',
          }}
        />
        <JiraCardAssignee assignee={assignee} />
      </Stack>

      {/* Right section: Last Updated, Status */}
      <Stack direction="row" spacing={1} alignItems="center">
        <JiraCardLastUpdated updated={updated} />
        <JiraCardStatus status={status} />
      </Stack>
    </Stack>
  );
};

export default JiraCardMetadata;
