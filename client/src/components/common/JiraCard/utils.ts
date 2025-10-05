import { DateTime } from 'luxon';

/**
 * Get color for priority level
 */
export const getPriorityColor = (priority: string): string => {
  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes('highest') || priorityLower.includes('critical')) {
    return '#d32f2f';
  }
  if (priorityLower.includes('high')) {
    return '#f57c00';
  }
  if (priorityLower.includes('medium')) {
    return '#fbc02d';
  }
  if (priorityLower.includes('low')) {
    return '#388e3c';
  }
  return '#757575';
};

/**
 * Get MUI color for status
 */
export const getStatusColor = (
  status: string,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('resolved')) {
    return 'success';
  }
  if (statusLower.includes('progress') || statusLower.includes('review')) {
    return 'primary';
  }
  if (statusLower.includes('blocked')) {
    return 'error';
  }
  if (statusLower.includes('todo') || statusLower.includes('open') || statusLower.includes('backlog')) {
    return 'default';
  }
  return 'info';
};

/**
 * Format date string to relative time
 */
export const getRelativeTime = (dateString: string): string => {
  try {
    return DateTime.fromISO(dateString).toRelative() || dateString;
  } catch {
    return dateString;
  }
};

