import { Chip } from '@mui/material';

interface LastRunStatusProps {
    status: string;
}

const LastRunStatus = ({ status }: LastRunStatusProps) => {
    const badgeStyle = { fontSize: '12px', lineHeight: '16px', height: '18px', marginLeft: '8px' };
    
    switch (status) {
        case 'success':
            return <Chip color="success" label="Passed" size="small" sx={badgeStyle}/>;
        case 'failed':
            return <Chip color="error" label="Failed" size="small" sx={badgeStyle}/>;
        default:
            return <Chip color="primary" label="Running" size="small" sx={badgeStyle}/>;
    }
};

export default LastRunStatus;

