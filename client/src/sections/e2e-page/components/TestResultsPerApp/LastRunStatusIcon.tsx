import React from 'react';
import {
  SettingsOutlined,
  CheckCircleOutline,
  CancelOutlined,
  HourglassEmptyOutlined,
  HelpOutline,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import type { DetailedE2EReportDetail } from '@my-dashboard/types';

const LastRunStatusIcon: React.FC<{ result: DetailedE2EReportDetail }> = ({ result }) => {
  const status = result.app?.lastRun?.status || result.lastRunStatus;
  switch (status) {
    case 'running':
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              to: { transform: 'rotate(360deg)' },
            },
          }}
          title="Running"
        >
          <SettingsOutlined sx={{ fontSize: 28, color: '#757575' }} />
        </Box>
      );
    case 'passed':
    case 'success':
      return (
        <Box component="span" display="inline-flex" title="Passed">
          <CheckCircleOutline sx={{ fontSize: 28, color: '#4caf50' }} />
        </Box>
      );
    case 'failed':
      return (
        <Box component="span" display="inline-flex" title="Failed">
          <CancelOutlined sx={{ fontSize: 28, color: '#e53935' }} />
        </Box>
      );
    case 'pending':
      return (
        <Box component="span" display="inline-flex" title="Pending">
          <HourglassEmptyOutlined sx={{ fontSize: 28, color: '#1976d2' }} />
        </Box>
      );
    default:
      return (
        <Box component="span" display="inline-flex" title="Unknown">
          <HelpOutline sx={{ fontSize: 28, color: '#757575' }} />
        </Box>
      );
  }
};

export default LastRunStatusIcon;
