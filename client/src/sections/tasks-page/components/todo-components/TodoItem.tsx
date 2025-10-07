import React from 'react';
import { DateTime } from 'luxon';
import {
  Card,
  Typography,
  Checkbox,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Fade,
  Zoom,
} from '@mui/material';
import { TooltipIconButton } from '@/components/common';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { ToDoItem } from '@my-dashboard/types/todos';

interface TodoItemProps {
  todo: ToDoItem;
  isToggling: boolean;
  onToggle: (id: number, checked: boolean) => void;
  onEdit: (todo: ToDoItem) => void;
  onDelete: (id: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
                                                    todo,
                                                    isToggling,
                                                    onToggle,
                                                    onEdit,
                                                    onDelete,
                                                  }) => {
  const dueDate = todo.dueDate ? DateTime.fromISO(todo.dueDate) : null;
  const now = DateTime.now();
  const isOverdue = dueDate && dueDate < now && !todo.isCompleted;
  const isDueSoon = dueDate && dueDate.diff(now, 'days').days <= 1 && dueDate > now && !todo.isCompleted;

  // Calculate background color with smooth transitions
  const getBackgroundColor = () => {
    if (todo.isCompleted) {
      return 'rgba(76, 175, 80, 0.08)'; // Subtle green for completed
    }
    if (isOverdue) {
      return 'rgba(244, 67, 54, 0.08)'; // Subtle red for overdue
    }
    if (isDueSoon) {
      return 'rgba(255, 152, 0, 0.08)'; // Subtle orange for due soon
    }
    return 'background.paper';
  };

  // Border color for visual emphasis
  const getBorderColor = () => {
    if (isOverdue) {
      return 'error.main';
    }
    if (isDueSoon) {
      return 'warning.main';
    }
    return undefined;
  };

  return (
    <Fade in={true} timeout={300}>
      <ListItem
        key={todo.id}
        component={Card}
        sx={{
          mb: 1.5,
          backgroundColor: getBackgroundColor(),
          borderLeft: getBorderColor() ? '4px solid' : undefined,
          borderLeftColor: getBorderColor(),
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: 2,
          },
        }}
        variant="outlined"
        data-testid={`todo-item-${todo.id}`}
        secondaryAction={
          <Box data-testid={`todo-actions-${todo.id}`}>
            {todo.link && (
              <TooltipIconButton
                tooltip="Open Link"
                href={todo.link}
                target="_blank"
                rel="noopener"
                size="small"
                data-testid={`todo-link-button-${todo.id}`}
              >
                <LinkIcon/>
              </TooltipIconButton>
            )}
            <TooltipIconButton
              tooltip="Edit"
              edge="end"
              aria-label="edit"
              onClick={() => onEdit(todo)}
              size="small"
              sx={{ mr: 1 }}
              data-testid={`todo-edit-button-${todo.id}`}
            >
              <EditIcon sx={{ fontSize: 20 }}/>
            </TooltipIconButton>
            <TooltipIconButton
              tooltip="Delete"
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(todo.id!)}
              size="small"
              data-testid={`todo-delete-button-${todo.id}`}
            >
              <DeleteIcon/>
            </TooltipIconButton>
          </Box>
        }
      >
        <Checkbox
          edge="start"
          checked={todo.isCompleted}
          tabIndex={-1}
          disableRipple
          disabled={isToggling}
          onChange={(_, checked) => onToggle(todo.id!, checked)}
          data-testid={`todo-checkbox-${todo.id}`}
        />
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography
                variant="body1"
                sx={{
                  textDecoration: todo.isCompleted ? 'line-through' : undefined,
                  fontWeight: todo.isCompleted ? 'normal' : 'bold',
                  color: todo.isCompleted ? 'text.secondary' : 'text.primary',
                  transition: 'all 0.2s ease-in-out',
                }}
                data-testid={`todo-title-${todo.id}`}
              >
                {todo.title}
              </Typography>

              {/* Overdue indicator with animation */}
              {isOverdue && (
                <Zoom in={true}>
                  <Chip
                    icon={<WarningAmberIcon sx={{ fontSize: 16 }}/>}
                    label="Overdue"
                    size="small"
                    color="error"
                    sx={{
                      height: 24,
                      fontWeight: 'bold',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                      },
                    }}
                  />
                </Zoom>
              )}

              {/* Due soon indicator */}
              {isDueSoon && (
                <Zoom in={true}>
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: 16 }}/>}
                    label="Due Soon"
                    size="small"
                    color="warning"
                    sx={{ height: 24 }}
                  />
                </Zoom>
              )}

              {/* Due date display */}
              {dueDate && (
                <Chip
                  label={dueDate.toFormat('MMM dd, yyyy')}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 24,
                    borderColor: isOverdue ? 'error.main' : isDueSoon ? 'warning.main' : 'divider',
                    color: isOverdue ? 'error.main' : isDueSoon ? 'warning.main' : 'text.secondary',
                    fontWeight: isOverdue || isDueSoon ? 'bold' : 'normal',
                  }}
                  data-testid={`todo-due-date-${todo.id}`}
                />
              )}
            </Box>
          }
          secondary={
            todo.description && (
              <Box
                sx={{
                  mt: 0.5,
                  color: todo.isCompleted ? 'text.disabled' : 'text.secondary',
                  transition: 'color 0.2s ease-in-out',
                }}
                data-testid={`todo-description-${todo.id}`}
              >
                {todo.description}
              </Box>
            )
          }
        />
      </ListItem>
    </Fade>
  );
};

