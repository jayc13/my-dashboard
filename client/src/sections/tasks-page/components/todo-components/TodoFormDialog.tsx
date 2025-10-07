import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    Box,
} from '@mui/material';
import { APIError } from '@my-dashboard/sdk';
import type { ValidationErrorDetail } from '@my-dashboard/types';

interface TodoFormData {
    title: string;
    description: string;
    link: string;
    dueDate: string;
}

// Helper function to extract error title
const getErrorTitle = (error: APIError | Error): string => {
    // Check if it's an APIError with the new structure
    if (error instanceof APIError) {
        return error.message;
    }
    return error.message || 'Failed to update todo. Please try again.';
};

// Helper function to extract error details
const getErrorDetails = (error?: APIError | Error | null): ValidationErrorDetail[] | null => {
    if (!error) {
        return null;
    }
    // Check if it's an APIError with validation details
    if (error instanceof APIError && error.details) {
        return error.details;
    }
    return null;
};

interface TodoFormDialogProps {
    open: boolean;
    isUpdating: boolean;
    form: TodoFormData;
    error: APIError | Error | null;
    onClose: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const TodoFormDialog: React.FC<TodoFormDialogProps> = ({
    open,
    isUpdating,
    form,
    error,
    onClose,
    onChange,
    onSubmit,
}) => {
    // Extract field errors from the error object
    const fieldErrors = React.useMemo(() => {
        const errors: Record<string, string> = {};
        const details = getErrorDetails(error);
        if (Array.isArray(details)) {
            details.forEach(detail => {
                errors[detail.field] = detail.message;
            });
        }
        return errors;
    }, [error]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            data-testid="todo-form-dialog"
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
                data-testid="todo-form-dialog-title"
                sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                Edit To-Do
            </DialogTitle>
            <form onSubmit={onSubmit} data-testid="todo-form" noValidate>
                <DialogContent sx={{ pt: 3 }}>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            data-testid="todo-form-error-alert"
                        >
                            {getErrorDetails(error) && getErrorDetails(error)!.length > 0 ? (
                                <>
                                    <strong>Validation Error:</strong>
                                    <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                                        {getErrorDetails(error)?.map((detail, index) => (
                                            <li key={index}>
                                                Field <strong>"{detail.field}"</strong> failed: {detail.message}
                                            </li>
                                        ))}
                                    </Box>
                                </>
                            ) : (
                                <strong>{getErrorTitle(error)}</strong>
                            )}
                        </Alert>
                    )}
                    <TextField
                        margin="dense"
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        fullWidth
                        autoFocus
                        error={!!fieldErrors.title}
                        helperText={fieldErrors.title}
                        data-testid="todo-form-title-input"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description (Markdown supported)"
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={8}
                        error={!!fieldErrors.description}
                        helperText={fieldErrors.description}
                        data-testid="todo-form-description-input"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Link"
                        name="link"
                        value={form.link}
                        onChange={onChange}
                        fullWidth
                        placeholder="https://..."
                        error={!!fieldErrors.link}
                        helperText={fieldErrors.link}
                        data-testid="todo-form-link-input"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Due Date"
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={onChange}
                        fullWidth
                        error={!!fieldErrors.dueDate}
                        helperText={fieldErrors.dueDate}
                        InputLabelProps={{ shrink: true }}
                        data-testid="todo-form-due-date-input"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={onClose}
                        disabled={isUpdating}
                        data-testid="todo-form-cancel-button"
                        sx={{ minWidth: 80 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isUpdating}
                        data-testid="todo-form-submit-button"
                        sx={{
                            minWidth: 80,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        {isUpdating ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

