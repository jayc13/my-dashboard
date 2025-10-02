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
} from '@mui/material';
import { NotificationsOff } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { useFCM } from '@/hooks';

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
    const [isDismissed, setIsDismissed] = useState(false);

    const handleRequestPermission = async () => {
        const granted = await requestPermission();

        if (granted) {
            enqueueSnackbar('Notifications enabled successfully!', {
                persist: true,
                variant: 'success',
            });
            onPermissionGranted?.();
        } else {
            enqueueSnackbar('Notification permission denied. You can enable it later in browser settings.', {
                persist: true,
                variant: 'error',
            });
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

    if (isPermissionGranted || isDismissed) {
        return null;
    }

    if (!isSupported) {
        return (
            <Container maxWidth="xl" sx={{ py: 2 }}>
                <Alert
                  severity="warning"
                  sx={{ mb: 2 }}
                  onClose={() => setIsDismissed(true)}
                >
                    Push notifications are not supported in this browser.
                </Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 2 }} data-testid="permission-error-alert">
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setIsDismissed(true)}>
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
                    <>
                        <Button
                          color="primary"
                          size="small"
                          variant="contained"
                          onClick={handleShowDialog}
                          sx={{ mr: 2 }}
                          data-testid="enable-notifications-btn"
                        >
                            Enable
                        </Button>
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => {
                              setIsDismissed(true);
                          }}
                          data-testid="dismiss-notifications-btn"
                        >
                            Dismiss
                        </Button>
                    </>
                }
                onClose={() => {}}
                sx={{ mb: 2 }}
                data-testid="permission-request-alert"
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
        </Container>
    );
};

export default NotificationPermission;
