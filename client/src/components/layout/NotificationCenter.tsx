import React, { useState } from 'react';
import {
    Badge,
    IconButton,
    Menu,
    Typography,
    Alert,
    AlertTitle,
    Link,
    Stack,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/TaskAlt';
import type { Notification } from '../../types';
import { DateTime } from 'luxon';
import { useMarkNotificationAsRead, useDeleteNotification } from '../../hooks';
import { enqueueSnackbar } from 'notistack';

export interface NotificationCenterProps {
    notifications: Notification[] | undefined | null;
    refetchNotifications: () => void;
}

const NotificationCenter = (props: NotificationCenterProps) => {
    const {
        notifications = [],
        refetchNotifications,
    } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // SDK hooks
    const { mutate: markAsRead } = useMarkNotificationAsRead();
    const { mutate: deleteNotification } = useDeleteNotification();

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        refetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    async function handleMarkAsRead(notificationId: number, doRefetch: boolean = true) {
        try {
            await markAsRead(notificationId);
            if (doRefetch) {
                refetchNotifications();
            }
        } catch {
            enqueueSnackbar('Failed to mark notification as read', { variant: 'error' });
        }
    }

    async function handleDelete(notificationId: number, doRefetch: boolean = true) {
        try {
            await deleteNotification(notificationId);
            if (doRefetch) {
                refetchNotifications();
            }
        } catch {
            enqueueSnackbar('Failed to delete notification', { variant: 'error' });
        }
    }

    async function handleDeleteAll() {
        if (notifications) {
            await Promise.all(notifications.map(n => handleDelete(n.id!, false)));
            refetchNotifications();
        }
    }

    async function handleMarkAllAsRead() {
        if (notifications) {
            await Promise.all(notifications.map(n => handleMarkAsRead(n.id!, false)));
            refetchNotifications();
        }
    }

    const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen} data-testid="notification-icon">
                <Badge badgeContent={unreadCount} color="error" data-testid="notification-badge">
                    <NotificationsIcon data-testid="NotificationsIcon"/>
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                data-testid="notification-menu"
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 320,
                            maxWidth: 500,
                            maxHeight: 420,
                            borderRadius: 2,
                            boxShadow: 6,
                            p: 0,
                            bgColor: 'background.paper',
                        },
                    },
                }}
                MenuListProps={{
                    sx: { p: 0 },
                }}
            >
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1} sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Notifications
                    </Typography>
                </Stack>
                {/* Actions */}
                {!!notifications && notifications.length > 0 && (
                    <Stack direction="row" spacing={2} px={2} py={1} justifyContent="flex-end" sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
                        {unreadCount > 0 && (
                            <Link
                                component="button"
                                variant="body2"
                                underline="hover"
                                color="primary"
                                sx={{ fontWeight: 500, fontSize: 13, p: 0, m: 0 }}
                                onClick={handleMarkAllAsRead}
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
                            onClick={handleDeleteAll}
                            data-testid="delete-all"
                        >
                            Delete all
                        </Link>
                    </Stack>
                )}
                {/* Notification List */}
                <Stack sx={{ maxHeight: 320, overflowY: 'auto', p: 0 }} data-testid="notification-list">
                    {!notifications || notifications?.length === 0 ? (
                        <Stack alignItems="center" justifyContent="center" py={4} sx={{ color: 'text.secondary' }} data-testid="empty-notifications">
                            <NotificationsIcon sx={{ fontSize: 48, mb: 1, color: 'divider' }} />
                            <Typography variant="body2">No notifications</Typography>
                        </Stack>
                    ) : (
                        notifications.map(n => (
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
                                        '& .MuiAlert-action': {
                                            alignItems: 'center',
                                        },
                                        '& .MuiAlert-message': { width: '100%' },
                                        pr: 3,
                                    }}
                                    variant={n.isRead ? 'outlined' : 'filled'}
                                    onClick={(e) => {
                                        if (n.link) {
                                            e.stopPropagation();
                                            handleMarkAsRead(n.id!);
                                            if (n.link.startsWith('http')) {
                                                window.open(n.link, '_blank');
                                            } else {
                                                window.location.pathname = n.link;
                                            }
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
                                                        handleMarkAsRead(n.id!);
                                                    }}
                                                >
                                                    <CheckIcon fontSize="small" data-testid="TaskAltIcon" />
                                                </IconButton>
                                            )}
                                            {
                                                n.isRead && (
                                                    <IconButton
                                                        size="small"
                                                        aria-label="delete"
                                                        className="notif-delete-btn"
                                                        data-testid={`delete-notification-${n.id}`}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleDelete(n.id!);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" data-testid="DeleteIcon" />
                                                    </IconButton>
                                                )
                                            }
                                        </>
                                    }
                                    severity={n.type as 'info' | 'warning' | 'error' | 'success' || 'info'}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                        <AlertTitle
                                            data-testid={`notification-title-${n.id}`}
                                            sx={{
                                                fontSize: 16,
                                                fontWeight: 600,
                                                color: 'text.primary',
                                            }}
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
                                                    background: n.type === 'success'
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
                                        {(DateTime.fromISO(n.createdAt, { zone: 'utc' }).toLocal()).toFormat('dd/MM/yyyy HH:mm')}
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
                        ))
                    )}
                </Stack>
            </Menu>
        </>
    );
};

export default NotificationCenter;
