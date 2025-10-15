import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { NAVIGATION_ITEMS } from '@/utils/constants';

interface HeaderNavigationProps {
  onNavigate: (path: string) => void;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({ onNavigate }) => {
  const currentPath = window.location.pathname;

  return (
    <List
      sx={{
        display: { xs: 'none', md: 'flex' }, // Hidden on mobile, visible on desktop
        flexDirection: 'row',
        padding: 0,
        gap: 0.5,
        ml: 4,
      }}
    >
      {NAVIGATION_ITEMS.map(item => (
        <ListItem key={item.text} disablePadding sx={{ flex: '1 1 0', minWidth: 200 }}>
          <ListItemButton
            onClick={() => onNavigate(item.path)}
            selected={currentPath === item.path}
            data-testid={`header-nav-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
            sx={{
              textAlign: 'center',
              borderRadius: 1,
              px: 2,
              whiteSpace: 'nowrap',
              width: '100%',
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.875rem',
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default HeaderNavigation;
