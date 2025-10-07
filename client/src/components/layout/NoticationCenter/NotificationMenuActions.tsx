import { Stack, Link } from '@mui/material';
import React from 'react';

interface NotificationMenuActionsProps {
  unreadCount: number;
  notificationsLength: number;
  onMarkAllAsRead: () => void;
  onDeleteAll: () => void;
}

const NotificationMenuActions: React.FC<NotificationMenuActionsProps> = ({ unreadCount, notificationsLength, onMarkAllAsRead, onDeleteAll }) => {
  if (!notificationsLength) {
return null;
}
  return (
    <Stack direction="row" spacing={2} px={2} py={1} justifyContent="flex-end" sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
      {unreadCount > 0 && (
        <Link
          component="button"
          variant="body2"
          underline="hover"
          color="primary"
          sx={{ fontWeight: 500, fontSize: 13, p: 0, m: 0 }}
          onClick={onMarkAllAsRead}
          data-testid="mark-all-as-read"
        >
          Mark all as read
        </Link>
      )}
      <Link
        component="button"
        variant="body2"
        underline="hover"
        color="error"
        sx={{ fontWeight: 500, fontSize: 13, p: 0, m: 0 }}
        onClick={onDeleteAll}
        data-testid="delete-all"
      >
        Delete all
      </Link>
    </Stack>
  );
};

export default NotificationMenuActions;

