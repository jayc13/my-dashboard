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
      return <FaCheckCircle color="#4caf50" size={28} title="Passed" />;
    case 'failed':
      return <FaTimesCircle color="#e53935" size={28} title="Failed" />;
    case 'pending':
      return <FaHourglassHalf color="#1976d2" size={28} title="Pending" />;
    default:
      return <FaQuestionCircle color="#757575" size={28} title="Unknown" />;
  }
};

export default LastRunStatusIcon;
