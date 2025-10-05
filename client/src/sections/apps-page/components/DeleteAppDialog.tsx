import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

export interface DeleteAppDialogProps {
    open: boolean;
    isDeleting: boolean;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

const DeleteAppDialog = (props: DeleteAppDialogProps) => {
    const { open, isDeleting, onConfirm, onCancel } = props;

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth data-testid="delete-app-dialog">
            <DialogTitle>Delete App</DialogTitle>
            <DialogContent>
                <Typography>Are you sure you want to delete this app?</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={isDeleting} data-testid="app-delete-cancel-button">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={isDeleting}
                    data-testid="app-delete-confirm-button"
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteAppDialog;

