import { useState } from 'react';
import {
    Card,
    CardContent,
    Grid,
    IconButton,
    Link,
    Stack,
    Typography,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getColorByPassingRate, getLastRunStatusIcon, getTooltipByPassingRate } from './utils';
import type { AppDetailedE2EReportDetail, DetailedE2EReportDetail } from '@my-dashboard/types';

interface ProjectCardProps {
    result: DetailedE2EReportDetail;
    previousValue: DetailedE2EReportDetail | null;
    onUpdate: (projectName: string) => Promise<void>;
    onContextMenu: (event: React.MouseEvent, result: AppDetailedE2EReportDetail) => void;
}

const ProjectCard = ({ result, onUpdate, onContextMenu }: ProjectCardProps) => {
    const [updating, setUpdating] = useState(false);

    const rate = (result.successRate * 100).toFixed(2) + '%';

    const handleContextMenuClick = (event: React.MouseEvent) => {
        onContextMenu(event, result.app!);
    };

    if (!result.app) {
        return null;
    }

    return (
        <Grid size={{ xs: 12 }}>
            <Card
                variant="outlined"
                sx={{ width: '100%', borderRadius: 4 }}
                onContextMenu={handleContextMenuClick}
                data-project-card={result.app.name}
            >
                <CardContent style={{ padding: 8 }}>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack direction="row" alignItems="center" spacing={1}
                                   sx={{ mb: { xs: 1, sm: 0 } }}>
                                <Tooltip
                                    title={`Last updated at ${new Date(result.lastRunAt).toLocaleString()}`}
                                    placement="right"
                                    arrow
                                >
                                    {getLastRunStatusIcon(result.lastRunStatus)}
                                </Tooltip>
                                <Link
                                    href={`https://cloud.cypress.io/projects/${result.app.code}/runs`}
                                    underline="none"
                                    target="_blank"
                                    sx={{
                                        lineHeight: '28px',
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <strong>{result.app.name}</strong>
                                </Link>
                                <Typography variant="body2" sx={{ fontSize: 12 }} color="textSecondary">
                                    {updating ? 'Updating...' : `Last run: ${new Date(result.lastRunAt).toLocaleString()}`}
                                </Typography>
                                <IconButton
                                    size="small"
                                    disabled={updating}
                                    loading={updating}
                                    sx={{ width: 16, height: 16, ml: 1, fontSize: 16 }}
                                    title="Refresh last run status"
                                    onClick={async () => {
                                        setUpdating(true);
                                        await onUpdate(result.app!.name);
                                        setUpdating(false);
                                    }}
                                >
                                    <RefreshIcon sx={{ fontSize: 16 }}/>
                                </IconButton>
                            </Stack>
                        </Grid>
                        <Grid
                            size={{ xs: 12, sm: 6 }}
                            sx={{
                                display: 'flex',
                                justifyContent: { xs: 'space-around', sm: 'space-around' },
                                alignItems: 'center',
                                backgroundColor: 'background.default',
                                borderRadius: 2,
                                width: { sx: '100%', sm: 'auto' },
                                minWidth: { sx: '100%', sm: '260px' },
                                gap: 0,
                            }}
                            style={{
                                padding: '0 8px',
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="start"
                                spacing={2}
                            >
                                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }}/>
                                <Typography variant="subtitle1"
                                            color="success.main">{result.passedRuns}</Typography>
                                <CancelIcon sx={{ color: 'error.main', fontSize: 20 }}/>
                                <Typography variant="subtitle1"
                                            color="error.main">{result.failedRuns}</Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.5}
                                style={{ width: '80px' }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        color: getColorByPassingRate(result.successRate),
                                        fontWeight: 600,
                                    }}
                                >
                                    {rate}
                                </Typography>
                                {getTooltipByPassingRate(result.passedRuns, result.totalRuns, result.successRate)}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default ProjectCard;

