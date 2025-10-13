import { Alert, Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { TooltipIconButton } from '@/components/common';
import RefreshIcon from '@mui/icons-material/Refresh';
import PRList from './components/PRList';
import AddPRButton from './components/AddPRButton';
import EmptyState from './components/EmptyState';
import AddPRDialog from './components/AddPRDialog';
import DeletePRDialog from './components/DeletePRDialog';
import PullRequestsSkeleton from './PullRequestsSkeleton';
import type { PullRequest } from '@/types';
import { useState } from 'react';

export interface PullRequestsPageProps {
  pullRequestsData: PullRequest[] | undefined;
  loading: boolean;
  error: Error | null | undefined;
  refetch: () => Promise<void>;
  // Dialog states
  openAddDialog: boolean;
  openDeleteDialog: boolean;
  deleteId: string | null;
  url: string;
  urlError: string | null;
  isAdding: boolean;
  isDeleting: boolean;
  // Dialog handlers
  handleOpenAddDialog: () => void;
  handleCloseAddDialog: () => void;
  handleAdd: () => Promise<void>;
  handleDeleteClick: (id: string) => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;
  setUrl: (url: string) => void;
  setUrlError: (error: string | null) => void;
}

const PullRequestsPage = (props: PullRequestsPageProps) => {
  const {
    pullRequestsData,
    loading,
    error,
    refetch,
    openAddDialog,
    openDeleteDialog,
    url,
    urlError,
    isAdding,
    isDeleting,
    handleOpenAddDialog,
    handleCloseAddDialog,
    handleAdd,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    setUrl,
    setUrlError,
  } = props;

  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetch = async () => {
    setIsRefetching(true);
    try {
      await refetch();
    } finally {
      setIsRefetching(false);
    }
  };

  const hasPullRequests = pullRequestsData && pullRequestsData.length > 0;

  return (
    <Box p={3} data-testid="pull-requests-page">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4" gutterBottom>
            Pull Requests
          </Typography>
          <TooltipIconButton
            tooltip="Refresh"
            size="small"
            onClick={handleRefetch}
            disabled={isRefetching}
            data-testid="refresh-button"
          >
            {isRefetching ? <CircularProgress size={20} /> : <RefreshIcon />}
          </TooltipIconButton>
        </Stack>
        {hasPullRequests && <AddPRButton onClick={handleOpenAddDialog} />}
      </Box>

      {loading && !pullRequestsData ? (
        <PullRequestsSkeleton />
      ) : error ? (
        <Box mt={2}>
          <Alert severity="error">Error fetching pull requests: {error.message}</Alert>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {hasPullRequests ? (
            <PRList pullRequests={pullRequestsData} onDelete={handleDeleteClick} />
          ) : (
            <EmptyState onAddClick={handleOpenAddDialog} />
          )}
        </Grid>
      )}

      <AddPRDialog
        open={openAddDialog}
        url={url}
        urlError={urlError}
        isAdding={isAdding}
        onClose={handleCloseAddDialog}
        onAdd={handleAdd}
        onUrlChange={newUrl => {
          setUrl(newUrl);
          setUrlError(null);
        }}
      />

      <DeletePRDialog
        open={openDeleteDialog}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
};

export default PullRequestsPage;
