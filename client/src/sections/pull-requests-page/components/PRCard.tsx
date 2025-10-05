import { DateTime } from 'luxon';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Skeleton,
    Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { LuGitPullRequestClosed, LuGitPullRequestArrow } from 'react-icons/lu';
import { FaCodeMerge } from 'react-icons/fa6';
import { enqueueSnackbar } from 'notistack';
import { usePullRequestDetails } from '@/hooks';
import type { PullRequest, GithubPullRequestDetails } from '@/types';

export interface PRCardProps {
    pr: PullRequest;
    onDelete: (id: string) => void;
}

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

const isPullRequestApproved = (details: GithubPullRequestDetails): boolean => {
    return ['clean', 'unstable', 'dirty'].includes(details.mergeableState);
};

const getIcon = (details: GithubPullRequestDetails) => {
    if (details.merged) {
        return <FaCodeMerge color="purple" />;
    } else if (details.state === 'open' && isPullRequestApproved(details)) {
        return <LuGitPullRequestArrow color="green" />;
    } else if (details.state === 'open' && !isPullRequestApproved(details)) {
        return <LuGitPullRequestArrow color="orange" />;
    } else if (details.state === 'closed' && !details.merged) {
        return <LuGitPullRequestClosed color="red" />;
    } else {
        return <LuGitPullRequestArrow color="grey" />;
    }
};

const getRepoPath = (url: string) => {
    const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/\d+$/);
    if (match) {
        const owner = match[1];
        const repo = match[2];
        return `${owner}/${repo}`;
    }
    return '';
};

const PRCard = ({ pr, onDelete }: PRCardProps) => {
    const { data: details, loading: isLoading } = usePullRequestDetails(pr.id);

    if (isLoading) {
        return (
            <Skeleton variant="rectangular" width="100%">
                <div style={{ paddingTop: 40, paddingBottom: 40 }} />
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

    return (
        <Card
            variant="outlined"
            sx={{ width: '100%', p: 0, borderRadius: 2 }}
            data-testid={`pr-card-${pr.id}`}
        >
            <CardContent style={{ paddingBottom: 8, paddingTop: 8 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box
                        display="flex"
                        flexDirection="column"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => window.open(details.url, '_blank')}
                    >
                        <Typography variant="body2" sx={{ cursor: 'pointer' }}>
                            <small>{getRepoPath(details.url)}</small>
                        </Typography>
                        <Typography variant="body1" sx={{ cursor: 'pointer', mt: 1 }}>
                            {getIcon(details)} <strong>{details.title}</strong>
                        </Typography>
                        <Box sx={{ my: 1 }}>
                            {details.labels.map(({ name }: { name: string }) => (
                                <Chip
                                    label={name}
                                    variant="outlined"
                                    size="small"
                                    sx={{ mr: 0.5, fontSize: 10 }}
                                    key={name}
                                />
                            ))}
                        </Box>
                        <Box display="flex" alignItems="center">
                            <PRAuthor author={details.author} />
                            <Typography
                                color="textSecondary"
                                variant="subtitle2"
                                sx={{ cursor: 'pointer', fontSize: 10 }}
                            >
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
                            data-testid={`pr-copy-button-${pr.id}`}
                        >
                            <ContentCopyIcon />
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
                            data-testid={`pr-delete-button-${pr.id}`}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </div>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PRCard;

