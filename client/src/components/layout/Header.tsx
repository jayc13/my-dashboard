import React, { useEffect, useState } from 'react';
import {
    AppBar, Box, Stack, Toolbar, IconButton, Tooltip,
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, ListSubheader,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home as HomeIcon,
    Dashboard as DashboardIcon,
    GitHub as GithubIcon,
    Logout as LogoutIcon,
    Close as CloseIcon,
    Apps as AppsIcon,
} from '@mui/icons-material';
import useSWR from 'swr';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';
import NotificationCenter from './NotificationCenter';
import { API_BASE_URL } from '../../utils/constants.ts';
import { useAuth } from '../../contexts/useAuth';
import type { Notification } from '../../types';

const Header: React.FC = () => {
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSidebarOpen = () => {
        setSidebarOpen(true);
    };

    const handleSidebarClose = () => {
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        handleSidebarClose();
        logout();
    };

    const handleNavigation = (path: string) => {
        window.location.href = path;
        handleSidebarClose();
    };

    const navigationItems = [
        { text: 'Home', icon: <HomeIcon/>, path: '/' },
        { text: 'E2E Dashboard', icon: <DashboardIcon/>, path: '/e2e-dashboard' },
        { text: 'Pull Requests', icon: <GithubIcon/>, path: '/pull_requests' },
        { text: 'Apps', icon: <AppsIcon/>, path: '/apps' },
    ];

    const {
        data: notifications,
        mutate: refetchNotifications,
    } = useSWR<Notification[]>(`${API_BASE_URL}/api/notifications`, {
        refreshInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    });

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data && event.data.type === 'NEW_NOTIFICATION') {
                    refetchNotifications().catch();
                }
            });
        }
    }, [refetchNotifications]);

    return (
        <AppBar color="inherit" position="absolute" sx={{ displayPrint: 'none' }}>
            <Toolbar sx={{ backgroundColor: 'inherit' }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        flexWrap: 'wrap',
                        width: '100%',
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                    >
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="Logo"
                            sx={{
                                width: 40,
                                height: 40,
                                marginRight: 1,
                            }}
                        />
                        <Box
                            component="span"
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                color: 'text.primary',
                            }}
                        >
                            My Dashboard
                        </Box>
                    </Stack>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ marginLeft: 'auto' }}
                    >
                        <Stack direction="row" alignItems="center">
                            <NotificationCenter notifications={notifications}
                                                refetchNotifications={refetchNotifications}/>
                            <ThemeSwitcher/>
                            <Tooltip title="Menu">
                                <IconButton
                                    color="inherit"
                                    onClick={handleSidebarOpen}
                                    aria-label="open menu"
                                >
                                    <MenuIcon/>
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Stack>
            </Toolbar>

            <Drawer
                anchor="right"
                open={sidebarOpen}
                onClose={handleSidebarClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                        Menu
                    </Typography>
                    <IconButton onClick={handleSidebarClose} size="small" data-testid="sidebar_close-btn">
                        <CloseIcon/>
                    </IconButton>
                </Box>
                <Divider/>

                <List
                    sx={{ width: '100%', maxWidth: 360 }}
                    component="nav"
                    subheader={
                        <ListSubheader component="div" sx={{ bgcolor: 'inherit' }}>
                            Dashboard Sections
                        </ListSubheader>
                    }>

                    {navigationItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                selected={window.location.pathname === item.path}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider/>

                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Logout"/>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
        </AppBar>);
};

export default Header;
