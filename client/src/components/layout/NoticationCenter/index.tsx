import React, { useState } from 'react';
import {
    Badge,
    IconButton,
    Menu,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import type { Notification } from '@/types/index.ts';
import { useMarkNotificationAsRead, useDeleteNotification } from '@/hooks';
import { enqueueSnackbar } from 'notistack';
import NotificationMenuHeader from './NotificationMenuHeader.tsx';
import NotificationMenuActions from './NotificationMenuActions.tsx';
import NotificationList from './NotificationList.tsx';

export interface NotificationCenterProps {
    notifications: Notification[] | undefined | null;
    refetchNotifications: () => void;
}

const Index = (props: NotificationCenterProps) => {
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
                <NotificationMenuHeader />
                <NotificationMenuActions
                    unreadCount={unreadCount}
                    notificationsLength={notifications?.length || 0}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onDeleteAll={handleDeleteAll}
                />
                <NotificationList
                    notifications={notifications || []}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                />
            </Menu>
        </>
    );
};

export default Index;
