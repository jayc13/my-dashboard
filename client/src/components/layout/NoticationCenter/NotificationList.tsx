import React from 'react';
import { Stack, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import type { Notification } from '@/types/index.ts';
import NotificationListItem from './NotificationListItem.tsx';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
}) => {
  if (!notifications.length) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        py={4}
        sx={{ color: 'text.secondary' }}
        data-testid="empty-notifications"
      >
        <NotificationsIcon sx={{ fontSize: 48, mb: 1, color: 'divider' }} />
        <Typography variant="body2">No notifications</Typography>
      </Stack>
    );
  }
  return (
    <Stack sx={{ maxHeight: 320, overflowY: 'auto', p: 0 }} data-testid="notification-list">
      {notifications.map(n => (
        <NotificationListItem
          key={n.id}
          notification={n}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
};

export default NotificationList;
