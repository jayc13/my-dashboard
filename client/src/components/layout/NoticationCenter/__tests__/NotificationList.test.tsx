import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import NotificationList from '../NotificationList';
import type { Notification } from '@/types';

// Mock NotificationListItem
vi.mock('../NotificationListItem', () => ({
    default: ({ notification }: { notification: Notification }) => (
        <div data-testid={`notification-item-${notification.id}`}>
            {notification.title}
        </div>
    ),
}));

describe('NotificationList', () => {
    const mockOnMarkAsRead = vi.fn();
    const mockOnDelete = vi.fn();

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

    it('renders empty state when no notifications', () => {
        render(
            <NotificationList
                notifications={[]}
                onMarkAsRead={mockOnMarkAsRead}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByTestId('empty-notifications')).toBeInTheDocument();
        expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    it('renders notification list when notifications exist', () => {
        render(
            <NotificationList
                notifications={mockNotifications}
                onMarkAsRead={mockOnMarkAsRead}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByTestId('notification-list')).toBeInTheDocument();
        expect(screen.getByTestId('notification-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('notification-item-2')).toBeInTheDocument();
    });

    it('renders all notifications', () => {
        render(
            <NotificationList
                notifications={mockNotifications}
                onMarkAsRead={mockOnMarkAsRead}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
        expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
    });
});

