import React from 'react';
import {
    Home as HomeIcon,
    Dashboard as DashboardIcon,
    GitHub as GithubIcon,
    Apps as AppsIcon,
} from '@mui/icons-material';

export interface NavigationItem {
    text: string;
    icon: React.ReactNode;
    path: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'E2E Dashboard', icon: <DashboardIcon />, path: '/e2e-dashboard' },
    { text: 'Pull Requests', icon: <GithubIcon />, path: '/pull_requests' },
    { text: 'Apps', icon: <AppsIcon />, path: '/apps' },
];

