import { API_BASE_URL } from '@/utils/constants.ts';
import type { Theme } from '@mui/material/styles';

export const isDevelopmentEnvironment = () => {
    return API_BASE_URL.startsWith('http://localhost');
};

export const getAppBarStyles = () => {
    const isDevelopment = isDevelopmentEnvironment();
    
    return {
        displayPrint: 'none',
        ...(isDevelopment && {
            backgroundColor: (theme: Theme) =>
                theme.palette.mode === 'dark'
                    ? '#1a472a' // Dark green for dark mode
                    : '#e8f5e9', // Light green for light mode
        }),
    };
};

export const getToolbarStyles = () => {
    const isDevelopment = isDevelopmentEnvironment();
    
    return {
        backgroundColor: 'inherit',
        ...(isDevelopment && {
            borderBottom: (theme: Theme) =>
                `2px solid ${theme.palette.mode === 'dark' ? '#2e7d32' : '#4caf50'}`,
        }),
    };
};
