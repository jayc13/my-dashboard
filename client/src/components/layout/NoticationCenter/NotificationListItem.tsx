import React from 'react';
import { Alert, AlertTitle, IconButton, Stack, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/TaskAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateTime } from 'luxon';
import type { Notification } from '@/types/index.ts';

interface NotificationListItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification: n,
  onMarkAsRead,
  onDelete,
}) => (
  <Stack
    direction="row"
    alignItems="flex-start"
    width="100%"
    spacing={1}
    key={n.id}
    data-testid={`notification-item-${n.id}`}
    sx={{
      position: 'relative',
      px: 2,
      py: 1,
      borderBottom: theme => `1px solid ${theme.palette.divider}`,
      transition: 'background 0.2s',
      '&:hover .notif-delete-btn': { opacity: 1, pointerEvents: 'auto' },
      '& .notif-delete-btn': { opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s' },
    }}
  >
    <Alert
      key={n.id}
      data-testid={`notification-alert-${n.id}`}
      sx={{
        position: 'relative',
        m: 0,
        width: '100%',
        cursor: !n.link ? 'default' : 'pointer',
        boxShadow: n.isRead ? 'none' : '0 2px 8px 0 rgba(25, 118, 210, 0.08)',
        '& .MuiAlert-action': { alignItems: 'center' },
        '& .MuiAlert-message': { width: '100%' },
        pr: 3,
      }}
      variant={n.isRead ? 'outlined' : 'filled'}
      onClick={async e => {
        e.stopPropagation();
        if (!n.link) {
          return;
        }
        if (!n.isRead) {
          await onMarkAsRead(n.id!);
        }
        if (n.link.startsWith('http')) {
          window.open(n.link, '_blank');
        } else {
          window.location.pathname = n.link;
        }
      }}
      action={
        <>
          {!n.isRead && (
            <IconButton
              size="small"
              aria-label="mark as read"
              className="notif-mark-read-btn"
              data-testid={`mark-as-read-${n.id}`}
              onClick={e => {
                e.stopPropagation();
                onMarkAsRead(n.id!);
              }}
            >
              <CheckIcon fontSize="small" data-testid="TaskAltIcon" />
            </IconButton>
          )}
          {n.isRead && (
            <IconButton
              size="small"
              aria-label="delete"
              className="notif-delete-btn"
              data-testid={`delete-notification-${n.id}`}
              onClick={e => {
                e.stopPropagation();
                onDelete(n.id!);
              }}
            >
              <DeleteIcon fontSize="small" data-testid="DeleteIcon" />
            </IconButton>
          )}
        </>
      }
      severity={(n.type as 'info' | 'warning' | 'error' | 'success') || 'info'}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <AlertTitle
          data-testid={`notification-title-${n.id}`}
          sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}
        >
          {n.title}
        </AlertTitle>
        {!n.isRead && (
          <span
            style={{
              position: 'absolute',
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                n.type === 'success'
                  ? '#2e7d32'
                  : n.type === 'error'
                    ? '#d32f2f'
                    : n.type === 'warning'
                      ? '#ed6c02'
                      : '#1976d2',
              right: -2,
              top: -2,
              boxShadow: '0 0 0 2px #fff',
            }}
            aria-label="unread"
          />
        )}
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: 12, mt: 0.5 }}
        data-testid={`notification-time-${n.id}`}
      >
        {DateTime.fromISO(n.createdAt, { zone: 'utc' }).toLocal().toFormat('dd/MM/yyyy HH:mm')}
      </Typography>
      <Typography
        variant="body1"
        color="text.primary"
        sx={{ fontSize: 14, mt: 0.5 }}
        data-testid={`notification-message-${n.id}`}
      >
        {n.message}
      </Typography>
    </Alert>
  </Stack>
);

export default NotificationListItem;
