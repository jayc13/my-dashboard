import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { usePullRequests, useAddPullRequest, useDeletePullRequest } from '@/hooks';
import PullRequestsPage from './PullRequestsPage';

const PullRequestsPageContainer = () => {
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [url, setUrl] = useState('');
    const [urlError, setUrlError] = useState<string | null>(null);

    // SDK hooks
    const { data: pullRequestsData, loading, error, refetch } = usePullRequests({
        refetchOnVisibilityChange: false,
    });
    const { mutate: addPullRequest, loading: isAdding } = useAddPullRequest();
    const { mutate: deletePullRequest, loading: isDeleting } = useDeletePullRequest();

    const handleOpenAddDialog = () => {
        setUrl('');
        setUrlError(null);
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
    };

    const handleAdd = async () => {
        setUrlError(null);

        // Regex to match GitHub PR URL and extract repo and PR number
        const match = url.match(
            /^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)$/,
        );
        if (!match) {
            setUrlError('Invalid GitHub Pull Request URL format.');
            return;
        }
        const repository = match[1];
        const pullRequestNumber = Number(match[2]);

        try {
            await addPullRequest({
                pullRequestNumber,
                repository,
            });
            enqueueSnackbar('Pull request added successfully', { variant: 'success' });
            setOpenAddDialog(false);
            setUrl('');
            await refetch();
        } catch {
            enqueueSnackbar('Failed to add pull request', { variant: 'error' });
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            try {
                await deletePullRequest(deleteId);
                enqueueSnackbar('Pull request deleted successfully', { variant: 'success' });
                await refetch();
            } catch {
                enqueueSnackbar('Failed to delete pull request', { variant: 'error' });
            }
        }
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    return (
        <PullRequestsPage
            pullRequestsData={pullRequestsData ?? undefined}
            loading={loading}
            error={error}
            refetch={refetch}
            openAddDialog={openAddDialog}
            openDeleteDialog={openDeleteDialog}
            deleteId={deleteId}
            url={url}
            urlError={urlError}
            isAdding={isAdding}
            isDeleting={isDeleting}
            handleOpenAddDialog={handleOpenAddDialog}
            handleCloseAddDialog={handleCloseAddDialog}
            handleAdd={handleAdd}
            handleDeleteClick={handleDeleteClick}
            handleConfirmDelete={handleConfirmDelete}
            handleCancelDelete={handleCancelDelete}
            setUrl={setUrl}
            setUrlError={setUrlError}
        />
    );
};

export default PullRequestsPageContainer;

