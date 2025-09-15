import React, { useState } from 'react';
import { DateTime } from 'luxon';
import useSWR from 'swr';
import { API_BASE_URL } from '../../utils/constants';
import { apiFetch } from '../../utils/helpers';
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

interface ToDo {
    id: number;
    title: string;
    description: string;
    link: string;
    due_date: string;
    is_completed: boolean;
}

const ToDoListWidget = () => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        link: '',
        due_date: '',
    });
    // New state for editing
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [quickTitle, setQuickTitle] = useState('');

    const {
        data: toDoListData,
        isLoading: isLoadingList,
        mutate: fetchToDoList,
    } = useSWR(`${API_BASE_URL}/api/to_do_list`, {
        refreshInterval: 3 * 60 * 1000, // Refresh every 10 minutes
    });

    const handleToggle = async (id: number, checked: boolean) => {
        await apiFetch(`${API_BASE_URL}/api/to_do_list/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: checked }),
        });
        await fetchToDoList();
    };

    const handleDelete = async (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId !== null) {
            await apiFetch(`${API_BASE_URL}/api/to_do_list/${deleteId}`, { method: 'DELETE' });
            await fetchToDoList();
            setDeleteId(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteId(null);
    };

    // Open modal for editing, prefill form
    const handleEditOpen = (todo: ToDo) => {
        setEditId(todo.id);
        setForm({
            title: todo.title || '',
            description: todo.description || '',
            link: todo.link || '',
            due_date: todo.due_date ? todo.due_date.slice(0, 10) : '',
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditId(null);
        setForm({ title: '', description: '', link: '', due_date: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editId) {
            await apiFetch(`${API_BASE_URL}/api/to_do_list/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
        } else {
            await apiFetch(`${API_BASE_URL}/api/to_do_list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, is_completed: false }),
            });
        }
        handleClose();
        await fetchToDoList();
    };

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTitle.trim()) {
return;
}
        await apiFetch(`${API_BASE_URL}/api/to_do_list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: quickTitle, is_completed: false }),
        });
        setQuickTitle('');
        await fetchToDoList();
    };

    // Sort: non-completed first, then completed.
    // Non-completed: no due date first, then ascending due date.
    const sortedToDoList = (toDoListData || []).slice().sort((a: ToDo, b: ToDo) => {
        // Completed to the end
        if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1;
        }
        // Only sort non-completed by due date logic
        if (!a.is_completed && !b.is_completed) {
            const aHasDue = !!a.due_date;
            const bHasDue = !!b.due_date;
            if (aHasDue !== bHasDue) {
                // No due date first
                return aHasDue ? 1 : -1;
            }
            if (aHasDue && bHasDue) {
                // Both have due date, sort ascending
                return DateTime.fromISO(a.due_date).toMillis() - DateTime.fromISO(b.due_date).toMillis();
            }
        }
        // Otherwise, keep original order
        return 0;
    });

    return (
        <Box>
            <List sx={{ padding: 0 }}>
                {isLoadingList &&
                    <Stack direction="column" spacing={2}>
                        <Skeleton variant="rectangular" height={50}/>
                        <Skeleton variant="rectangular" height={50}/>
                        <Skeleton variant="rectangular" height={50}/>
                    </Stack>
                }
                {sortedToDoList.map((todo: ToDo) => (
                    <ListItem
                        key={todo.id}
                        component={Card}
                        sx={{
                            mb: 1,
                            backgroundColor: todo.is_completed ? 'rgba(0, 128, 0, 0.1)' : 'background.paper',
                        }}
                        variant="outlined"
                        secondaryAction={
                            <Box>
                                {todo.link && (
                                    <Tooltip title="Open Link">
                                        <IconButton
                                            href={todo.link}
                                            target="_blank"
                                            rel="noopener"
                                            size="small"
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
                                    >
                                        <EditIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleDelete(todo.id)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        }
                    >
                        <Checkbox
                            edge="start"
                            checked={todo.is_completed}
                            tabIndex={-1}
                            disableRipple
                            onChange={(_, checked) => handleToggle(todo.id, checked)}
                        />
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center">
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            textDecoration: todo.is_completed ? 'line-through' : undefined,
                                            fontWeight: todo.is_completed ? 'normal' : 'bold',
                                            mr: 1,
                                        }}
                                    >
                                        {todo.title}
                                    </Typography>
                                    {todo.due_date && (
                                        <Typography
                                            variant="caption"
                                            color={
                                                DateTime.fromISO(todo.due_date) < DateTime.now() && !todo.is_completed
                                                    ? 'error'
                                                    : 'text.secondary'
                                            }
                                        >
                                            {DateTime.fromISO(todo.due_date).toFormat('yyyy-MM-dd')}
                                        </Typography>
                                    )}
                                </Box>
                            }
                            secondary={
                                todo.description && (
                                    <Box sx={{ mt: 0.5 }}>
                                        {todo.description}
                                    </Box>
                                )
                            }
                        />
                    </ListItem>
                ))}
                {!sortedToDoList.length && !isLoadingList && (
                    <Alert severity="info">No To-Dos yet</Alert>
                )}
            </List>
            <Box component="form" onSubmit={handleQuickAdd} display="flex" alignItems="center" mt={2}>
                <TextField
                    label="New ToDo"
                    value={quickTitle}
                    onChange={e => setQuickTitle(e.target.value)}
                    size="small"
                    fullWidth
                    required
                    sx={{ mr: 1 }}
                />
                <Button type="submit" variant="contained" color="primary" disabled={!quickTitle.trim()}>
                    <AddIcon />
                </Button>
            </Box>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit To-Do' : 'Add To-Do'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            fullWidth
                            required
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
                        />
                        <TextField
                            margin="dense"
                            label="Link"
                            name="link"
                            value={form.link}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            margin="dense"
                            label="Due Date"
                            name="due_date"
                            type="date"
                            value={form.due_date}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">{editId ? 'Save' : 'Add'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog
                open={deleteId !== null}
                onClose={handleCancelDelete}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete To-Do</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this to-do item?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ToDoListWidget;
