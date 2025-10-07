import React, { useState } from 'react';
import { DateTime } from 'luxon';
import {
  Card,
  Typography,
  Checkbox,
  ListItem,
  Box,
  Chip,
  Fade,
  Zoom,
  Tooltip,
  Collapse,
} from '@mui/material';
import { TooltipIconButton } from '@/components/common';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { ToDoItem } from '@my-dashboard/types/todos';

interface TodoItemProps {
  todo: ToDoItem;
  isToggling: boolean;
  onToggle: (id: number, checked: boolean) => void;
  onEdit: (todo: ToDoItem) => void;
  onDelete: (id: number) => void;
  isCompact?: boolean;
}

export const TodoItem: React.FC<TodoItemProps> = ({
                                                    todo,
                                                    isToggling,
                                                    onToggle,
                                                    onEdit,
                                                    onDelete,
                                                    isCompact = false,
                                                  }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [expanded, setExpanded] = useState(false);
  // Parse date without time - treat as date only
  const dueDate = todo.dueDate ? DateTime.fromISO(todo.dueDate).startOf('day') : null;
  const now = DateTime.now().startOf('day'); // Compare dates only, not times
  const isOverdue = dueDate && dueDate < now && !todo.isCompleted;
  const isDueSoon = dueDate && dueDate.diff(now, 'days').days <= 1 && dueDate >= now && !todo.isCompleted;

  // Get relative time for due date (days only, no hours/minutes)
  const getRelativeTime = () => {
    if (!dueDate) {
      return null;
    }
    const diffDays = Math.floor(dueDate.diff(now, 'days').days);

    if (isOverdue) {
      const overdueDays = Math.abs(diffDays);
      if (overdueDays === 1) {
        return '1 day overdue';
      } else if (overdueDays > 1) {
        return `${overdueDays} days overdue`;
      }
      return 'Overdue';
    }

    if (diffDays === 0) {
      return 'Today';
    }

    if (diffDays === 1) {
      return 'Tomorrow';
    }

    if (diffDays <= 7) {
      return `in ${diffDays} days`;
    }

    return null;
  };

  // Extract domain from link
  const getLinkDomain = () => {
    if (!todo.link) {
      return null;
    }
    try {
      const url = new URL(todo.link);
      return url.hostname.replace('www.', '');
    } catch {
      return null;
    }
  };

  const relativeTime = getRelativeTime();
  const linkDomain = getLinkDomain();
  const hasLongDescription = todo.description && todo.description.length > 150;

  // Check if item has expandable content
  const hasExpandableContent = todo.description || todo.link;

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
          mb: isCompact ? 1 : 1.5,
          backgroundColor: getBackgroundColor(),
          borderLeft: getBorderColor() ? (isCompact ? '3px solid' : '4px solid') : undefined,
          borderLeftColor: getBorderColor(),
          flexDirection: 'column',
          alignItems: 'stretch',
          p: 0,
        }}
        variant="outlined"
        data-testid={`todo-item-${todo.id}`}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          p: isCompact ? 1.5 : 2,
          pr: isCompact ? 0.5 : 1,
          gap: 0.5,
        }}>
          <Checkbox
            edge="start"
            checked={todo.isCompleted}
            tabIndex={-1}
            disableRipple
            disabled={isToggling}
            onChange={(_, checked) => onToggle(todo.id!, checked)}
            onClick={(e) => e.stopPropagation()}
            data-testid={`todo-checkbox-${todo.id}`}
            sx={{
              mt: isCompact ? -0.25 : 0,
              p: 0.5,
            }}
          />

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              mt: isCompact ? 0.25 : 0.5,
              cursor: hasExpandableContent ? 'pointer' : 'default',
              '&:hover': hasExpandableContent ? {
                '& .expand-indicator': {
                  opacity: 1,
                },
              } : {},
            }}
            onClick={() => {
              if (hasExpandableContent) {
                setCollapsed(!collapsed);
              }
            }}
          >
            {/* Title and Status Row */}
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={isCompact ? 0.5 : 1} mb={0.5}>
              <Typography
                variant={isCompact ? 'body2' : 'body1'}
                sx={{
                  textDecoration: todo.isCompleted ? 'line-through' : undefined,
                  fontWeight: todo.isCompleted ? 'normal' : 600,
                  color: todo.isCompleted ? 'text.secondary' : 'text.primary',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: isCompact ? '0.875rem' : '1rem',
                }}
                data-testid={`todo-title-${todo.id}`}
              >
                {todo.title}
              </Typography>

              {/* Expand/Collapse Indicator */}
              {hasExpandableContent && (
                <Box
                  className="expand-indicator"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    opacity: collapsed ? 0.5 : 1,
                    transition: 'opacity 0.2s ease-in-out',
                    ml: 0.5,
                    gap: 0.25,
                  }}
                >
                  {collapsed ? (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isCompact ? '0.7rem' : '0.75rem',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        See more
                      </Typography>
                      <ExpandMoreIcon sx={{ fontSize: isCompact ? 14 : 16, color: 'text.secondary' }} />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isCompact ? '0.7rem' : '0.75rem',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        See less
                      </Typography>
                      <ExpandLessIcon sx={{ fontSize: isCompact ? 14 : 16, color: 'text.secondary' }} />
                    </>
                  )}
                </Box>
              )}

              {/* Overdue indicator with animation */}
              {isOverdue && (
                <Zoom in={true}>
                  <Chip
                    icon={<WarningAmberIcon sx={{ fontSize: isCompact ? 12 : 14 }}/>}
                    label={isCompact ? 'Late' : 'Overdue'}
                    size="small"
                    color="error"
                    sx={{
                      height: isCompact ? 20 : 22,
                      fontSize: isCompact ? '0.7rem' : '0.75rem',
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
              {isDueSoon && !isCompact && (
                <Zoom in={true}>
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: 14 }}/>}
                    label="Due Soon"
                    size="small"
                    color="warning"
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                </Zoom>
              )}

              {/* Link - Always visible */}
              {linkDomain && !isCompact && (
                <Chip
                  icon={<LinkIcon sx={{ fontSize: 14 }}/>}
                  label={linkDomain}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 22,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(todo.link, '_blank');
                  }}
                />
              )}
            </Box>

            {/* Expandable Content - Due Date and Description */}
            <Collapse in={!collapsed} timeout="auto" unmountOnExit>
              {/* Metadata Row - Due Date */}
              {dueDate && (
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={isCompact ? 0.5 : 1} mb={todo.description ? (isCompact ? 0.5 : 1) : 0}>
                  <Tooltip title={dueDate.toFormat('EEEE, MMMM dd, yyyy')} arrow>
                    <Chip
                      icon={<CalendarTodayIcon sx={{ fontSize: isCompact ? 12 : 14 }}/>}
                      label={
                        <Box component="span">
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            {isCompact ? dueDate.toFormat('MMM dd') : dueDate.toFormat('MMM dd, yyyy')}
                          </Box>
                          {relativeTime && !isCompact && (
                            <Box component="span" sx={{ ml: 0.5, opacity: 0.8 }}>
                              ({relativeTime})
                            </Box>
                          )}
                        </Box>
                      }
                      size="small"
                      variant="outlined"
                      sx={{
                        height: isCompact ? 20 : 24,
                        fontSize: isCompact ? '0.7rem' : '0.75rem',
                        borderColor: isOverdue ? 'error.main' : isDueSoon ? 'warning.main' : 'divider',
                        color: isOverdue ? 'error.main' : isDueSoon ? 'warning.main' : 'text.secondary',
                        backgroundColor: isOverdue ? 'error.lighter' : isDueSoon ? 'warning.lighter' : 'transparent',
                      }}
                      data-testid={`todo-due-date-${todo.id}`}
                    />
                  </Tooltip>
                </Box>
              )}

              {/* Description */}
              {todo.description && !isCompact && (
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: todo.isCompleted ? 'text.disabled' : 'text.secondary',
                      transition: 'color 0.2s ease-in-out',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                    data-testid={`todo-description-${todo.id}`}
                  >
                    {hasLongDescription && !expanded
                      ? `${todo.description.substring(0, 150)}...`
                      : todo.description}
                  </Typography>
                  {hasLongDescription && (
                    <Box
                      component="span"
                      onClick={() => setExpanded(!expanded)}
                      sx={{
                        color: 'primary.main',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        mt: 0.5,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {expanded ? 'Show less' : 'Show more'}
                      {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                    </Box>
                  )}
                </Box>
              )}

              {/* Compact mode: Show truncated description */}
              {todo.description && isCompact && (
                <Typography
                  variant="caption"
                  sx={{
                    color: todo.isCompleted ? 'text.disabled' : 'text.secondary',
                    display: 'block',
                    mt: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  data-testid={`todo-description-${todo.id}`}
                >
                  {todo.description}
                </Typography>
              )}
            </Collapse>
          </Box>

          {/* Action Buttons */}
          <Box
            data-testid={`todo-actions-${todo.id}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: 'flex',
              gap: isCompact ? 0.25 : 0.5,
              mt: isCompact ? 0 : 0.25,
            }}
          >
            <TooltipIconButton
              tooltip="Edit task"
              edge="end"
              aria-label="edit"
              onClick={() => onEdit(todo)}
              size="small"
              data-testid={`todo-edit-button-${todo.id}`}
              sx={{
                p: 0.5,
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.lighter',
                  color: 'primary.dark',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <EditIcon sx={{ fontSize: isCompact ? 16 : 18 }}/>
            </TooltipIconButton>
            <TooltipIconButton
              tooltip="Delete task"
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(todo.id!)}
              size="small"
              data-testid={`todo-delete-button-${todo.id}`}
              sx={{
                p: 0.5,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.lighter',
                  color: 'error.dark',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <DeleteIcon sx={{ fontSize: isCompact ? 16 : 18 }}/>
            </TooltipIconButton>
          </Box>
        </Box>
      </ListItem>
    </Fade>
  );
};

