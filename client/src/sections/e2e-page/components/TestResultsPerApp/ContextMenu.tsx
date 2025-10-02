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
import LastRunStatus from './LastRunStatus';
import type { DetailedE2EReportDetail } from '@my-dashboard/types';

interface ContextMenuProps {
    mouseX: number;
    mouseY: number;
    result: DetailedE2EReportDetail;
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
                    {result.app!.name}
                </ListSubheader>
                <Divider/>

                {/* App Details Section */}
                <Box>
                    {loadingAppDetails ? (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={2} padding={2}>
                            <CircularProgress size={32}/>
                        </Box>
                    ) : result.app! ? (
                        <Box>
                            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <strong>E2E Config: </strong>
                                    {result.app!.e2eTriggerConfiguration ? (
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
                                    <strong>Today's Runs:</strong> {result.app!.e2eRunsQuantity || 0}
                                </Typography>
                                {result.app!.lastRun && <Typography variant="body2">
                                    <strong>Last Run Status:</strong>
                                    <LastRunStatus
                                        status={result.app!.lastRun.status}
                                    />
                                    <IconButton onClick={() => onOpenUrl(result.app!.lastRun!.url)}>
                                        <OpenInNewIcon sx={{ fontSize: 18 }}/>
                                    </IconButton>
                                </Typography>}
                            </Box>
                            <MenuList dense>
                                <MenuItem
                                    onClick={() => onOpenUrl(`https://cloud.cypress.io/projects/${result.app!.code}/runs`)}>
                                    <OpenInNewIcon sx={{ mr: 1, fontSize: 20 }}/>
                                    Open in Cypress Cloud
                                </MenuItem>
                                {result.app!.pipelineUrl && (
                                    <MenuItem
                                        onClick={() => onOpenUrl(result.app!.pipelineUrl!)}>
                                        <OpenInNewIcon sx={{ mr: 1, fontSize: 20 }}/>
                                        Open in Pipelines
                                    </MenuItem>
                                )}
                                <Divider/>
                                <MenuItem onClick={onTriggerE2ERuns}
                                          disabled={!result.app!.e2eTriggerConfiguration}>
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

