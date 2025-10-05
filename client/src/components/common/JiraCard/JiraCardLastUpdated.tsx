import { Box, Tooltip, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getRelativeTime } from './utils';

interface JiraCardLastUpdatedProps {
  updated: string;
}

/**
 * Displays last updated time with icon
 */
const JiraCardLastUpdated = (props: JiraCardLastUpdatedProps) => {
  const { updated } = props;
  const updatedTime = getRelativeTime(updated);

  return (
    <Tooltip title={`Updated: ${new Date(updated).toLocaleString()}`} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {updatedTime}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default JiraCardLastUpdated;

