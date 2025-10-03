import {
    Alert,
    Box,
    Card,
    CircularProgress,
    Divider,
    IconButton,
    ListSubheader,
    MenuItem,
    MenuList,
    Paper,
    Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LastRunStatus from '../TestResultsPerApp/LastRunStatus.tsx';
import type { AppDetailedE2EReportDetail } from '@my-dashboard/types';

interface ContextMenuProps {
    mouseX: number;
    mouseY: number;
    result?: AppDetailedE2EReportDetail;
    loadingAppDetails: boolean;
    onOpenUrl: (url: string) => void;
    onCopyProjectName: () => void;
    onCopyProjectCode: () => void;
    onTriggerE2ERuns: () => void;
}

const ContextMenu = ({
    mouseX,
    mouseY,
    result,
    loadingAppDetails,
    onOpenUrl,
    onCopyProjectName,
    onCopyProjectCode,
    onTriggerE2ERuns,
}: ContextMenuProps) => {

    if (!result && !loadingAppDetails) {
        return null;
    }

    return (
        <Card
            sx={{
                position: 'absolute',
                top: Math.max(8, Math.min(mouseY, window.innerHeight - 350)),
                left: Math.max(8, Math.min(mouseX, window.innerWidth - 320)),
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
                    {result?.name || 'Loading...'}
                </ListSubheader>
                <Divider/>

                {/* App Details Section */}
                <Box>
                    {loadingAppDetails ? (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={2} padding={2}>
                            <CircularProgress size={32}/>
                        </Box>
                    ) : result ? (
                        <Box>
                            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1,  lineHeight: '34px' }}>
                                    <strong>E2E Config: </strong>
                                    {result.e2eTriggerConfiguration ? (
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
                                <Typography variant="body2" sx={{ lineHeight: '34px' }}>
                                    <strong>Today's Runs:</strong> {result.e2eRunsQuantity || 0}
                                </Typography>
                                {result.lastRun && <Box display="flex" alignItems="center">
                                    <Typography variant="body2">
                                        <strong>Last Run Status:</strong>
                                    </Typography>
                                    <LastRunStatus
                                        status={result.lastRun.status}
                                    />
                                    <IconButton onClick={() => onOpenUrl(result.lastRun!.url)}>
                                        <OpenInNewIcon sx={{ fontSize: 18 }}/>
                                    </IconButton>
                                </Box>}
                            </Box>
                            <MenuList dense>
                                <MenuItem
                                    onClick={() => onOpenUrl(`https://cloud.cypress.io/projects/${result.code}/runs`)}>
                                    <OpenInNewIcon sx={{ mr: 1, fontSize: 20 }}/>
                                    Open in Cypress Cloud
                                </MenuItem>
                                {result.pipelineUrl && (
                                    <MenuItem
                                        onClick={() => onOpenUrl(result.pipelineUrl!)}>
                                        <OpenInNewIcon sx={{ mr: 1, fontSize: 20 }}/>
                                        Open in Pipelines
                                    </MenuItem>
                                )}
                                <Divider/>
                                <MenuItem onClick={onTriggerE2ERuns}
                                          disabled={!result.e2eTriggerConfiguration || result.lastRun?.status === 'running'}>
                                    <RocketLaunchIcon sx={{ mr: 1, fontSize: 20 }}/>
                                    Trigger E2E Runs
                                </MenuItem>
                                <Divider/>
                                <MenuItem onClick={onCopyProjectName}>
                                    <ContentCopyIcon sx={{ mr: 1, fontSize: 20 }}/>
                                    Copy Project Name
                                </MenuItem>
                                <MenuItem onClick={onCopyProjectCode}>
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
    );
};

export default ContextMenu;

