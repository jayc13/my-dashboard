import TestResultsPerApp from '@/sections/e2e-page/components/TestResultsPerApp';
import E2EGeneralMetrics from './components/E2EGeneralMetrics';
import LoadingBackdrop from './components/LoadingBackdrop.tsx';
import ForceRefreshConfirmationModal from './components/ForceRefreshConfirmationModal';
import {
  Alert,
  Card,
  CircularProgress,
  Grid,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import type { DetailedE2EReport } from '@my-dashboard/types';
import { useState } from 'react';

interface E2EPageProps {
  data: DetailedE2EReport | null | undefined;
  prevData: DetailedE2EReport | null | undefined;
  loading: boolean;
  error: Error | null | undefined;
  refetch: (force?: boolean) => Promise<void>;
}

const E2EPage = (props: E2EPageProps) => {
  const { data, prevData, loading, error, refetch } = props;

  const [isRefetching, setIsRefetching] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showAllApps, setShowAllApps] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const isPending = data?.summary.status === 'pending';
  const isInitialLoading = loading && !data;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefetch = async (force?: boolean) => {
    handleMenuClose();
    setIsRefetching(true);
    try {
      await refetch(force);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleForceRefreshClick = () => {
    handleMenuClose();
    setConfirmModalOpen(true);
  };

  const handleConfirmModalClose = () => {
    setConfirmModalOpen(false);
  };

  const handleConfirmForceRefresh = async () => {
    setConfirmModalOpen(false);
    await handleRefetch(true);
  };

  if (error) {
    return (
      <Card style={{ padding: 24, marginTop: 16 }}>
        <Alert severity="error">Error fetching information</Alert>
      </Card>
    );
  }

  if (loading && !data) {
    return (
      <Card style={{ padding: 24, marginTop: 16 }}>
        <Stack direction="column" alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography variant="h6">Loading...</Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <LoadingBackdrop data={data} />
      <ForceRefreshConfirmationModal
        open={confirmModalOpen}
        onClose={handleConfirmModalClose}
        onConfirm={handleConfirmForceRefresh}
        isRefetching={isRefetching}
      />
      <Grid container spacing={4} data-testid="e2e-page">
        <Grid size={{ xs: 12 }}>
          <Stack direction="column" alignItems="left" width="100%">
            <Grid
              container
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2>E2E Tests</h2>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAllApps}
                      onChange={e => setShowAllApps(e.target.checked)}
                      data-testid="show-all-apps-toggle"
                    />
                  }
                  label="Show all apps"
                />
                <Stack direction="row" spacing={0}>
                  <Tooltip title="Refresh">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleRefetch()}
                        disabled={isRefetching}
                        data-testid="refresh-button"
                        sx={{ borderRadius: '4px 0 0 4px' }}
                      >
                        {isRefetching ? <CircularProgress size={20} /> : <RefreshIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="More options">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleMenuOpen}
                        disabled={isRefetching}
                        data-testid="refresh-menu-button"
                        sx={{
                          borderRadius: '0 4px 4px 0',
                          borderLeft: '1px solid',
                          borderColor: 'divider',
                          ml: 0,
                        }}
                      >
                        <ArrowDropDownIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    data-testid="refresh-menu"
                  >
                    <MenuItem onClick={() => handleRefetch()} data-testid="menu-refresh">
                      <ListItemIcon>
                        <RefreshIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Refresh</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleForceRefreshClick} data-testid="menu-force-refresh">
                      <ListItemIcon>
                        <RestartAltIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Force Regenerate</ListItemText>
                    </MenuItem>
                  </Menu>
                </Stack>
              </Stack>
            </Grid>
            <E2EGeneralMetrics
              data={data?.summary}
              prevData={prevData?.summary}
              isLoading={loading || isPending}
            />
            <TestResultsPerApp
              data={data?.details || []}
              isLoading={isInitialLoading}
              refetchData={() => refetch()}
              showAllApps={showAllApps}
              isPending={isPending}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default E2EPage;
