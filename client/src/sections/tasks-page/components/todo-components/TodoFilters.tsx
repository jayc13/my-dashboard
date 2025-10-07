import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Paper } from '@mui/material';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TodayIcon from '@mui/icons-material/Today';

export type FilterType = 'all' | 'overdue' | 'due-soon' | 'today';

interface TodoFiltersProps {
  filterType: FilterType;
  onFilterChange: (filter: FilterType) => void;
  overdueCount: number;
  dueSoonCount: number;
  dueTodayCount: number;
  isCompact?: boolean;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({
  filterType,
  onFilterChange,
  overdueCount,
  dueSoonCount,
  dueTodayCount,
  isCompact = false,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: isCompact ? 1.5 : 2,
        mb: isCompact ? 2 : 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: isCompact ? 'column' : 'row' },
          gap: isCompact ? 1.5 : 2,
          alignItems: { xs: 'stretch', md: isCompact ? 'stretch' : 'center' },
        }}
      >

        {/* Filter Buttons */}
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(_, newFilter) => {
            if (newFilter !== null) {
              onFilterChange(newFilter);
            }
          }}
          size="small"
          sx={{
            width: '100%',
            display: 'flex',
            '& .MuiToggleButton-root': {
              flex: 1,
              px: isCompact ? 1 : 2,
              py: isCompact ? 0.5 : 0.75,
              border: '1px solid',
              borderColor: 'divider',
              fontSize: isCompact ? '0.75rem' : '0.875rem',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            },
          }}
        >
          <ToggleButton value="all" aria-label="all tasks">
            <AllInclusiveIcon sx={{ fontSize: isCompact ? 16 : 18, mr: 0.5 }} />
            All
          </ToggleButton>
          <ToggleButton value="overdue" aria-label="overdue tasks">
            <WarningAmberIcon sx={{ fontSize: isCompact ? 16 : 18, mr: 0.5 }} />
            {isCompact ? 'Late' : 'Overdue'}
            {overdueCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: 'error.main',
                  color: 'error.contrastText',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  lineHeight: 1,
                }}
              >
                {overdueCount}
              </Box>
            )}
          </ToggleButton>
          <ToggleButton value="today" aria-label="due today">
            <TodayIcon sx={{ fontSize: isCompact ? 16 : 18, mr: 0.5 }} />
            Today
            {dueTodayCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: 'info.main',
                  color: 'info.contrastText',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  lineHeight: 1,
                }}
              >
                {dueTodayCount}
              </Box>
            )}
          </ToggleButton>
          <ToggleButton value="due-soon" aria-label="due soon">
            <AccessTimeIcon sx={{ fontSize: isCompact ? 16 : 18, mr: 0.5 }} />
            {isCompact ? 'Soon' : 'Due Soon'}
            {dueSoonCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: 'warning.main',
                  color: 'warning.contrastText',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  lineHeight: 1,
                }}
              >
                {dueSoonCount}
              </Box>
            )}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Paper>
  );
};

