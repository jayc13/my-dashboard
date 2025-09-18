import { useState } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { DateTime } from 'luxon';
import useSWR from 'swr';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Skeleton, Chip,
} from '@mui/material';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { LuGitPullRequestClosed, LuGitPullRequestArrow } from 'react-icons/lu';
import { FaCodeMerge } from 'react-icons/fa6';
import { apiFetch } from '../utils/helpers';
import type { GithubPullRequestDetails, PullRequest } from '../types';
import { enqueueSnackbar } from 'notistack';


const PRAuthor = ({ author }: { author: GithubPullRequestDetails['author'] }) => {
    if (!author || !author.username || !author.htmlUrl) {
        return null;
    }

    return (
        <Typography
            color="textSecondary"
            variant="subtitle2"
            sx={{
                cursor: 'pointer',
                fontSize: 10,
                mr: 0.5,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {author.avatarUrl && (
                <img
                    src={author.avatarUrl}
                    alt={author.username}
                    style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8 }}
                />
            )}
            {author.username} •
        </Typography>
    );
};

const PullRequestCard = ({ pr, onDelete }: { pr: PullRequest; onDelete: (id: string) => void }) => {
    function isPullRequestApproved(details: GithubPullRequestDetails): boolean {
        return ['clean', 'unstable', 'dirty'].includes(details.mergeableState);
    }

    function getIcon(details: GithubPullRequestDetails) {
        if (details.merged) {
            return <FaCodeMerge color="purple"/>;
        } else if (details.state === 'open' && isPullRequestApproved(details)) {
            return <LuGitPullRequestArrow color="green"/>;
        } else if (details.state === 'open' && !isPullRequestApproved(details)) {
            return <LuGitPullRequestArrow color="orange"/>;
        } else if (details.state === 'closed' && !details.merged) {
            return <LuGitPullRequestClosed color="red"/>;
        } else {
            return <LuGitPullRequestArrow color="grey"/>;
        }
    }

    const {
        data: details,
        isLoading,
    } = useSWR(`${API_BASE_URL}/api/pull_requests/${pr.id}`);

    if (isLoading) {
        return (
            <Skeleton variant="rectangular" width="100%">
                <div style={{ paddingTop: 40, paddingBottom: 40 }}/>
            </Skeleton>
        );
    }

    if (!details) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Typography color="error">Failed to load pull request details.</Typography>
                </CardContent>
            </Card>
        );
    }

    const getRepoPath = () => {
        const match = details.url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/\d+$/);
        if (match) {
            const owner = match[1];
            const repo = match[2];
            return `${owner}/${repo}`;
        }
        return '';
    };

    return (
        <Card
            variant="outlined"
            sx={{ width: '100%', p: 0, borderRadius: 2 }}
        >
            <CardContent style={{ paddingBottom: 8, paddingTop: 8 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box
                        display="flex"
                        flexDirection="column"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => window.open(details.url, '_blank')}
                    >
                        <Typography variant="body2" sx={{ cursor: 'pointer' }}><small>{getRepoPath()}</small></Typography>
                        <Typography variant="body1" sx={{ cursor: 'pointer', mt: 1 }}>
                            {getIcon(details)} <strong>{details.title}</strong>
                        </Typography>
                        <Box sx={{ my: 1 }}>
                            {details.labels.map(({ name }: { name: string }) => (
                                <Chip label={name} variant="outlined" size="small" sx={{ mr: 0.5, fontSize: 10 }}
                                      key={name}/>
                            ))}
                        </Box>
                        <Box display="flex" alignItems="center">
                            <PRAuthor author={details.author}/>
                            <Typography color="textSecondary" variant="subtitle2"
                                        sx={{ cursor: 'pointer', fontSize: 10 }}>
                                Opened on {DateTime.fromISO(details.createdAt).toLocaleString(DateTime.DATE_MED)} •
                                #{details.number}
                            </Typography>
                        </Box>
                    </Box>
                    <div>
                        <IconButton
                            edge="end"
                            aria-label="copy-url"
                            onClick={() => {
                                navigator.clipboard.writeText(details.url);
                                enqueueSnackbar('Pull Request URL copied!', {
                                    variant: 'success',
                                    preventDuplicate: false,
                                });
                            }}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                        >
                            <ContentCopyIcon/>
                        </IconButton>
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => onDelete(pr.id)}
                            color="error"
                            sx={{
                                marginRight: 2,
                                transition: 'color 0.2s',
                                color: 'inherit',
                                '&:hover': {
                                    color: (theme) => theme.palette.error.main,
                                },
                            }}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </div>
                </Box>
            </CardContent>
        </Card>
    );
};

