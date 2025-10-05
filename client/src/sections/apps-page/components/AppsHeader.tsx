import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

export interface AppsHeaderProps {
    onAddClick: () => void;
}

const AppsHeader = ({ onAddClick }: AppsHeaderProps) => {
    return (
        <Box display="flex" gap={2} alignItems="center">
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAddClick}
                data-testid="add-app-button"
            >
                Add App
            </Button>
        </Box>
    );
};

export default AppsHeader;

