import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { useApps, useCreateApp, useUpdateApp, useDeleteApp } from '@/hooks';
import AppsPage from './AppsPage';
import type { Application } from '@/types';

const AppsPageContainer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [showOnlyWatching, setShowOnlyWatching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Application>>({
    name: '',
    code: '',
    pipelineUrl: '',
    e2eTriggerConfiguration: '',
    watching: false,
  });

  // SDK hooks
  const { data: apps, loading: isLoadingApps, error, refetch } = useApps();
  const { mutate: createApp, loading: isCreating } = useCreateApp();
  const { mutate: updateApp, loading: isUpdating } = useUpdateApp();
  const { mutate: deleteApp, loading: isDeleting } = useDeleteApp();

  const handleOpenDialog = (app?: Application) => {
    if (app) {
      setEditingApp(app);
      setFormData(app);
    } else {
      setEditingApp(null);
      setFormData({
        name: '',
        code: '',
        pipelineUrl: '',
        e2eTriggerConfiguration: '',
        watching: false,
      });
    }
    setOpenDialog(true);
  };

  // Handle URL parameter to open edit dialog
  useEffect(() => {
    const appIdParam = searchParams.get('appId');

    // Only process if we have an appId parameter and apps are loaded
    if (appIdParam && apps && apps.length > 0) {
      const appId = parseInt(appIdParam, 10);

      // Find the app with matching id
      const appToEdit = apps.find(app => app.id === appId);

      // Remove the URL parameter
      searchParams.delete('appId');
      setSearchParams(searchParams, { replace: true });

      // If app found, open the edit dialog
      if (appToEdit) {
        handleOpenDialog(appToEdit);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingApp(null);
    setFormData({
      name: '',
      code: '',
      pipelineUrl: '',
      e2eTriggerConfiguration: '',
      watching: false,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.code) {
        enqueueSnackbar('Name and code are required', { variant: 'error' });
        return;
      }

      // Validate JSON if e2eTriggerConfiguration is provided
      if (formData.e2eTriggerConfiguration && formData.e2eTriggerConfiguration.trim()) {
        try {
          JSON.parse(formData.e2eTriggerConfiguration);
        } catch {
          enqueueSnackbar('E2E Trigger Configuration must be valid JSON', { variant: 'error' });
          return;
        }
      }

      if (editingApp && editingApp.id) {
        await updateApp({
          id: editingApp.id,
          data: {
            name: formData.name,
            code: formData.code,
            pipelineUrl: formData.pipelineUrl,
            e2eTriggerConfiguration: formData.e2eTriggerConfiguration,
            watching: formData.watching,
          } as Application,
        });
        enqueueSnackbar('App updated successfully', { variant: 'success' });
      } else {
        await createApp({
          name: formData.name!,
          code: formData.code!,
          pipelineUrl: formData.pipelineUrl,
          e2eTriggerConfiguration: formData.e2eTriggerConfiguration,
          watching: formData.watching || false,
        } as Application);
        enqueueSnackbar('App created successfully', { variant: 'success' });
      }

      await refetch();
      handleCloseDialog();
    } catch {
      enqueueSnackbar('Failed to save app', { variant: 'error' });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteAppId(id);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteAppId) {
      return;
    }

    try {
      await deleteApp(deleteAppId);
      enqueueSnackbar('App deleted successfully', { variant: 'success' });
      await refetch();
    } catch {
      enqueueSnackbar('Failed to delete app', { variant: 'error' });
    } finally {
      setConfirmDeleteOpen(false);
      setDeleteAppId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDeleteAppId(null);
  };

  const handleToggleWatching = async (app: Application) => {
    if (!app.id) {
      return;
    }

    try {
      await updateApp({
        id: app.id,
        data: {
          ...app,
          watching: !app.watching,
        } as Application,
      });
      enqueueSnackbar(
        app.watching ? 'App removed from watching list' : 'App added to watching list',
        { variant: 'success' },
      );
      await refetch();
    } catch {
      enqueueSnackbar('Failed to update watching status', { variant: 'error' });
    }
  };

  return (
    <AppsPage
      apps={apps ?? undefined}
      loading={isLoadingApps}
      error={error}
      refetch={refetch}
      showOnlyWatching={showOnlyWatching}
      searchQuery={searchQuery}
      setShowOnlyWatching={setShowOnlyWatching}
      setSearchQuery={setSearchQuery}
      openDialog={openDialog}
      openDeleteDialog={confirmDeleteOpen}
      editingApp={editingApp}
      deleteAppId={deleteAppId}
      formData={formData}
      isCreating={isCreating}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      handleOpenDialog={handleOpenDialog}
      handleCloseDialog={handleCloseDialog}
      handleSubmit={handleSubmit}
      handleDeleteClick={handleDeleteClick}
      handleConfirmDelete={handleConfirmDelete}
      handleCancelDelete={handleCancelDelete}
      handleToggleWatching={handleToggleWatching}
      setFormData={setFormData}
    />
  );
};

export default AppsPageContainer;
