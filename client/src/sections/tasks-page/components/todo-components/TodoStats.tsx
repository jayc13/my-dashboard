import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ToDoItem } from '@my-dashboard/types/todos';

interface TodoStatsProps {
  todos: ToDoItem[];
}

export const TodoStats: React.FC<TodoStatsProps> = ({ todos }) => {
  // Calculate statistics
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.isCompleted).length;

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (totalTasks === 0) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="caption" sx={{
        color: 'text.secondary',
        mt: 0.5,
        display: 'block',
        fontSize: { xs: '0.65rem', sm: '0.75rem' },
      }}>
        {completedTasks} of {totalTasks} tasks completed
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
        }}
      >{`${completionRate.toFixed(0)}%`}</Typography>
    </Box>
  );
};

