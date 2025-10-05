import type { NavigationItem } from '@/types';

import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  GitHub as GithubIcon,
  Apps as AppsIcon,
} from '@mui/icons-material';

export const WEBSITE_LOGO: string =  '/logo.png';
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_KEY_STORAGE_KEY: string = 'dashboard_api_key';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'E2E Dashboard', icon: <DashboardIcon />, path: '/e2e-dashboard' },
  { text: 'Pull Requests', icon: <GithubIcon />, path: '/pull_requests' },
  { text: 'Apps', icon: <AppsIcon />, path: '/apps' },
];
