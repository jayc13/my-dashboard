import React from 'react';
import { DateTime } from 'luxon';
import { Box, Paper, Typography, LinearProgress, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { ToDoItem } from '@my-dashboard/types/todos';

interface TodoStatsProps {
  todos: ToDoItem[];
  isWideMode?: boolean;
}

export const TodoStats: React.FC<TodoStatsProps> = ({ todos, isWideMode = false }) => {
  const now = DateTime.now().startOf('day'); // Compare dates only, not times

  // Calculate statistics
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.isCompleted).length;
  const activeTasks = totalTasks - completedTasks;

  const overdueTasks = todos.filter(t => {
    if (t.isCompleted || !t.dueDate) {
return false;
}
    const dueDate = DateTime.fromISO(t.dueDate).startOf('day');
    return dueDate < now;
  }).length;

  const dueSoonTasks = todos.filter(t => {
    if (t.isCompleted || !t.dueDate) {
return false;
}
    const dueDate = DateTime.fromISO(t.dueDate).startOf('day');
    const diff = dueDate.diff(now, 'days').days;
    return diff <= 1 && diff >= 0;
  }).length;

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (totalTasks === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: isWideMode ? 2.5 : 3 },
        mb: { xs: 2, sm: 3 },
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {/* Completion Progress */}
      <Box sx={{ mb: { xs: 1.5, sm: isWideMode ? 2 : 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '0.95rem', sm: isWideMode ? '1rem' : '1.25rem' },
            }}
          >
            Task Progress
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: { xs: '0.95rem', sm: isWideMode ? '1rem' : '1.25rem' },
            }}
          >
            {completionRate.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionRate}
          sx={{
            height: { xs: 6, sm: isWideMode ? 8 : 10 },
            borderRadius: 5,
            backgroundColor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
            },
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
          {completedTasks} of {totalTasks} tasks completed
        </Typography>
      </Box>

      {/* Statistics Grid */}
      <Grid container spacing={isWideMode ? 1.5 : 2}>
        {/* Active Tasks */}
        <Grid size={{ xs: 6, sm: isWideMode ? 3 : 6, md: isWideMode ? 3 : 6, lg: isWideMode ? 3 : 3 }}>
          <Box
            sx={{
              p: { xs: 1.5, sm: isWideMode ? 1.5 : 2 },
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'primary.main',
              textAlign: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
            }}
          >
            <PendingIcon sx={{
              fontSize: { xs: 24, sm: isWideMode ? 28 : 32 },
              color: 'primary.main',
              mb: { xs: 0.5, sm: isWideMode ? 0.5 : 1 },
            }} />
            <Typography
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: isWideMode ? '1.5rem' : '2rem' },
              }}
            >
              {activeTasks}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Active
            </Typography>
          </Box>
        </Grid>

        {/* Completed Tasks */}
        <Grid size={{ xs: 6, sm: isWideMode ? 3 : 6, md: isWideMode ? 3 : 6, lg: isWideMode ? 3 : 3 }}>
          <Box
            sx={{
              p: { xs: 1.5, sm: isWideMode ? 1.5 : 2 },
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'success.main',
              textAlign: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
            }}
          >
            <CheckCircleIcon sx={{
              fontSize: { xs: 24, sm: isWideMode ? 28 : 32 },
              color: 'success.main',
              mb: { xs: 0.5, sm: isWideMode ? 0.5 : 1 },
            }} />
            <Typography
              sx={{
                fontWeight: 700,
                color: 'success.main',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: isWideMode ? '1.5rem' : '2rem' },
              }}
            >
              {completedTasks}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Completed
            </Typography>
          </Box>
        </Grid>

        {/* Overdue Tasks */}
        <Grid size={{ xs: 6, sm: isWideMode ? 3 : 6, md: isWideMode ? 3 : 6, lg: isWideMode ? 3 : 3 }}>
          <Box
            sx={{
              p: { xs: 1.5, sm: isWideMode ? 1.5 : 2 },
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: overdueTasks > 0 ? 'error.main' : 'divider',
              textAlign: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
            }}
          >
            <WarningAmberIcon
              sx={{
                fontSize: { xs: 24, sm: isWideMode ? 28 : 32 },
                color: overdueTasks > 0 ? 'error.main' : 'text.disabled',
                mb: { xs: 0.5, sm: isWideMode ? 0.5 : 1 },
                animation: overdueTasks > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.6 },
                },
              }}
            />
            <Typography
              sx={{
                fontWeight: 700,
                color: overdueTasks > 0 ? 'error.main' : 'text.disabled',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: isWideMode ? '1.5rem' : '2rem' },
              }}
            >
              {overdueTasks}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Overdue
            </Typography>
          </Box>
        </Grid>

        {/* Due Soon Tasks */}
        <Grid size={{ xs: 6, sm: isWideMode ? 3 : 6, md: isWideMode ? 3 : 6, lg: isWideMode ? 3 : 3 }}>
          <Box
            sx={{
              p: { xs: 1.5, sm: isWideMode ? 1.5 : 2 },
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: dueSoonTasks > 0 ? 'warning.main' : 'divider',
              textAlign: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
            }}
          >
            <AccessTimeIcon
              sx={{
                fontSize: { xs: 24, sm: isWideMode ? 28 : 32 },
                color: dueSoonTasks > 0 ? 'warning.main' : 'text.disabled',
                mb: { xs: 0.5, sm: isWideMode ? 0.5 : 1 },
              }}
            />
            <Typography
              sx={{
                fontWeight: 700,
                color: dueSoonTasks > 0 ? 'warning.main' : 'text.disabled',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: isWideMode ? '1.5rem' : '2rem' },
              }}
            >
              {dueSoonTasks}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Due Soon
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

