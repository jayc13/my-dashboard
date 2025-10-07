import React, { useState } from 'react';
import { DateTime } from 'luxon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Card,
  Typography,
  Checkbox,
  ListItem,
  Box,
  Chip,
  Fade,
  Tooltip,
  Collapse,
} from '@mui/material';
import { TooltipIconButton } from '@/components/common';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  const [collapsed, setCollapsed] = useState(true);
  // Parse date without time - treat as date only
  const dueDate = todo.dueDate ? DateTime.fromISO(todo.dueDate).startOf('day') : null;
  const now = DateTime.now().startOf('day'); // Compare dates only, not times
  const isOverdue = dueDate && dueDate < now && !todo.isCompleted;
  const isDueToday = dueDate && dueDate.hasSame(now, 'day') && !todo.isCompleted;
  const isDueSoon = dueDate && !todo.isCompleted && (() => {
    const diff = dueDate.diff(now, 'days').days;
    return diff > 0 && diff <= 2;
  })();

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

  // Check if item has expandable content
  const hasExpandableContent = !!todo.description;

  // Calculate background color with smooth transitions
  const getBackgroundColor = () => {
    if (todo.isCompleted) {
      return 'rgba(76, 175, 80, 0.08)'; // Subtle green for completed
    }
    if (isOverdue) {
      return 'rgba(244, 67, 54, 0.08)'; // Subtle red for overdue
    }
    if (isDueToday) {
      return 'rgba(255, 152, 0, 0.08)'; // Subtle orange for due today
    }
    if (isDueSoon) {
      return 'rgba(25, 118, 210, 0.08)'; // Subtle blue for due soon
    }
    return 'background.paper';
  };

  // Border color for visual emphasis
  const getBorderColor = () => {
    if (isOverdue) {
      return 'error.main';
    }
    if (isDueToday) {
      return 'warning.main';
    }
    if (isDueSoon) {
      return 'primary.main';
    }
    return undefined;
  };

  const dueDateColor = isOverdue ? 'error' : isDueToday ? 'warning' : isDueSoon ? 'primary' : 'default';

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
          p: 2,
          pr: 1,
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
              mt: 0,
              p: 0.5,
            }}
          />

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              mt: 0.5,
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
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={0.5}>
              <Typography
                variant="body1"
                sx={{
                  textDecoration: todo.isCompleted ? 'line-through' : undefined,
                  fontWeight: todo.isCompleted ? 'normal' : 600,
                  color: todo.isCompleted ? 'text.secondary' : 'text.primary',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '1rem',
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
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        See more
                      </Typography>
                      <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        See less
                      </Typography>
                      <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </>
                  )}
                </Box>
              )}

              {/* Due Date - Always visible */}
              {dueDate && (
                <Tooltip
                  title={`${dueDate.toFormat('EEEE, MMMM dd, yyyy')} (${relativeTime})`}
                  arrow
                >
                  <Chip
                    label={dueDate.toFormat('MMM dd, yyyy')}
                    size="small"
                    variant="outlined"
                    color={dueDateColor}
                    data-testid={`todo-due-date-${todo.id}`}
                  />
                </Tooltip>
              )}

              {/* Link - Always visible */}
              {linkDomain && (
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

            {/* Expandable Content - Description Only */}
            <Collapse in={!collapsed} timeout="auto" unmountOnExit>

              {/* Description */}
              {todo.description && (
                <Box sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      color: todo.isCompleted ? 'text.disabled' : 'text.secondary',
                      transition: 'color 0.2s ease-in-out',
                      '& p': {
                        margin: 0,
                        marginBottom: 1,
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        '&:last-child': {
                          marginBottom: 0,
                        },
                      },
                      '& ul, & ol': {
                        margin: 0,
                        marginBottom: 1,
                        paddingLeft: 2,
                        fontSize: '0.875rem',
                      },
                      '& li': {
                        marginBottom: 0.5,
                      },
                      '& code': {
                        backgroundColor: 'action.hover',
                        padding: '2px 4px',
                        borderRadius: 0.5,
                        fontSize: '0.8125rem',
                        fontFamily: 'monospace',
                      },
                      '& pre': {
                        backgroundColor: 'action.hover',
                        padding: 1,
                        borderRadius: 1,
                        overflow: 'auto',
                        marginBottom: 1,
                        '& code': {
                          backgroundColor: 'transparent',
                          padding: 0,
                        },
                      },
                      '& a': {
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      },
                      '& blockquote': {
                        borderLeft: '3px solid',
                        borderColor: 'divider',
                        paddingLeft: 1.5,
                        margin: 0,
                        marginBottom: 1,
                        fontStyle: 'italic',
                      },
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        margin: 0,
                        marginBottom: 1,
                        fontWeight: 600,
                      },
                      '& table': {
                        borderCollapse: 'collapse',
                        width: '100%',
                        marginBottom: 1,
                      },
                      '& th, & td': {
                        border: '1px solid',
                        borderColor: 'divider',
                        padding: 0.5,
                        textAlign: 'left',
                      },
                      '& th': {
                        backgroundColor: 'action.hover',
                        fontWeight: 600,
                      },
                    }}
                    data-testid={`todo-description-${todo.id}`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {todo.description}
                    </ReactMarkdown>
                  </Box>
                </Box>
              )}
            </Collapse>
          </Box>

          {/* Action Buttons */}
          <Box
            data-testid={`todo-actions-${todo.id}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: 'flex',
              gap: 0.5,
              mt: 0.25,
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
              <EditIcon sx={{ fontSize: 18 }}/>
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
              <DeleteIcon sx={{ fontSize: 18 }}/>
            </TooltipIconButton>
          </Box>
        </Box>
      </ListItem>
    </Fade>
  );
};

