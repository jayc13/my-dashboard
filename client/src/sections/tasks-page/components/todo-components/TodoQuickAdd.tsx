import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface TodoQuickAddProps {
    value: string;
    isCreating: boolean;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const TodoQuickAdd: React.FC<TodoQuickAddProps> = ({
    value,
    isCreating,
    onChange,
    onSubmit,
    inputRef,
}) => {
    return (
        <Box
            component="form"
            onSubmit={onSubmit}
            display="flex"
            alignItems="center"
            mt={3}
            sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'action.hover',
                border: '2px dashed',
                borderColor: 'divider',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.selected',
                },
                '&:focus-within': {
                    borderColor: 'primary.main',
                    borderStyle: 'solid',
                    backgroundColor: 'background.paper',
                },
            }}
            data-testid="todo-quick-add-form"
        >
            <TextField
                label="Add a new task..."
                placeholder="What needs to be done?"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                fullWidth
                required
                inputRef={inputRef}
                sx={{
                    mr: 1,
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                    },
                }}
                data-testid="todo-quick-add-input"
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!value.trim() || isCreating}
                sx={{
                    minWidth: 48,
                    height: 40,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05)',
                    },
                }}
                data-testid="todo-quick-add-button"
            >
                <AddIcon />
            </Button>
        </Box>
    );
};

