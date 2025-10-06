import React from 'react';
import { Stack } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { TooltipIconButton } from '../common';
import { ThemeSwitcher } from '../layout/ThemeSwitcher.tsx';
import NotificationCenter from '../layout/NoticationCenter';
import type { Notification } from '@my-dashboard/types';

interface HeaderActionsProps {
    notifications: Notification[] | null | undefined;
    refetchNotifications: () => Promise<void>;
    onMenuClick: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
    notifications,
    refetchNotifications,
    onMenuClick,
}) => {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ marginLeft: 'auto' }}
        >
            <Stack direction="row" alignItems="center">
                <NotificationCenter
                    notifications={notifications}
                    refetchNotifications={refetchNotifications}
                />
                <ThemeSwitcher />
                <TooltipIconButton
                    tooltip="Menu"
                    color="inherit"
                    onClick={onMenuClick}
                    aria-label="open menu"
                    data-testid="menu-button"
                >
                    <MenuIcon />
                </TooltipIconButton>
            </Stack>
        </Stack>
    );
};

export default HeaderActions;

