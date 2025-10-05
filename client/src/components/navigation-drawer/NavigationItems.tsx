import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
} from '@mui/material';
import { NAVIGATION_ITEMS } from '@/utils/constants';

interface NavigationItemsProps {
    onNavigate: (path: string) => void;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({ onNavigate }) => {
    return (
        <List
            sx={{ width: '100%', maxWidth: 360 }}
            component="nav"
            subheader={
                <ListSubheader component="div" sx={{ bgcolor: 'inherit' }}>
                    Dashboard Sections
                </ListSubheader>
            }
        >
            {NAVIGATION_ITEMS.map((item) => (
                <ListItem key={item.text} disablePadding>
                    <ListItemButton
                        onClick={() => onNavigate(item.path)}
                        selected={window.location.pathname === item.path}
                        data-testid={`nav-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
};

export default NavigationItems;

