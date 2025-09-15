import { useEffect, useState } from 'react';
import {
    Alert,
    IconButton,
    Card,
    Chip,
    CircularProgress,
    CardContent,
    Grid,
    Link,
    Typography,
    Box,
    Stack,
    Pagination,
    MenuList,
    MenuItem,
    ListSubheader,
    Divider,
    Skeleton,
    Paper,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { enqueueSnackbar } from 'notistack';
import { API_BASE_URL } from '../../utils/constants';
import { apiFetch } from '../../utils/helpers';


interface TestResult {
    lastUpdated: string;
    projectName: string;
    projectCode: string;
    lastRunStatus: 'passed' | 'failed';
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    successRate: number;
}

interface Application {
    id?: number;
    name: string;
    code: string;
    pipeline_url?: string;
    lastRun?: {
        id: number;
        url: string;
        status: string;
        pipelineId: string;
        createdAt: string;
    },
    e2eRunsQuantity: number; // Number of E2E runs - default to 0
    e2e_trigger_configuration?: string;
    watching: boolean;
}

interface TestResultsPerAppProps {
    data: TestResult[];
    isLoading?: boolean;
    refetchData: () => Promise<void>;
}

const getColorByPassingRate = (rate: number) => {
    if (rate >= 0.8) {
return 'green';
}
    if (rate >= 0.5) {
return 'orange';
}
    return 'red';
};

function wantedQuantity(targetRate: number, passedRuns: number, totalRuns: number): number {
    return Math.ceil(((totalRuns * targetRate) - passedRuns) / (1 - targetRate));
}

const getTooltipByPassingRate = (passedRuns: number, totalRuns: number, passingRate: number) => {
    if (passingRate >= 0.9) {
        return <InfoOutlineIcon sx={{ fontSize: 15, visibility: 'hidden' }}/>;
    }

    const runsFor80Percent = wantedQuantity(0.8, passedRuns, totalRuns);
    const runsFor90Percent = wantedQuantity(0.9, passedRuns, totalRuns);

    let tooltipText = <span>
           For 90%: <strong>{runsFor90Percent}</strong> more tests.
        </span>;
    if (runsFor80Percent > 0) {
        tooltipText = <span>
                For 80%: <strong>{runsFor80Percent}</strong> more tests.
            <br/>
            {tooltipText}
            </span>;
    }

    return <Tooltip title={tooltipText} style={{ marginLeft: '4px', cursor: 'pointer' }} placement="left" arrow>
        <InfoOutlineIcon sx={{ fontSize: 15 }}/>
    </Tooltip>;
};

const getLastRunStatusIcon = (status: 'passed' | 'failed') => {
    if (status === 'passed') {
        return <FiberManualRecordIcon sx={{ color: 'green', fontSize: 28 }}/>;
    }
    return <FiberManualRecordIcon sx={{ color: 'red', fontSize: 28 }}/>;
};

const PAGE_SIZE = 10;

const ProjectCard = (props: {
    result: TestResult,
    previousValue: TestResult | null,
    onUpdate: (projectName: string) => Promise<void>,
    onContextMenu: (event: React.MouseEvent, result: TestResult) => void
}) => {
    const { result, onUpdate, onContextMenu } = props;
    const [updating, setUpdating] = useState(false);

    const rate = (result.successRate * 100).toFixed(2) + '%';

    const handleContextMenuClick = (event: React.MouseEvent) => {
        onContextMenu(event, result);
    };

    return (
        <Grid size={{ xs: 12 }}>
            <Card
                variant="outlined"
                sx={{ width: '100%', borderRadius: 4 }}
                onContextMenu={handleContextMenuClick}
                data-project-card={result.projectName}
            >
                <CardContent style={{ padding: 8 }}>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack direction="row" alignItems="center" spacing={1}
                                   sx={{ mb: { xs: 1, sm: 0 } }}>
                                <Tooltip
                                    title={`Last updated at ${new Date(result.lastUpdated).toLocaleString()}`}
                                    placement="right"
                                    arrow
                                >
                                    {getLastRunStatusIcon(result.lastRunStatus)}
                                </Tooltip>
                                <Link
                                    href={`https://cloud.cypress.io/projects/${result.projectCode}/runs`}
                                    underline="none"
                                    target="_blank"
                                    sx={{
                                        lineHeight: '28px',
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <strong>{result.projectName}</strong>
                                </Link>
                                <Typography variant="body2" sx={{ fontSize: 12 }} color="textSecondary">
                                    {updating ? 'Updating...' : `Last run: ${new Date(result.lastUpdated).toLocaleString()}`}
                                </Typography>
                                <IconButton
                                    size="small"
                                    disabled={updating}
                                    loading={updating}
                                    sx={{ width: 16, height: 16, ml: 1, fontSize: 16 }}
                                    title="Refresh last run status"
                                    onClick={async () => {
                                        setUpdating(true);
                                        await onUpdate(result.projectName);
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

function LastRunStatus(props: { status: string }) {
    const badgeStyle = { fontSize: '12px', lineHeight: '16px', height: '18px', marginLeft: '8px' };
    switch (props.status) {
        case 'success':
            return <Chip color="success" label="Passed" size="small" sx={badgeStyle}/>;
        case 'failed':
            return <Chip color="error" label="Failed" size="small" sx={badgeStyle}/>;
        default:
            return <Chip color="primary" label="Running" size="small" sx={badgeStyle}/>;
    }
}

const TestResultsPerApp = (props: TestResultsPerAppProps) => {
    const {
        data = [],
        isLoading = false,
        refetchData,
    } = props;


    const [page, setPage] = useState(1);
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        result: TestResult;
        appDetails: Application | null;
        loadingAppDetails: boolean;
    } | null>(null);

    const fetchAppDetails = async (projectCode: string): Promise<Application | null> => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/apps/code/${projectCode}`);
            return await response.json();
        } catch {
            return null;
        }
    };

    const handleContextMenu = async (event: React.MouseEvent, result: TestResult) => {
        event.preventDefault();

        // Set initial context menu state with loading
        setContextMenu({
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            result,
            appDetails: null,
            loadingAppDetails: true,
        });

        // Fetch app details
        const appDetails = await fetchAppDetails(result.projectCode);

        // Update context menu with app details
        setContextMenu(prev => prev ? {
            ...prev,
            appDetails,
            loadingAppDetails: false,
        } : null);
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleOpenUrlInNewTab = (url: string) => {
        if (contextMenu) {
            window.open(url, '_blank');
            handleCloseContextMenu();
        }
    };

    const handleCopyProjectName = async () => {
        if (contextMenu) {
            await navigator.clipboard.writeText(contextMenu.result.projectName);
            handleCloseContextMenu();
        }
    };

    const handleTriggerE2ERuns = async () => {
        if (contextMenu) {
            const app_id = contextMenu.appDetails?.id;
            if (!app_id) {
                enqueueSnackbar('App ID is missing. Cannot trigger E2E runs.', { variant: 'error' });
                return;
            }
            handleCloseContextMenu();
            try {
                const response = await apiFetch(`${API_BASE_URL}/api/e2e_manual_runs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        app_id,
                    }),
                });

                if (response.ok) {
                    const appName = contextMenu.result.projectName;
                    enqueueSnackbar(`E2E run for ${appName} were triggered successfully!`, { variant: 'success', autoHideDuration: 10 * 1000 });
                } else {
                    const errorData = await response.json();
                    enqueueSnackbar(`Failed to trigger E2E runs: ${errorData.error || response.statusText}`, { variant: 'error' });
                }
            } catch {
                enqueueSnackbar('Failed to trigger E2E runs due to a network error.', { variant: 'error' });
            }
        }
    };

    const handleCopyProjectCode = async () => {
        if (contextMenu) {
            await navigator.clipboard.writeText(contextMenu.result.projectCode);
            handleCloseContextMenu();
        }
    };

    // Handle right-click on different cards to close current menu
    useEffect(() => {
        const handleGlobalContextMenu = (event: MouseEvent) => {
            // Only handle if we have an open context menu
            if (contextMenu) {
                const target = event.target as Element;
                // Check if the right-click is on a different project card
                const clickedCard = target.closest('[data-project-card]');
                const currentCard = document.querySelector(`[data-project-card="${contextMenu.result.projectName}"]`);

                if (clickedCard && clickedCard !== currentCard) {
                    // Right-clicked on a different card, close current menu
                    setContextMenu(null);
                }
            }
        };

        document.addEventListener('mousedown', handleGlobalContextMenu);

        document.addEventListener('contextmenu', handleGlobalContextMenu);

        return () => {
            document.removeEventListener('contextmenu', handleGlobalContextMenu);
        };
    }, [contextMenu]);

    if (isLoading) {
        return (
            <Box sx={{ marginTop: 2 }}>
                <Grid container spacing={1.5}>
                    {[...Array(PAGE_SIZE)].map((_, idx) =>
                        <Grid size={{ xs: 12 }} key={idx}>
                            <Skeleton key={idx} variant="rounded" height={44}/>
                        </Grid>,
                    )}
                </Grid>
            </Box>
        );
    }

    // Filter out apps that don't have failures
    const appsWithFailures = data.filter(app => app.failedRuns > 0);

    if (data.length === 0) {
        return <Card style={{ padding: 24, marginTop: 16 }}>
            <Alert severity="info">No test results available.</Alert>
        </Card>;
    }

    if (appsWithFailures.length === 0) {
        return <Card style={{ padding: 24, marginTop: 16 }}>
            <Alert severity="success">All apps are passing! No failures to display.</Alert>
        </Card>;
    }

    const updateLastRunStatus = async (projectName: string) => {
        await apiFetch(`${API_BASE_URL}/api/e2e_reports/project_status/${projectName}`);
        await refetchData();
    };

    // Pagination logic
    const pageCount = Math.ceil(appsWithFailures.length / PAGE_SIZE);
    // Sort data by successRate ascending before paginating
    const sortedData = [...appsWithFailures].sort((a, b) => a.successRate - b.successRate);
    const paginatedData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <Box sx={{ marginTop: 2 }}>
            <Grid container spacing={1.5}>
                {paginatedData.map((result, idx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + idx;
                    const previousValue = globalIdx > 0 ? sortedData[globalIdx - 1] : null;
                    return <ProjectCard
                        key={idx}
                        result={result}
                        previousValue={previousValue}
                        onUpdate={() => updateLastRunStatus(result.projectName)}
                        onContextMenu={handleContextMenu}
                    />;
                })}
            </Grid>
            {pageCount > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}
            {
                contextMenu && (
                    <Card
                        sx={{
                            position: 'absolute',
                            top: Math.max(8, Math.min(contextMenu.mouseY, window.innerHeight - 350)),
                            left: Math.max(8, Math.min(contextMenu.mouseX, window.innerWidth - 320)),
                            zIndex: 1300,
                            boxShadow: 3,
                            borderRadius: 2,
                            minWidth: 280,
                        }}
                    >
                        <Paper elevation={0}>
                            <ListSubheader sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                lineHeight: '1.5',
                                py: 1,
                                m: 0,
                            }}>
                                {contextMenu?.result?.projectName}
                            </ListSubheader>
                            <Divider/>

                            {/* App Details Section */}
                            <Box>
                                {contextMenu.loadingAppDetails ? (
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={2} padding={2}>
                                        <CircularProgress size={32}/>
                                    </Box>
                                ) : contextMenu.appDetails ? (
                                    <Box>
                                        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <strong>E2E Config: </strong>
                                                {contextMenu.appDetails.e2e_trigger_configuration ? (
                                                    <>
                                                        <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />
                                                        <span style={{ color: 'green' }}>Configured</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CloseIcon sx={{ color: 'error.main', fontSize: 16 }} />
                                                        <span style={{ color: 'red' }}>Not Configured</span>
                                                    </>
                                                )}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Today's Runs:</strong> {contextMenu.appDetails.e2eRunsQuantity || 0}
                                            </Typography>
                                            {contextMenu.appDetails.lastRun && <Typography variant="body2">
                                                <strong>Last Run Status:</strong>
                                                <LastRunStatus
                                                    status={contextMenu.appDetails.lastRun?.status}
                                                />
                                                <IconButton onClick={() => handleOpenUrlInNewTab(contextMenu.appDetails!.lastRun!.url)}>
                                                    <OpenInNewIcon sx={{ fontSize: 18 }}/>
                                                </IconButton>
                                            </Typography>}
                                        </Box>
                                        <MenuList dense>
                                            <MenuItem
                                                onClick={() => handleOpenUrlInNewTab(`https://cloud.cypress.io/projects/${contextMenu.result.projectCode}/runs`)}>
                                                <OpenInNewIcon sx={{ mr: 1, fontSize: 20 }}/>
                                                Open in Cypress Cloud
                                            </MenuItem>
                                            {contextMenu.appDetails.pipeline_url && (
                                                <MenuItem
                                                    onClick={() => handleOpenUrlInNewTab(contextMenu.appDetails!.pipeline_url!)}>
                                                    <OpenInNewIcon sx={{ mr: 1, fontSize: 20 }}/>
                                                    Open in Pipelines
                                                </MenuItem>
                                            )}
                                            <Divider/>
                                            <MenuItem onClick={handleTriggerE2ERuns}
                                                      disabled={!contextMenu.appDetails.e2e_trigger_configuration}>
                                                <RocketLaunchIcon sx={{ mr: 1, fontSize: 20 }}/>
                                                Trigger E2E Runs
                                            </MenuItem>
                                            <Divider/>
                                            <MenuItem onClick={handleCopyProjectName}>
                                                <ContentCopyIcon sx={{ mr: 1, fontSize: 20 }}/>
                                                Copy Project Name
                                            </MenuItem>
                                            <MenuItem onClick={handleCopyProjectCode}>
                                                <ContentCopyIcon sx={{ mr: 1, fontSize: 20 }}/>
                                                Copy Project Code
                                            </MenuItem>
                                        </MenuList>
                                    </Box>
                                ) : (
                                    <Alert severity="error" variant="outlined" style={{ border: 'none' }}>
                                        Failed to load app details
                                    </Alert>
                                )}
                            </Box>
                        </Paper>
                    </Card>
                )
            }
        </Box>
    );
};

export default TestResultsPerApp;