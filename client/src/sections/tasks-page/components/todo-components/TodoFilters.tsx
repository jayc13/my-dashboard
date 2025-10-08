import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
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
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({
  filterType,
  onFilterChange,
  overdueCount,
  dueSoonCount,
  dueTodayCount,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', md: 'center' },
        my: 1,
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
            px: 1,
            py: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: theme =>
              theme.palette.mode === 'light' ? '#ffffff' : theme.palette.grey[900],
            fontSize: '0.75rem',
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
          <AllInclusiveIcon sx={{ fontSize: 16, mr: 0.5 }} />
          All
        </ToggleButton>
        <ToggleButton value="overdue" aria-label="overdue tasks">
          <WarningAmberIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Overdue
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
          <TodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Today
          {dueTodayCount > 0 && (
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
              {dueTodayCount}
            </Box>
          )}
        </ToggleButton>
        <ToggleButton value="due-soon" aria-label="due soon">
          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Due Soon
          {dueSoonCount > 0 && (
            <Box
              component="span"
              sx={{
                ml: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
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
  );
};
