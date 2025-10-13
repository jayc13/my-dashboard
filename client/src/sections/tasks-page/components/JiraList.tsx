import { Alert, CircularProgress, Grid, Skeleton, Stack } from '@mui/material';
import JiraCard from '@/components/common/JiraCard';
import { TooltipIconButton } from '@/components/common';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { JiraTicket } from '@/types/index';
import { useState } from 'react';

interface ManualTestingProps {
  data: JiraTicket[];
  title: string;
  isLoading?: boolean;
  hasError?: boolean;
  refresh?: () => Promise<void>;
}

const JiraList = (props: ManualTestingProps) => {
  const {
    data = [],
    title = 'Jira Tickets',
    isLoading = true,
    hasError = false,
    refresh = () => Promise.resolve(),
  } = props;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const JiraListHeader = (props: { size?: number }) => {
    const { size = 0 } = props;
    return (
      <Grid
        container
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 data-testid={`jira-list-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {title} {size > 0 ? `(${size})` : ''}{' '}
        </h2>
        <TooltipIconButton
          tooltip="Refresh"
          size="small"
          sx={{ ml: 1 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          data-testid={`jira-list-refresh-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        </TooltipIconButton>
      </Grid>
    );
  };

  // Only show skeleton if loading AND no data exists yet
  if (isLoading && !data) {
    return (
      <div data-testid={`jira-list-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <JiraListHeader />
        <Stack
          direction="column"
          spacing={2}
          data-testid={`jira-list-loading-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Skeleton variant="rounded" height={115} />
          <Skeleton variant="rounded" height={115} />
          <Skeleton variant="rounded" height={115} />
        </Stack>
      </div>
    );
  }

  if (hasError) {
    return (
      <div data-testid={`jira-list-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <JiraListHeader />
        <Alert
          severity="error"
          variant="outlined"
          data-testid={`jira-list-error-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          Error loading tickets
        </Alert>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div data-testid={`jira-list-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <JiraListHeader />
        <Alert
          severity="info"
          variant="outlined"
          data-testid={`jira-list-empty-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          No tickets found
        </Alert>
      </div>
    );
  }

  return (
    <div data-testid={`jira-list-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <JiraListHeader size={data.length} />
      <div
        style={{ maxHeight: '800px', overflowY: 'auto' }}
        data-testid={`jira-list-container-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Stack direction="column" spacing={2}>
          {data.map(ticket => (
            <JiraCard ticket={ticket} key={ticket.key} />
          ))}
        </Stack>
      </div>
    </div>
  );
};

export default JiraList;
