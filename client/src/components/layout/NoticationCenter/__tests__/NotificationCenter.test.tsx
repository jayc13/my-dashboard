import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NotificationCenter from '../index';
import type { Notification } from '@/types';

// Mock the hooks
const mockMarkAsRead = vi.fn();
const mockDeleteNotification = vi.fn();

vi.mock('@/hooks', () => ({
    useMarkNotificationAsRead: vi.fn(() => ({
        mutate: mockMarkAsRead,
    })),
    useDeleteNotification: vi.fn(() => ({
        mutate: mockDeleteNotification,
    })),
}));

// Mock notistack
vi.mock('notistack', () => ({
    enqueueSnackbar: vi.fn(),
}));

import { enqueueSnackbar } from 'notistack';

describe('NotificationCenter', () => {
    const mockRefetch = vi.fn();

    const mockNotifications: Notification[] = [
        {
            id: 1,
            title: 'Test Notification 1',
            message: 'Test message 1',
            isRead: false,
            createdAt: '2024-01-01T00:00:00Z',
        },
        {
            id: 2,
            title: 'Test Notification 2',
            message: 'Test message 2',
            isRead: true,
            createdAt: '2024-01-02T00:00:00Z',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders notification icon with badge', () => {
        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        expect(screen.getByTestId('notification-icon')).toBeInTheDocument();
        expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    });

    it('shows correct unread count', () => {
        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const badge = screen.getByTestId('notification-badge');
        expect(badge).toHaveTextContent('1'); // Only 1 unread notification
    });

    it('opens notification menu on click', async () => {
        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            expect(screen.getByTestId('notification-menu')).toBeInTheDocument();
        });

        expect(mockRefetch).toHaveBeenCalled();
    });

    it('displays notifications in the menu', async () => {
        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
            expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
        });
    });

    it('shows empty state when no notifications', async () => {
        render(
            <NotificationCenter
                notifications={[]}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            expect(screen.getByTestId('empty-notifications')).toBeInTheDocument();
            expect(screen.getByText('No notifications')).toBeInTheDocument();
        });
    });

    it('marks notification as read', async () => {
        mockMarkAsRead.mockResolvedValue({});

        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            const markAsReadButton = screen.getByTestId('mark-as-read-1');
            fireEvent.click(markAsReadButton);
        });

        await waitFor(() => {
            expect(mockMarkAsRead).toHaveBeenCalledWith(1);
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('handles mark as read error', async () => {
        mockMarkAsRead.mockRejectedValue(new Error('Failed'));

        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            const markAsReadButton = screen.getByTestId('mark-as-read-1');
            fireEvent.click(markAsReadButton);
        });

        await waitFor(() => {
            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Failed to mark notification as read',
                { variant: 'error' },
            );
        });
    });

    it('deletes notification', async () => {
        mockDeleteNotification.mockResolvedValue({});

        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            const deleteButton = screen.getByTestId('delete-notification-2');
            fireEvent.click(deleteButton);
        });

        await waitFor(() => {
            expect(mockDeleteNotification).toHaveBeenCalledWith(2);
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('handles delete error', async () => {
        mockDeleteNotification.mockRejectedValue(new Error('Failed'));

        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            const deleteButton = screen.getByTestId('delete-notification-2');
            fireEvent.click(deleteButton);
        });

        await waitFor(() => {
            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Failed to delete notification',
                { variant: 'error' },
            );
        });
    });

    it('marks all as read', async () => {
        mockMarkAsRead.mockResolvedValue({});

        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            const markAllButton = screen.getByTestId('mark-all-as-read');
            fireEvent.click(markAllButton);
        });

        await waitFor(() => {
            expect(mockMarkAsRead).toHaveBeenCalled();
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('deletes all notifications', async () => {
        mockDeleteNotification.mockResolvedValue({});

        render(
            <NotificationCenter
                notifications={mockNotifications}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        fireEvent.click(icon);

        await waitFor(() => {
            const deleteAllButton = screen.getByTestId('delete-all');
            fireEvent.click(deleteAllButton);
        });

        await waitFor(() => {
            expect(mockDeleteNotification).toHaveBeenCalled();
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('handles null notifications', () => {
        render(
            <NotificationCenter
                notifications={null}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        expect(icon).toBeInTheDocument();
    });

    it('handles undefined notifications', () => {
        render(
            <NotificationCenter
                notifications={undefined}
                refetchNotifications={mockRefetch}
            />,
        );

        const icon = screen.getByTestId('notification-icon');
        expect(icon).toBeInTheDocument();
    });
});

