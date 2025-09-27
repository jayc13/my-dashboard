import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useToggleTodo } from '../../hooks';
import {
    Alert,
    Card,
    Typography,
    Checkbox,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tooltip,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField, Stack, Skeleton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import type { ToDoItem } from '@my-dashboard/types/todos';

const ToDoListWidget = () => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        link: '',
        dueDate: '',
    });
    // New state for editing
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [quickTitle, setQuickTitle] = useState('');

    // SDK hooks
    const { data: toDoListData, loading: isLoadingList, error: todosError, refetch: fetchToDoList } = useTodos({
        refetchInterval: 3 * 60 * 1000, // Refresh every 3 minutes
    });
    const { mutate: createTodo, loading: isCreating } = useCreateTodo();
    const { mutate: updateTodo, loading: isUpdating } = useUpdateTodo();
    const { mutate: deleteTodo, loading: isDeleting } = useDeleteTodo();
    const { mutate: toggleTodo, loading: isToggling } = useToggleTodo();

    const handleToggle = async (id: number, checked: boolean) => {
        await toggleTodo({ id, isCompleted: checked });
        await fetchToDoList();
    };

    const handleDelete = async (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId !== null) {
            await deleteTodo(deleteId);
            await fetchToDoList();
            setDeleteId(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteId(null);
    };

    // Open modal for editing, prefill form
    const handleEditOpen = (todo: ToDoItem) => {
        setEditId(todo.id!);
        setForm({
            title: todo.title || '',
            description: todo.description || '',
            link: todo.link || '',
            dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : '',
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditId(null);
        setForm({ title: '', description: '', link: '', dueDate: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editId) {
            await updateTodo({ id: editId, data: form });
        } else {
            await createTodo({ ...form, isCompleted: false });
        }
        handleClose();
        await fetchToDoList();
    };

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTitle.trim()) {
            return;
        }
        await createTodo({ title: quickTitle, isCompleted: false });
        setQuickTitle('');
        await fetchToDoList();
    };

    // Sort: non-completed first, then completed.
    // Non-completed: no due date first, then ascending due date.
    const sortedToDoList = (toDoListData || []).slice().sort((a: ToDoItem, b: ToDoItem) => {
        // Completed to the end
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        // Only sort non-completed by due date logic
        if (!a.isCompleted && !b.isCompleted) {
            const aHasDue = !!a.dueDate;
            const bHasDue = !!b.dueDate;
            if (aHasDue !== bHasDue) {
                // No due date first
                return aHasDue ? 1 : -1;
            }
            if (aHasDue && bHasDue) {
                // Both have due date, sort ascending
                return DateTime.fromISO(a.dueDate).toMillis() - DateTime.fromISO(b.dueDate).toMillis();
            }
        }
        // Otherwise, keep original order
        return 0;
    });

    return (
        <Box data-testid="todo-widget">
            {todosError && (
                <Alert severity="error" sx={{ mb: 2 }} data-testid="todo-error-alert">
                    Failed to load todos: {todosError.message}
                </Alert>
            )}
            <List sx={{ padding: 0 }} data-testid="todo-list">
                {isLoadingList &&
                    <Stack direction="column" spacing={2} data-testid="todo-loading">
                        <Skeleton variant="rectangular" height={50}/>
                        <Skeleton variant="rectangular" height={50}/>
                        <Skeleton variant="rectangular" height={50}/>
                    </Stack>
                }
                {sortedToDoList.map((todo: ToDoItem) => (
                    <ListItem
                        key={todo.id}
                        component={Card}
                        sx={{
                            mb: 1,
                            backgroundColor: todo.isCompleted ? 'rgba(0, 128, 0, 0.1)' : 'background.paper',
                        }}
                        variant="outlined"
                        data-testid={`todo-item-${todo.id}`}
                        secondaryAction={
                            <Box data-testid={`todo-actions-${todo.id}`}>
                                {todo.link && (
                                    <Tooltip title="Open Link">
                                        <IconButton
                                            href={todo.link}
                                            target="_blank"
                                            rel="noopener"
                                            size="small"
                                            data-testid={`todo-link-button-${todo.id}`}
                                        >
                                            <LinkIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="Edit">
                                    <IconButton
                                        edge="end"
                                        aria-label="edit"
                                        onClick={() => handleEditOpen(todo)}
                                        size="small"
                                        sx={{ mr: 1 }}
                                        data-testid={`todo-edit-button-${todo.id}`}
                                    >
                                        <EditIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleDelete(todo.id!)}
                                        size="small"
                                        data-testid={`todo-delete-button-${todo.id}`}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        }
                    >
                        <Checkbox
                            edge="start"
                            checked={todo.isCompleted}
                            tabIndex={-1}
                            disableRipple
                            disabled={isToggling}
                            onChange={(_, checked) => handleToggle(todo.id!, checked)}
                            data-testid={`todo-checkbox-${todo.id}`}
                        />
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center">
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            textDecoration: todo.isCompleted ? 'line-through' : undefined,
                                            fontWeight: todo.isCompleted ? 'normal' : 'bold',
                                            mr: 1,
                                        }}
                                        data-testid={`todo-title-${todo.id}`}
                                    >
                                        {todo.title}
                                    </Typography>
                                    {todo.dueDate && (
                                        <Typography
                                            variant="caption"
                                            color={
                                                DateTime.fromISO(todo.dueDate) < DateTime.now() && !todo.isCompleted
                                                    ? 'error'
                                                    : 'text.secondary'
                                            }
                                            data-testid={`todo-due-date-${todo.id}`}
                                        >
                                            {DateTime.fromISO(todo.dueDate).toFormat('yyyy-MM-dd')}
                                        </Typography>
                                    )}
                                </Box>
                            }
                            secondary={
                                todo.description && (
                                    <Box sx={{ mt: 0.5 }} data-testid={`todo-description-${todo.id}`}>
                                        {todo.description}
                                    </Box>
                                )
                            }
                        />
                    </ListItem>
                ))}
                {!sortedToDoList.length && !isLoadingList && (
                    <Alert severity="info" data-testid="todo-empty-state">No To-Dos yet</Alert>
                )}
            </List>
            <Box component="form" onSubmit={handleQuickAdd} display="flex" alignItems="center" mt={2} data-testid="todo-quick-add-form">
                <TextField
                    label="New ToDo"
                    value={quickTitle}
                    onChange={e => setQuickTitle(e.target.value)}
                    size="small"
                    fullWidth
                    required
                    sx={{ mr: 1 }}
                    data-testid="todo-quick-add-input"
                />
                <Button type="submit" variant="contained" color="primary" disabled={!quickTitle.trim() || isCreating} data-testid="todo-quick-add-button">
                    <AddIcon />
                </Button>
            </Box>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth data-testid="todo-form-dialog">
                <DialogTitle data-testid="todo-form-dialog-title">Edit To-Do</DialogTitle>
                <form onSubmit={handleSubmit} data-testid="todo-form">
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            fullWidth
                            required
                            data-testid="todo-form-title-input"
                        />
                        <TextField
                            margin="dense"
                            label="Description (Markdown supported)"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            minRows={2}
                            data-testid="todo-form-description-input"
                        />
                        <TextField
                            margin="dense"
                            label="Link"
                            name="link"
                            value={form.link}
                            onChange={handleChange}
                            fullWidth
                            data-testid="todo-form-link-input"
                        />
                        <TextField
                            margin="dense"
                            label="Due Date"
                            name="dueDate"
                            type="date"
                            value={form.dueDate}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            data-testid="todo-form-due-date-input"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} disabled={isUpdating} data-testid="todo-form-cancel-button">Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isUpdating}
                            data-testid="todo-form-submit-button"
                        >
                            Update
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog
                open={deleteId !== null}
                onClose={handleCancelDelete}
                maxWidth="xs"
                fullWidth
                data-testid="todo-delete-dialog"
            >
                <DialogTitle data-testid="todo-delete-dialog-title">Delete To-Do</DialogTitle>
                <DialogContent>
                    <Typography data-testid="todo-delete-dialog-message">Are you sure you want to delete this to-do item?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} disabled={isDeleting} data-testid="todo-delete-cancel-button">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting} data-testid="todo-delete-confirm-button">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ToDoListWidget;
