import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NotificationPermission from '../NotificationPermission';

const mockRequestPermission = vi.fn();

// Mock the hooks
vi.mock('@/hooks', () => ({
    useFCM: vi.fn(),
}));

// Mock notistack
vi.mock('notistack', () => ({
    enqueueSnackbar: vi.fn(),
}));

describe('NotificationPermission', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders warning when notifications are not supported', async () => {
        const { useFCM } = await import('@/hooks');
        vi.mocked(useFCM).mockReturnValue({
            isSupported: false,
            isPermissionGranted: false,
            requestPermission: mockRequestPermission,
            error: null,
        });

        render(<NotificationPermission />);
        expect(screen.getByText(/Push notifications are not supported/i)).toBeInTheDocument();
    });

    it('renders nothing when permission is already granted', async () => {
        const { useFCM } = await import('@/hooks');
        vi.mocked(useFCM).mockReturnValue({
            isSupported: true,
            isPermissionGranted: true,
            requestPermission: mockRequestPermission,
            error: null,
        });

        const { container } = render(<NotificationPermission />);
        expect(container.firstChild).toBeNull();
    });

    it('renders alert when permission is not granted', async () => {
        const { useFCM } = await import('@/hooks');
        vi.mocked(useFCM).mockReturnValue({
            isSupported: true,
            isPermissionGranted: false,
            requestPermission: mockRequestPermission,
            error: null,
        });

        render(<NotificationPermission />);
        expect(screen.getByText(/Enable push notifications/i)).toBeInTheDocument();
    });

    it('renders error alert when there is an error', async () => {
        const { useFCM } = await import('@/hooks');
        vi.mocked(useFCM).mockReturnValue({
            isSupported: true,
            isPermissionGranted: false,
            requestPermission: mockRequestPermission,
            error: 'Test error',
        });

        render(<NotificationPermission />);
        expect(screen.getByText(/Error with notifications/i)).toBeInTheDocument();
    });

    it('opens dialog when enable button is clicked', async () => {
        const { useFCM } = await import('@/hooks');
        vi.mocked(useFCM).mockReturnValue({
            isSupported: true,
            isPermissionGranted: false,
            requestPermission: mockRequestPermission,
            error: null,
        });

        render(<NotificationPermission />);
        const enableButton = screen.getByTestId('enable-notifications-btn');
        fireEvent.click(enableButton);

        expect(screen.getByText(/Would you like to enable push notifications/i)).toBeInTheDocument();
    });

    it('dismisses alert when dismiss button is clicked', async () => {
        const { useFCM } = await import('@/hooks');
        vi.mocked(useFCM).mockReturnValue({
            isSupported: true,
            isPermissionGranted: false,
            requestPermission: mockRequestPermission,
            error: null,
        });

        render(<NotificationPermission />);
        const dismissButton = screen.getByTestId('dismiss-notifications-btn');
        fireEvent.click(dismissButton);

        // After dismissing, the alert should not be visible
        expect(screen.queryByText(/Enable push notifications/i)).not.toBeInTheDocument();
    });
});

