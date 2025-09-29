import { useCallback, useEffect, useRef, useState } from 'react';
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

    const registerTokenWithServer = async (fcmToken: string) => {
        await apiFetch(`${API_BASE_URL}/api/fcm/register-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: fcmToken }),
        });
    };

    const generateToken = useCallback(async () => {
        try {
            if (!messaging) {
                throw new Error('Firebase messaging not available');
            }

            if (!vapidKey) {
                throw new Error('VAPID key is not configured');
            }

            // Get the existing service worker registration
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                throw new Error('Service worker not registered');
            }

            const currentToken = await getToken(messaging()!, {
                vapidKey,
                serviceWorkerRegistration: registration,
            });

            if (currentToken && !token) {
                setToken(currentToken);

                // Register token with server
                await registerTokenWithServer(currentToken);
            } else {
                setError('Failed to generate FCM token');
            }
        } catch {
            setError('Failed to generate FCM token');
        }
    }, [token]);

    useEffect(() => {
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
            if (messaging) {
                onMessage(messaging()!, (payload) => {
                    // Show notification manually for foreground messages
                    if (payload.notification) {
                        new Notification(payload.notification.title || 'New Notification', {
                            body: payload.notification.body,
                            icon: payload.notification.icon || '/logo.png',
                            data: payload.data,
                        });
                    }
                });
            }
        };

        // Check if FCM is supported and not already initialized
        if (!isInitializedRef.current && typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging()) {
            isInitializedRef.current = true;
            setIsSupported(true);
            initializeFCM().catch(() => {
                setError('Failed to initialize Firebase Cloud Messaging');
                isInitializedRef.current = false; // Reset on error so it can be retried
            });
        } else if (!messaging) {
            setError('Firebase Cloud Messaging is not supported in this browser');
        }
    }, [generateToken]); // Include generateToken in dependency array

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
        } catch {
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
