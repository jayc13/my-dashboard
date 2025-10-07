import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useToggleTodo } from '@/hooks';
import { Alert, Box, List, Stack, Skeleton, Typography, Divider, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { ToDoItem } from '@my-dashboard/types/todos';
import { TodoItem, TodoFormDialog, TodoDeleteDialog, TodoQuickAdd } from './todo-components';

const ToDoListWidget = () => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        link: '',
        dueDate: '',
    });
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [quickTitle, setQuickTitle] = useState('');
    const [showCompleted, setShowCompleted] = useState(true);

    // SDK hooks
    const { data: toDoListData, loading: isLoadingList, error: todosError, refetch: fetchToDoList } = useTodos({
        refetchInterval: 3 * 60 * 1000, // Refresh every 3 minutes
    });
    const { mutate: createTodo, loading: isCreating } = useCreateTodo();
    const { mutate: updateTodo, loading: isUpdating, error: updateError, reset: resetUpdateError } = useUpdateTodo();
    const { mutate: deleteTodo, loading: isDeleting } = useDeleteTodo();
    const { mutate: toggleTodo, loading: isToggling } = useToggleTodo();

    // Event handlers
    const handleToggle = async (id: number, checked: boolean) => {
        await toggleTodo({ id, isCompleted: checked });
        await fetchToDoList();
    };

    const handleDelete = (id: number) => {
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
        resetUpdateError(); // Clear any previous errors
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateTodo({ id: editId, data: form });
            } else {
                await createTodo({ ...form, isCompleted: false });
            }
            handleClose();
            await fetchToDoList();
        } catch (error) {
            // Error is already captured by the hook and displayed in the form
            // Don't close the dialog so user can see the error and fix it
        }
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

    // Sort todos: non-completed first (with overdue prioritized), then completed
    const sortedToDoList = (toDoListData || []).slice().sort((a: ToDoItem, b: ToDoItem) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        if (!a.isCompleted && !b.isCompleted) {
            const aHasDue = !!a.dueDate;
            const bHasDue = !!b.dueDate;

            // Prioritize overdue tasks
            if (aHasDue && bHasDue) {
                const now = DateTime.now();
                const aDate = DateTime.fromISO(a.dueDate);
                const bDate = DateTime.fromISO(b.dueDate);
                const aOverdue = aDate < now;
                const bOverdue = bDate < now;

                if (aOverdue !== bOverdue) {
                    return aOverdue ? -1 : 1; // Overdue tasks first
                }
                return aDate.toMillis() - bDate.toMillis(); // Then by date
            }

            if (aHasDue !== bHasDue) {
                return aHasDue ? -1 : 1; // Tasks with due dates before those without
            }
        }
        return 0;
    });

    // Separate active and completed todos
    const activeTodos = sortedToDoList.filter((todo: ToDoItem) => !todo.isCompleted);
    const completedTodos = sortedToDoList.filter((todo: ToDoItem) => todo.isCompleted);

    return (
        <Box data-testid="todo-widget">
            {todosError && (
                <Alert severity="error" sx={{ mb: 2 }} data-testid="todo-error-alert">
                    Failed to load todos: {todosError.message}
                </Alert>
            )}

            <Box data-testid="todo-list">
                {isLoadingList && !toDoListData && (
                    <Stack direction="column" spacing={2} data-testid="todo-loading">
                        <Skeleton variant="rectangular" height={50} />
                        <Skeleton variant="rectangular" height={50} />
                        <Skeleton variant="rectangular" height={50} />
                    </Stack>
                )}

                {!isLoadingList && sortedToDoList.length === 0 && (
                    <Alert severity="info" data-testid="todo-empty-state">
                        No To-Dos yet
                    </Alert>
                )}

                {/* Active Todos Section */}
                {activeTodos.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'bold',
                                    color: 'primary.main',
                                }}
                            >
                                Active Tasks
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    ml: 1.5,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    fontWeight: 'bold',
                                }}
                            >
                                {activeTodos.length}
                            </Typography>
                        </Box>
                        <List sx={{ padding: 0 }}>
                            {activeTodos.map((todo: ToDoItem) => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    isToggling={isToggling}
                                    onToggle={handleToggle}
                                    onEdit={handleEditOpen}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </List>
                    </Box>
                )}

                {/* Completed Todos Section */}
                {completedTodos.length > 0 && (
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                },
                            }}
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'bold',
                                    color: 'success.main',
                                }}
                            >
                                Completed Tasks
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    ml: 1.5,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: 'success.main',
                                    color: 'success.contrastText',
                                    fontWeight: 'bold',
                                }}
                            >
                                {completedTodos.length}
                            </Typography>
                            <IconButton size="small" sx={{ ml: 'auto' }}>
                                {showCompleted ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Collapse in={showCompleted}>
                            <List sx={{ padding: 0 }}>
                                {completedTodos.map((todo: ToDoItem) => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        isToggling={isToggling}
                                        onToggle={handleToggle}
                                        onEdit={handleEditOpen}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </List>
                        </Collapse>
                    </Box>
                )}
            </Box>

            <TodoQuickAdd
                value={quickTitle}
                isCreating={isCreating}
                onChange={setQuickTitle}
                onSubmit={handleQuickAdd}
            />

            <TodoFormDialog
                open={open}
                isUpdating={isUpdating}
                form={form}
                error={updateError}
                onClose={handleClose}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />

            <TodoDeleteDialog
                open={deleteId !== null}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </Box>
    );
};

export default ToDoListWidget;
