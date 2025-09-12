import React, {useState} from "react";
import {
    Badge,
    IconButton,
    Menu,
    Typography,
    Alert,
    AlertTitle,
    Link,
    Stack
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/TaskAlt";
import {API_BASE_URL} from "../../utils/constants.ts";
import type { Notification } from "../../types";
import {DateTime} from "luxon";
import { apiFetch } from '../../utils/helpers';

export interface NotificationCenterProps {
    notifications: Notification[] | undefined;
    refetchNotifications: () => void;
}

const NotificationCenter = (props: NotificationCenterProps) => {
    const {
        notifications = [],
        refetchNotifications,
    } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    async function handleMarkAsRead(notificationId: number, doRefetch: boolean = true) {
        await apiFetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        if (doRefetch) {
            refetchNotifications();
        }
    }

    async function handleDelete(notificationId: number, doRefetch: boolean = true) {
        await apiFetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (doRefetch) {
            refetchNotifications();
        }
    }

    async function handleDeleteAll() {
        await Promise.all(notifications.map(n => handleDelete(n.id, false)));
        refetchNotifications();
    }

    async function handleMarkAllAsRead() {
        await Promise.all(notifications.map(n => handleMarkAsRead(n.id, false)));
        refetchNotifications();
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon/>
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 320,
                            maxWidth: 500,
                            maxHeight: 420,
                            borderRadius: 2,
                            boxShadow: 6,
                            p: 0,
                            bgColor: "background.paper"
                        }
                    }
                }}
                MenuListProps={{
                    sx: { p: 0 }
                }}
            >
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1} sx={{borderBottom: theme => `1px solid ${theme.palette.divider}`}}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Notifications
                    </Typography>
                </Stack>
                {/* Actions */}
                {!!notifications && notifications.length > 0 && (
                    <Stack direction="row" spacing={2} px={2} py={1} justifyContent="flex-end" sx={{borderBottom: theme => `1px solid ${theme.palette.divider}`}}>
                        {unreadCount > 0 && (
                            <Link
                                component="button"
                                variant="body2"
                                underline="hover"
                                color="primary"
                                sx={{fontWeight: 500, fontSize: 13, p: 0, m: 0}}
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all as read
                            </Link>
                        )}
                        <Link
                            component="button"
                            variant="body2"
                            underline="hover"
                            color="error"
                            sx={{fontWeight: 500, fontSize: 13, p: 0, m: 0}}
                            onClick={handleDeleteAll}
                        >
                            Delete all
                        </Link>
                    </Stack>
                )}
                {/* Notification List */}
                <Stack sx={{maxHeight: 320, overflowY: "auto", p: 0}}>
                    {!notifications || notifications?.length === 0 ? (
                        <Stack alignItems="center" justifyContent="center" py={4} sx={{color: "text.secondary"}}>
                            <NotificationsIcon sx={{fontSize: 48, mb: 1, color: "divider"}} />
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
                                sx={{
                                    position: "relative",
                                    px: 2,
                                    py: 1,

                                    borderBottom: theme => `1px solid ${theme.palette.divider}`,
                                    transition: "background 0.2s",
                                    "&:hover .notif-delete-btn": { opacity: 1, pointerEvents: "auto" },
                                    "& .notif-delete-btn": { opacity: 0, pointerEvents: "none", transition: "opacity 0.2s" }
                                }}
                            >
                                <Alert
                                    key={n.id}
                                    sx={{
                                        position: "relative",
                                        m: 0,
                                        width: "100%",
                                        cursor: !n.link ? "default" : "pointer",
                                        boxShadow: n.read ? "none" : "0 2px 8px 0 rgba(25, 118, 210, 0.08)",
                                        '& .MuiAlert-action': {
                                            alignItems: "center",
                                        },
                                        "& .MuiAlert-message": { width: '100%' },
                                        pr: 3
                                    }}
                                    variant={n.read ? "outlined" : "filled"}
                                    onClick={(e) => {
                                        if (n.link) {
                                            e.stopPropagation();
                                            handleMarkAsRead(n.id);
                                            if (n.link.startsWith("http")) {
                                                window.open(n.link, "_blank");
                                            } else {
                                                window.location.pathname = n.link;
                                            }
                                        }
                                    }}
                                    action={
                                        <>
                                            {!n.read && (
                                                <IconButton
                                                    size="small"
                                                    aria-label="mark as read"
                                                    className="notif-mark-read-btn"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(n.id);
                                                    }}
                                                >
                                                    <CheckIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {
                                                n.read && (
                                                    <IconButton
                                                        size="small"
                                                        aria-label="delete"
                                                        className="notif-delete-btn"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleDelete(n.id);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )
                                            }
                                        </>
                                    }
                                    severity={n.type as "info" | "warning" | "error" | "success" || "info"}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                        <AlertTitle sx={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: "text.primary"
                                        }}>
                                            {n.title}
                                        </AlertTitle>

                                        {!n.read && (
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    display: 'inline-block',
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: n.type === "success"
                                                        ? "#2e7d32"
                                                        : n.type === "error"
                                                        ? "#d32f2f"
                                                        : n.type === "warning"
                                                        ? "#ed6c02"
                                                        : "#1976d2",
                                                    right: -2,
                                                    top: -2,
                                                    boxShadow: '0 0 0 2px #fff',
                                                }}
                                                aria-label="unread"
                                            />
                                        )}
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary" sx={{fontSize: 12, mt: 0.5}}>
                                        {(DateTime.fromSQL(n.created_at, { zone: 'utc' }).toLocal()).toFormat('dd/MM/yyyy HH:mm')}
                                    </Typography>
                                    <Typography variant="body1" color="text.primary" sx={{fontSize: 14, mt: 0.5}}>
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
