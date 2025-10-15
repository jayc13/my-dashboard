import React from 'react';
import {
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaQuestionCircle,
} from 'react-icons/fa';
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
            display: 'inline-block',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              to: { transform: 'rotate(360deg)' },
            },
          }}
          title="Running"
        >
          <FaCog color="#757575" size={28} />
        </Box>
      );
    case 'passed':
    case 'success':
      return (
        <Box component="span" display="inline-block" title="Passed">
          <FaCheckCircle color="#4caf50" size={28} />
        </Box>
      );
    case 'failed':
      return (
        <Box component="span" display="inline-block" title="Failed">
          <FaTimesCircle color="#e53935" size={28} />
        </Box>
      );
    case 'pending':
      return (
        <Box component="span" display="inline-block" title="Pending">
          <FaHourglassHalf color="#1976d2" size={28} />
        </Box>
      );
    default:
      return (
        <Box component="span" display="inline-block" title="Unknown">
          <FaQuestionCircle color="#757575" size={28} />
        </Box>
      );
  }
};

export default LastRunStatusIcon;
