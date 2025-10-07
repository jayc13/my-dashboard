import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
} from '@mui/material';

interface TodoDeleteDialogProps {
    open: boolean;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const TodoDeleteDialog: React.FC<TodoDeleteDialogProps> = ({
    open,
    isDeleting,
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            data-testid="todo-delete-dialog"
            TransitionProps={{
                timeout: 300,
            }}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle
                data-testid="todo-delete-dialog-title"
                sx={{
                    fontWeight: 'bold',
                    color: 'error.main',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                Delete To-Do
            </DialogTitle>
            <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
                <Typography
                    data-testid="todo-delete-dialog-message"
                    sx={{ color: 'text.secondary' }}
                >
                    Are you sure you want to delete this to-do item? This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onCancel}
                    disabled={isDeleting}
                    data-testid="todo-delete-cancel-button"
                    sx={{ minWidth: 80 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={isDeleting}
                    data-testid="todo-delete-confirm-button"
                    sx={{
                        minWidth: 80,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.02)',
                        },
                    }}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

