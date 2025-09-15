import {
    Alert,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    Tooltip,
} from '@mui/material';
import JiraCard from '../common/JiraCard';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { JiraTicket } from '../../types';


interface ManualTestingProps {
    data: JiraTicket[];
    title: string,
    isLoading?: boolean;
    hasError?: boolean;
    refresh?: () => Promise<void>;
}

const JiraList = (props: ManualTestingProps) => {
    const {
        data = [],
        title = 'Jira Tickets',
        isLoading = true,
        hasError = false,
        refresh = () => Promise.resolve(),
    } = props;

    const JiraListHeader = (props: { size?: number }) => {
        const {
            size = 0,
        } = props;
        return <Grid
            container
            direction="row"
            sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <h2>{title} {
                size > 0 ? `(${size})` : ''
            } </h2>
            <Tooltip title="Refresh">
                <IconButton
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => refresh()}
                >
                    <RefreshIcon/>
                </IconButton>
            </Tooltip>
        </Grid>;
    };

    if (isLoading) {
        return <div>
            <JiraListHeader/>
            <Stack direction="column" spacing={2}>
                <Skeleton variant="rounded" height={115}/>
                <Skeleton variant="rounded" height={115}/>
                <Skeleton variant="rounded" height={115}/>
            </Stack>
        </div>;
    }

    if (hasError) {
        return (
            <div>
                <JiraListHeader/>
                <Alert severity="error" variant="outlined">Error loading tickets</Alert>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div>
                <JiraListHeader/>
                <Alert severity="info" variant="outlined">No tickets found</Alert>
            </div>
        );
    }

    return (
        <div>
            <JiraListHeader size={data.length}/>
            <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                <Stack direction="column" spacing={2}>
                    {data.map(ticket => (
                        <JiraCard ticket={ticket} key={ticket.key}/>
                    ))}
                </Stack>
            </div>
        </div>
    );
};

export default JiraList;