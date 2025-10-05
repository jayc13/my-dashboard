import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Close as CloseIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import NavigationItems from './NavigationItems.tsx';

interface NavigationDrawerProps {
    open: boolean;
    onClose: () => void;
    onNavigate: (path: string) => void;
    onLogout: () => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
    open,
    onClose,
    onNavigate,
    onLogout,
}) => {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            data-testid="navigation-drawer"
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
                <IconButton onClick={onClose} size="small" data-testid="sidebar_close-btn">
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />

            <NavigationItems onNavigate={onNavigate} />

            <Divider />

            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={onLogout} data-testid="logout-button">
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default NavigationDrawer;

