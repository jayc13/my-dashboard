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
import PRStatusBanner from './PRStatusBanner';

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
    return ['clean', 'unstable'].includes(details.mergeableState);
};

const getIcon = (details: GithubPullRequestDetails) => {
    if (details.merged) {
        return <FaCodeMerge color="purple" />;
    } else if (details.state === 'open' && isPullRequestApproved(details)) {
        return <LuGitPullRequestArrow color="green" />;
    } else if (details.state === 'open' && details.mergeableState === 'dirty') {
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

const getPRAge = (createdAt: string): number => {
    const created = DateTime.fromISO(createdAt);
    const now = DateTime.now();
    return Math.floor(now.diff(created, 'days').days);
};

const getPRAgeColor = (ageInDays: number): 'default' | 'warning' | 'error' => {
    if (ageInDays > 7) {
        return 'error'; // red
    } else if (ageInDays > 3) {
        return 'warning'; // yellow
    }
    return 'default';
};

const PRCard = ({ pr, onDelete }: PRCardProps) => {
    const { data: details, loading: isLoading } = usePullRequestDetails(pr.id);

    // Only show skeleton if loading AND no details exist yet
    if (isLoading && !details) {
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

    // Highlight approved PRs
    const isApproved = details.state === 'open' && isPullRequestApproved(details);

    return (
        <Card
            variant="outlined"
            sx={isApproved ? { border: '2px solid #4caf50', boxShadow: '0 0 10px #4caf5040', padding: 0 } : { padding: 0 }}
            data-testid={`pr-card-${pr.id}`}
        >
            <CardContent
              sx={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}
            >
                <PRStatusBanner details={details} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ padding: 2 }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => window.open(details.url, '_blank')}
                    >
                        <Box display="flex" alignItems="flex-end">
                            <Typography
                              variant="body2"
                              sx={{
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  fontWeight: 'bold',
                                  color: 'primary.main',
                                  mr: 1,
                              }}
                            >
                                #{details.number}
                            </Typography>
                            <Typography variant="body2" sx={{ cursor: 'pointer' }}>
                                <small>{getRepoPath(details.url)}</small>
                            </Typography>
                        </Box>
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
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <PRAuthor author={details.author} />
                            <Typography
                                color="textSecondary"
                                variant="subtitle2"
                                sx={{ cursor: 'pointer', fontSize: 10 }}
                            >
                                Opened on {DateTime.fromISO(details.createdAt).toLocaleString(DateTime.DATE_MED)}
                            </Typography>
                            {getPRAge(details.createdAt) > 0 && (
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        cursor: 'pointer',
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                        color: getPRAgeColor(getPRAge(details.createdAt)) === 'error'
                                            ? 'error.main'
                                            : getPRAgeColor(getPRAge(details.createdAt)) === 'warning'
                                            ? 'warning.main'
                                            : 'text.secondary',
                                        ml: 0.5,
                                    }}
                                >
                                    ({getPRAge(details.createdAt)} {getPRAge(details.createdAt) === 1 ? 'day' : 'days'} old)
                                </Typography>
                            )}
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

