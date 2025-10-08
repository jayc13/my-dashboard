import React, { useEffect, useState } from 'react';
import { AppBar, Stack, Toolbar } from '@mui/material';
import { useAuth } from '@/contexts/useAuth.ts';
import { useNotifications } from '@/hooks';
import HeaderLogo from './HeaderLogo.tsx';
import HeaderActions from './HeaderActions.tsx';
import NavigationDrawer from '../navigation-drawer/NavigationDrawer.tsx';
import { getAppBarStyles, getToolbarStyles } from './headerStyles.ts';

const Header: React.FC = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: notifications, refetch: refetchNotifications } = useNotifications({
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
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

  return (
    <AppBar color="inherit" position="absolute" sx={getAppBarStyles()}>
      <Toolbar sx={getToolbarStyles()}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <HeaderLogo />
          <HeaderActions
            notifications={notifications}
            refetchNotifications={refetchNotifications}
            onMenuClick={handleSidebarOpen}
          />
        </Stack>
      </Toolbar>

      <NavigationDrawer
        open={sidebarOpen}
        onClose={handleSidebarClose}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />
    </AppBar>
  );
};

export default Header;
