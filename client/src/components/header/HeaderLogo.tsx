import React from 'react';
import { Box, Stack, Chip } from '@mui/material';
import { API_BASE_URL } from '@/utils/constants.ts';

const HeaderLogo: React.FC = () => {
    const isDevelopment = API_BASE_URL.startsWith('http://localhost');

    return (
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
            {isDevelopment && (
                <Chip
                    label="DEV"
                    size="small"
                    color="success"
                    sx={{
                        ml: 1,
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                    }}
                />
            )}
        </Stack>
    );
};

export default HeaderLogo;