const PullRequestsPage = () => {
        const [open, setOpen] = useState(false);
        const [submitting, setSubmitting] = useState(false);
        const [confirmOpen, setConfirmOpen] = useState(false);
        const [deleteId, setDeleteId] = useState<string | null>(null);
        const [url, setUrl] = useState('');
        const [urlError, setUrlError] = useState<string | null>(null);

        const {
            data: pullRequestsData,
            isLoading: loadingPullRequests,
            mutate: mutatePullRequests,
        } = useSWR(`${API_BASE_URL}/api/pull_requests`);

        const handleOpen = () => {
            setUrl('');
            setUrlError(null);
            setOpen(true);
        };

        const handleClose = () => {
            setOpen(false);
        };

        const handleAdd = async () => {
            setSubmitting(true);
            setUrlError(null);

            // Regex to match GitHub PR URL and extract repo and PR number
            const match = url.match(
                /^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)$/,
            );
            if (!match) {
                setUrlError('Invalid GitHub Pull Request URL format.');
                setSubmitting(false);
                return;
            }
            const repository = match[1];
            const pull_request_number = Number(match[2]);

            await apiFetch(`${API_BASE_URL}/api/pull_requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pull_request_number,
                    repository,
                }),
            });
            setSubmitting(false);
            setOpen(false);
            await mutatePullRequests();
        };

        const handleDeleteClick = (id: string) => {
            setDeleteId(id);
            setConfirmOpen(true);
        };

        const handleConfirmDelete = async () => {
            if (deleteId) {
                await apiFetch(`${API_BASE_URL}/api/pull_requests/${deleteId}`, {
                    method: 'DELETE',
                });
                await mutatePullRequests();
            }
            setConfirmOpen(false);
            setDeleteId(null);
        };

        const handleCancelDelete = () => {
            setConfirmOpen(false);
            setDeleteId(null);
        };

        if (loadingPullRequests) {
            return (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress/>
                </Box>
            );
        }

        return (
            <Box p={3} data-testid="pull-requests-page">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" gutterBottom>
                        Pull Requests
                    </Typography>
                    {
                        pullRequestsData.length > 0 && (
                            <Button variant="contained" color="primary" onClick={handleOpen}>
                                Add Pull Request
                            </Button>
                        )
                    }
                </Box>
                <Grid container spacing={2}>
                    {pullRequestsData.map((pr: PullRequest) => (
                        <Grid key={pr.id} size={{ xs: 12 }}>
                            <PullRequestCard pr={pr} onDelete={handleDeleteClick}/>
                        </Grid>
                    ))}
                    {pullRequestsData.length === 0 && (
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            py={6}
                            sx={{ opacity: 0.7, width: '100%' }}
                        >
                            <Box mb={2}>
                                <TroubleshootIcon sx={{ fontSize: 60, color: 'action.disabled' }}/>
                            </Box>
                            <Typography variant="h6" gutterBottom>
                                No pull requests found
                            </Typography>
                            <Typography color="textSecondary" align="center" sx={{ mb: 2 }}>
                                Add a GitHub pull request to get started.
                            </Typography>
                            <Button variant="outlined" color="primary" onClick={handleOpen}>
                                Add Pull Request
                            </Button>
                        </Box>
                    )}
                </Grid>
                <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                    <DialogTitle>Add Pull Request</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="GitHub Pull Request URL"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setUrlError(null);
                            }}
                            fullWidth
                            margin="normal"
                            disabled={submitting}
                            error={!!urlError}
                            helperText={urlError || 'Example: https://github.com/org/repo/pull/123'}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            variant="contained"
                            color="primary"
                            disabled={!url || submitting}
                        >
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={confirmOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
                    <DialogTitle>Delete Pull Request</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this pull request?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelDelete}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            variant="contained"
                            color="error"
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }
;

export default PullRequestsPage;
