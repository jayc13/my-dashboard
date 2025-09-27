import React, { useState } from 'react';
import {
    Alert,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
} from '@mui/material';
import { NotificationsOff } from '@mui/icons-material';
import { useFCM } from '../hooks/useFCM';

interface NotificationPermissionProps {
    onPermissionGranted?: () => void;
    onPermissionDenied?: () => void;
}

const NotificationPermission: React.FC<NotificationPermissionProps> = ({
                                                                           onPermissionGranted,
                                                                           onPermissionDenied,
                                                                       }) => {
    const { isSupported, isPermissionGranted, requestPermission, error } = useFCM();
    const [showDialog, setShowDialog] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const handleRequestPermission = async () => {
        const granted = await requestPermission();

        if (granted) {
            setSnackbarMessage('Notifications enabled successfully!');
            setSnackbarSeverity('success');
            setShowSnackbar(true);
            onPermissionGranted?.();
        } else {
            setSnackbarMessage('Notification permission denied. You can enable it later in browser settings.');
            setSnackbarSeverity('error');
            setShowSnackbar(true);
            onPermissionDenied?.();
        }

        setShowDialog(false);
    };

    const handleShowDialog = () => {
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
    };

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    if (isPermissionGranted) {
        return null;
    }

    if (!isSupported) {
        return (
            <Container maxWidth="xl" sx={{ py: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Push notifications are not supported in this browser.
                </Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error with notifications: {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <Alert
                severity="info"
                icon={<NotificationsOff/>}
                action={
                    <Button color="inherit" size="small" onClick={handleShowDialog} data-testid="enable-notifications">
                        Enable
                    </Button>
                }
                sx={{ mb: 2 }}
                data-testid="permission-alert"
            >
                Enable push notifications to receive real-time updates about your dashboard.
            </Alert>

            <Dialog open={showDialog} onClose={handleCloseDialog} data-testid="permission-dialog">
                <DialogTitle>Enable Push Notifications</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Would you like to enable push notifications? This will allow you to receive
                        real-time updates about new tickets, pull requests, and other important
                        dashboard events even when the app is not open.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} data-testid="not-now">
                        Not Now
                    </Button>
                    <Button onClick={handleRequestPermission} variant="contained" data-testid="enable-permission">
                        Enable Notifications
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                data-testid="permission-snackbar"
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default NotificationPermission;
