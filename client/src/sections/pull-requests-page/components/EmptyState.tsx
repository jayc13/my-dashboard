import { Box, Button, Typography } from '@mui/material';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';

export interface EmptyStateProps {
  onAddClick: () => void;
}

const EmptyState = ({ onAddClick }: EmptyStateProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      sx={{ opacity: 0.7, width: '100%' }}
      data-testid="pr-empty-state"
    >
      <Box mb={2}>
        <TroubleshootIcon sx={{ fontSize: 60, color: 'action.disabled' }} />
      </Box>
      <Typography variant="h6" gutterBottom>
        No pull requests found
      </Typography>
      <Typography color="textSecondary" align="center" sx={{ mb: 2 }}>
        Add a GitHub pull request to get started.
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={onAddClick}
        data-testid="add-pr-button-empty"
      >
        Add Pull Request
      </Button>
    </Box>
  );
};

export default EmptyState;
