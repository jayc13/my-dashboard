import { Box, FormControlLabel, InputAdornment, Switch, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

export interface AppsFiltersProps {
  searchQuery: string;
  showOnlyWatching: boolean;
  onSearchChange: (query: string) => void;
  onWatchingFilterChange: (value: boolean) => void;
}

const AppsFilters = (props: AppsFiltersProps) => {
  const { searchQuery, showOnlyWatching, onSearchChange, onWatchingFilterChange } = props;

  return (
    <Box display="flex" gap={2} alignItems="center" justifyContent="end" mb={3}>
      <TextField
        placeholder="Search apps by name or code..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        autoComplete="off"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ width: 300 }}
        size="small"
        data-testid="apps-search-input"
      />
      <FormControlLabel
        control={
          <Switch
            checked={showOnlyWatching}
            onChange={e => onWatchingFilterChange(e.target.checked)}
            color="primary"
            data-testid="apps-watching-filter"
          />
        }
        label="Show only watching"
      />
    </Box>
  );
};

export default AppsFilters;
