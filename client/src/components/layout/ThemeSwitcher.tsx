import { useCallback } from 'react';
import { useColorScheme } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SystemModeIcon from '@mui/icons-material/Computer';

const getIcon = (mode: 'light' | 'dark' | 'system' | undefined) => {
    switch (mode) {
        case 'dark':
            return <DarkModeIcon />;
        case 'light':
            return <LightModeIcon />;
        default:
            return <SystemModeIcon />;
    }
};


function getTitle(mode: 'light' | 'dark' | 'system' | undefined) {
    switch (mode) {
        case 'dark':
            return 'Dark mode';
        case 'light':
            return 'Light mode';
        default:
            return 'System mode';
    }
}

function ThemeSwitcher() {
    const { mode, setMode } = useColorScheme();

    const toggleMode = useCallback(() => {
        setMode(mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark');
    }, [mode, setMode]);

    return <Tooltip
        title={ getTitle(mode)}
        enterDelay={1000}
    >
        <div>
            <IconButton
                aria-label={
                    `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`
                }
                onClick={toggleMode}
            >
                {getIcon(mode)}
            </IconButton>
        </div>
    </Tooltip>;
}

export { ThemeSwitcher };