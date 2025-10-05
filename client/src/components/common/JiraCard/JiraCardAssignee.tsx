import { Avatar, Tooltip } from '@mui/material';

interface JiraCardAssigneeProps {
  assignee: string;
}

/**
 * Displays assignee avatar with first letter
 */
const JiraCardAssignee = (props: JiraCardAssigneeProps) => {
  const { assignee } = props;

  if (!assignee) {
    return null;
  }

  return (
    <Tooltip title={`Assignee: ${assignee}`} arrow>
      <Avatar
        sx={{
          width: 24,
          height: 24,
          fontSize: '0.75rem',
          bgcolor: 'primary.main',
        }}
      >
        {assignee.charAt(0).toUpperCase()}
      </Avatar>
    </Tooltip>
  );
};

export default JiraCardAssignee;

