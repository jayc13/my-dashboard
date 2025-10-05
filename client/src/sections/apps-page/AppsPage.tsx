import { Alert, Box, Card, Stack, Typography } from '@mui/material';
import { TooltipIconButton } from '@/components/common';
import RefreshIcon from '@mui/icons-material/Refresh';
import AppsHeader from './components/AppsHeader';
import AppsFilters from './components/AppsFilters';
import AppsDataGrid from './components/AppsDataGrid';
import AppDialog from './components/AppDialog';
import DeleteAppDialog from './components/DeleteAppDialog';
import type { Application } from '@/types';

export interface AppsPageProps {
    apps: Application[] | undefined;
    loading: boolean;
    error: Error | null | undefined;
    refetch: () => Promise<void>;
    // Filter states
    showOnlyWatching: boolean;
    searchQuery: string;
    setShowOnlyWatching: (value: boolean) => void;
    setSearchQuery: (value: string) => void;
    // Dialog states
    openDialog: boolean;
    openDeleteDialog: boolean;
    editingApp: Application | null;
    deleteAppId: number | null;
    formData: Partial<Application>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    // Dialog handlers
    handleOpenDialog: (app?: Application) => void;
    handleCloseDialog: () => void;
    handleSubmit: () => Promise<void>;
    handleDeleteClick: (id: number) => void;
    handleConfirmDelete: () => Promise<void>;
    handleCancelDelete: () => void;
    setFormData: (data: Partial<Application>) => void;
}

const AppsPage = (props: AppsPageProps) => {
    const {
        apps,
        loading,
        error,
        refetch,
        showOnlyWatching,
        searchQuery,
        setShowOnlyWatching,
        setSearchQuery,
        openDialog,
        openDeleteDialog,
        editingApp,
        formData,
        isCreating,
        isUpdating,
        isDeleting,
        handleOpenDialog,
        handleCloseDialog,
        handleSubmit,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
        setFormData,
    } = props;

    if (error) {
        return (
            <Card style={{ padding: 24, marginTop: 16 }}>
                <Alert severity="error">Error fetching apps: {error.message}</Alert>
            </Card>
        );
    }

    // Filter apps based on watching status and search query
    const filteredApps = (apps || [])
        .filter((app) => (showOnlyWatching ? app.watching : true))
        .filter(
            (app) =>
                searchQuery === '' ||
                app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.code.toLowerCase().includes(searchQuery.toLowerCase()),
        );

    return (
        <Box sx={{ p: 3 }} data-testid="apps-page">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4" component="h1">
                        Apps Management
                    </Typography>
                    <TooltipIconButton tooltip="Refresh" size="small" onClick={() => refetch()}>
                        <RefreshIcon />
                    </TooltipIconButton>
                </Stack>
                <AppsHeader onAddClick={() => handleOpenDialog()} />
            </Box>

            <AppsFilters
                searchQuery={searchQuery}
                showOnlyWatching={showOnlyWatching}
                onSearchChange={setSearchQuery}
                onWatchingFilterChange={setShowOnlyWatching}
            />

            <AppsDataGrid
                apps={filteredApps}
                loading={loading}
                totalApps={apps?.length || 0}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteClick}
            />

            <AppDialog
                open={openDialog}
                editingApp={editingApp}
                formData={formData}
                isCreating={isCreating}
                isUpdating={isUpdating}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                onFormDataChange={setFormData}
            />

            <DeleteAppDialog
                open={openDeleteDialog}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </Box>
    );
};

export default AppsPage;

