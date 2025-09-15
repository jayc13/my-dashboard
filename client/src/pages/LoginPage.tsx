import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/useAuth';
import { WEBSITE_LOGO } from '../utils/constants';

const LoginPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API Security Key is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(apiKey.trim());
      
      if (!result.success) {
        setError(result.error || 'Authentication failed');
      }
      // If successful, the AuthContext will handle the redirect
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    if (error) {
      setError(''); // Clear error when user starts typing
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              {/* Logo */}
              <Box
                component="img"
                src={WEBSITE_LOGO}
                alt="Dashboard Logo"
                sx={{
                  height: 64,
                  width: 64,
                  objectFit: 'contain',
                }}
              />

              {/* Title */}
              <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
                Dashboard Login
              </Typography>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Enter your API Security Key to access the dashboard
              </Typography>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: '100%' }}
              >
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="API Security Key"
                    type="password"
                    value={apiKey}
                    onChange={handleKeyChange}
                    variant="outlined"
                    required
                    disabled={isSubmitting}
                    autoFocus
                    placeholder="Enter your API security key"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || !apiKey.trim()}
                    sx={{ py: 1.5 }}
                  >
                    {isSubmitting ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Validating...</span>
                      </Stack>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </Stack>
              </Box>

              <Typography variant="caption" color="text.secondary" textAlign="center">
                Contact your administrator if you don't have an API key
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
