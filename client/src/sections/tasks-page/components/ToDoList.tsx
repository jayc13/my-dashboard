import React, { useState, useRef } from 'react';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useToggleTodo,
} from '@/hooks';
import {
  Alert,
  Box,
  List,
  Stack,
  Skeleton,
  Typography,
  Divider,
  Collapse,
  IconButton,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { ToDoItem } from '@my-dashboard/types/todos';
import {
  TodoItem,
  TodoFormDialog,
  TodoDeleteDialog,
  TodoQuickAdd,
  TodoStats,
  TodoEmptyState,
  TodoFilters,
  type FilterType,
} from './todo-components';

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
  const [showCompleted, setShowCompleted] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [deletedTodo, setDeletedTodo] = useState<ToDoItem | null>(null);
  const quickAddInputRef = useRef<HTMLInputElement>(null);

  // Snackbar for notifications (using notistack)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [undoSnackbarKey, setUndoSnackbarKey] = useState<string | number | null>(null);

  // SDK hooks
  const { data: toDoListData, loading: isLoadingList, error: todosError, refetch: fetchToDoList } = useTodos({
    refetchInterval: 3 * 60 * 1000, // Refresh every 3 minutes
  });
  const { mutate: createTodo, loading: isCreating } = useCreateTodo();
  const { mutate: updateTodo, loading: isUpdating, error: updateError, reset: resetUpdateError } = useUpdateTodo();
  const { mutate: deleteTodo, loading: isDeleting } = useDeleteTodo();
  const { mutate: toggleTodo, loading: isToggling } = useToggleTodo();

  // Event handlers with optimistic updates
  const handleToggle = async (id: number, checked: boolean) => {
    try {
      await toggleTodo({ id, isCompleted: checked });
      await fetchToDoList();
      enqueueSnackbar(checked ? 'Task completed! 🎉' : 'Task marked as active', { variant: 'success' });
    } catch {
      // Revert on error
      await fetchToDoList();
      enqueueSnackbar('Failed to update task', { variant: 'error' });
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      // Store the todo for undo functionality
      const todoToDelete = toDoListData?.find(t => t.id === deleteId);
      if (todoToDelete) {
        setDeletedTodo(todoToDelete);
      }

      await deleteTodo(deleteId);
      await fetchToDoList();
      setDeleteId(null);

      // Show snackbar with undo action
      const snackbarKey = enqueueSnackbar('Task deleted', {
        variant: 'info',
        autoHideDuration: 6000,
        action: (key) => (
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              handleUndoDelete();
              closeSnackbar(key);
            }}
            sx={{ fontWeight: 'bold' }}
          >
            UNDO
          </Button>
        ),
      });
      setUndoSnackbarKey(snackbarKey);
    }
  };

  const handleUndoDelete = async () => {
    if (deletedTodo) {
      await createTodo({
        title: deletedTodo.title,
        description: deletedTodo.description,
        link: deletedTodo.link,
        dueDate: deletedTodo.dueDate,
        isCompleted: deletedTodo.isCompleted,
      });
      await fetchToDoList();
      setDeletedTodo(null);
      if (undoSnackbarKey) {
        closeSnackbar(undoSnackbarKey);
      }
      enqueueSnackbar('Task restored! ↩️', { variant: 'success' });
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
        enqueueSnackbar('Task updated successfully! ✓', { variant: 'success' });
      } else {
        await createTodo({ ...form, isCompleted: false });
        enqueueSnackbar('Task created successfully! ✓', { variant: 'success' });
      }
      handleClose();
      await fetchToDoList();
    } catch {
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
    enqueueSnackbar('Task added! 🚀', { variant: 'success' });
  };

  // Filter and search todos
  const filteredTodos = (toDoListData || []).filter((todo: ToDoItem) => {
    // Type filter
    if (filterType !== 'all' && !todo.isCompleted) {
      const now = DateTime.now().startOf('day');
      const dueDate = todo.dueDate ? DateTime.fromISO(todo.dueDate).startOf('day') : null;

      if (filterType === 'overdue') {
        if (!dueDate || dueDate >= now) {
          return false;
        }
      } else if (filterType === 'today') {
        if (!dueDate || !dueDate.hasSame(now, 'day')) {
          return false;
        }
      } else if (filterType === 'due-soon') {
        if (!dueDate) {
          return false;
        }
        const diff = dueDate.diff(now, 'days').days;
        if (diff <= 0 || diff > 2) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort todos: non-completed first (with overdue prioritized), then completed
  const sortedToDoList = filteredTodos.slice().sort((a: ToDoItem, b: ToDoItem) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    if (!a.isCompleted && !b.isCompleted) {
      const aHasDue = !!a.dueDate;
      const bHasDue = !!b.dueDate;

      // Prioritize overdue tasks
      if (aHasDue && bHasDue) {
        const now = DateTime.now().startOf('day');
        const aDate = DateTime.fromISO(a.dueDate).startOf('day');
        const bDate = DateTime.fromISO(b.dueDate).startOf('day');
        const aOverdue = aDate < now;
        const bOverdue = bDate < now;

        if (aOverdue !== bOverdue) {
          return aOverdue ? -1 : 1; // Overdue tasks first
        }
        return aDate.toMillis() - bDate.toMillis(); // Then by date
      }

      if (aHasDue !== bHasDue) {
        return aHasDue ? 1 : -1; // Tasks without due dates before those with
      }
    }
    return 0;
  });

  // Separate active and completed todos
  const activeTodos = sortedToDoList.filter((todo: ToDoItem) => !todo.isCompleted);
  const completedTodos = sortedToDoList.filter((todo: ToDoItem) => todo.isCompleted);

  // Calculate filter counts
  const now = DateTime.now().startOf('day');
  const overdueCount = (toDoListData || []).filter(t => {
    if (t.isCompleted || !t.dueDate) {
      return false;
    }
    const dueDate = DateTime.fromISO(t.dueDate).startOf('day');
    return dueDate < now;
  }).length;

  const dueSoonCount = (toDoListData || []).filter(t => {
    if (t.isCompleted || !t.dueDate) {
      return false;
    }
    const dueDate = DateTime.fromISO(t.dueDate).startOf('day');
    const diff = dueDate.diff(now, 'days').days;
    return diff > 0 && diff <= 2;
  }).length;

  const dueTodayCount = (toDoListData || []).filter(t => {
    if (t.isCompleted || !t.dueDate) {
      return false;
    }
    const dueDate = DateTime.fromISO(t.dueDate).startOf('day');
    return dueDate.hasSame(now, 'day');
  }).length;

  return (
    <Box data-testid="todo-widget">
      {todosError && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="todo-error-alert">
          Failed to load todos: {todosError.message}
        </Alert>
      )}

      {/* Statistics Dashboard */}
      {toDoListData && toDoListData.length > 0 && (
        <TodoStats todos={toDoListData}/>
      )}

      {/* Filters */}
      {toDoListData && toDoListData.length > 0 && (
        <TodoFilters
          filterType={filterType}
          onFilterChange={setFilterType}
          overdueCount={overdueCount}
          dueSoonCount={dueSoonCount}
          dueTodayCount={dueTodayCount}
        />
      )}

      <Box data-testid="todo-list">
        {isLoadingList && !toDoListData && (
          <Stack direction="column" spacing={2} data-testid="todo-loading">
            <Skeleton variant="rectangular" height={50}/>
            <Skeleton variant="rectangular" height={50}/>
            <Skeleton variant="rectangular" height={50}/>
          </Stack>
        )}

        {!isLoadingList && sortedToDoList.length === 0 && (
          <TodoEmptyState/>
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
                {showCompleted ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }}/>
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

      <Box sx={{ position: 'relative' }}>
        <TodoQuickAdd
          value={quickTitle}
          isCreating={isCreating}
          onChange={setQuickTitle}
          onSubmit={handleQuickAdd}
          inputRef={quickAddInputRef}
        />
      </Box>

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
