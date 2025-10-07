import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const TodoEmptyState: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(156, 39, 176, 0.03) 100%)',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 3,
        mb: 3,
      }}
    >
      {/* Icon Illustration */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
            },
          }}
        >
          <PlaylistAddCheckIcon
            sx={{
              fontSize: 80,
              color: 'primary.main',
              opacity: 0.8,
            }}
          />
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: '35%',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
              '50%': { opacity: 1, transform: 'scale(1.1)' },
            },
          }}
        >
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 32,
              color: 'success.main',
            }}
          />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: -5,
            left: '35%',
            animation: 'pulse 2s ease-in-out infinite 1s',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
              '50%': { opacity: 1, transform: 'scale(1.1)' },
            },
          }}
        >
          <TrendingUpIcon
            sx={{
              fontSize: 28,
              color: 'warning.main',
            }}
          />
        </Box>
      </Box>

      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 1,
        }}
      >
        No To-Dos yet
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          mb: 3,
          maxWidth: 500,
          mx: 'auto',
        }}
      >
        Start organizing your work by creating your first task below. 
        Track deadlines, add descriptions, and stay on top of your goals!
      </Typography>

      {/* Features List */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 3,
          mt: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 150 }} display="flex" flexDirection="column" alignItems="center">
          <CheckCircleOutlineIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Track Progress
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', maxWidth: 150 }} display="flex" flexDirection="column" alignItems="center">
          <PlaylistAddCheckIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Set Deadlines
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', maxWidth: 150 }} display="flex" flexDirection="column" alignItems="center">
          <TrendingUpIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Stay Organized
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

