import { Chip } from '@mui/material';
import { getStatusColor } from './utils';

interface JiraCardStatusProps {
  status: string;
}

/**
 * Displays status chip with contextual color
 */
const JiraCardStatus = (props: JiraCardStatusProps) => {
  const { status } = props;
  const statusColor = getStatusColor(status);

  return (
    <Chip
      label={status}
      variant="filled"
      color={statusColor}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default JiraCardStatus;

