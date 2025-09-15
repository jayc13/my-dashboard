import { useEffect, useRef, useState } from 'react';
import { messaging, vapidKey, getToken, onMessage } from '../firebase-config';
import { apiFetch } from '../utils/helpers';
import { API_BASE_URL } from '../utils/constants';

interface FCMHookReturn {
    token: string | null;
    isSupported: boolean;
    isPermissionGranted: boolean;
    requestPermission: () => Promise<boolean>;
    error: string | null;
}

export const useFCM = (): FCMHookReturn => {
    const [token, setToken] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const isInitializedRef = useRef<boolean>(false);

    useEffect(() => {
        // Check if FCM is supported and not already initialized
        if (!isInitializedRef.current && typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging) {
            isInitializedRef.current = true;
            setIsSupported(true);
            initializeFCM().catch(() => {
                console.error('Failed to initialize FCM');
                setError('Failed to initialize Firebase Cloud Messaging');
                isInitializedRef.current = false; // Reset on error so it can be retried
            });
        } else if (!messaging) {
            setError('Firebase Cloud Messaging is not supported in this browser');
        }
    }, []); // Empty dependency array to run only once

    const initializeFCM = async (): Promise<void> => {
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        // Check current permission status
        const permission = Notification.permission;
        setIsPermissionGranted(permission === 'granted');

        if (permission === 'granted') {
            await generateToken();
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
            console.log('Received foreground message:', payload);

            // Show notification manually for foreground messages
            if (payload.notification) {
                new Notification(payload.notification.title || 'New Notification', {
                    body: payload.notification.body,
                    icon: payload.notification.icon || '/logo.png',
                    data: payload.data,
                });
            }
        });
    };

    const generateToken = async () => {
        try {
            if (!vapidKey) {
                throw new Error('VAPID key is not configured');
            }

            // Get the existing service worker registration
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                throw new Error('Service worker not registered');
            }

            const currentToken = await getToken(messaging, {
                vapidKey,
                serviceWorkerRegistration: registration,
            });

            if (currentToken && !token) {
                setToken(currentToken);

                // Register token with server
                await registerTokenWithServer(currentToken);
            } else {
                console.log('No registration token available.');
                setError('Failed to generate FCM token');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token:', err);
            setError('Failed to generate FCM token');
        }
    };

    const registerTokenWithServer = async (fcmToken: string) => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/fcm/register-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: fcmToken }),
            });

            if (!response.ok) {
                console.error('Failed to register token with server');
            }
        } catch (err) {
            console.error('Error registering token with server:', err);
        }
    };

    const requestPermission = async (): Promise<boolean> => {
        try {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';

            setIsPermissionGranted(granted);

            if (granted) {
                await generateToken();
                return true;
            } else {
                setError('Notification permission denied');
                return false;
            }
        } catch (err) {
            console.error('Error requesting permission:', err);
            setError('Failed to request notification permission');
            return false;
        }
    };

    return {
        token,
        isSupported,
        isPermissionGranted,
        requestPermission,
        error,
    };
};
