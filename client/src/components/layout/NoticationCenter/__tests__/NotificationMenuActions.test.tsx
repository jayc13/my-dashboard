import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NotificationMenuActions from '../NotificationMenuActions';

describe('NotificationMenuActions', () => {
    const mockOnMarkAllAsRead = vi.fn();
    const mockOnDeleteAll = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when no notifications', () => {
        const { container } = render(
            <NotificationMenuActions
                unreadCount={0}
                notificationsLength={0}
                onMarkAllAsRead={mockOnMarkAllAsRead}
                onDeleteAll={mockOnDeleteAll}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders only delete all when no unread notifications', () => {
        render(
            <NotificationMenuActions
                unreadCount={0}
                notificationsLength={5}
                onMarkAllAsRead={mockOnMarkAllAsRead}
                onDeleteAll={mockOnDeleteAll}
            />
        );

        expect(screen.queryByTestId('mark-all-as-read')).not.toBeInTheDocument();
        expect(screen.getByTestId('delete-all')).toBeInTheDocument();
    });

    it('renders both actions when there are unread notifications', () => {
        render(
            <NotificationMenuActions
                unreadCount={3}
                notificationsLength={5}
                onMarkAllAsRead={mockOnMarkAllAsRead}
                onDeleteAll={mockOnDeleteAll}
            />
        );

        expect(screen.getByTestId('mark-all-as-read')).toBeInTheDocument();
        expect(screen.getByTestId('delete-all')).toBeInTheDocument();
    });

    it('calls onMarkAllAsRead when mark all as read is clicked', () => {
        render(
            <NotificationMenuActions
                unreadCount={3}
                notificationsLength={5}
                onMarkAllAsRead={mockOnMarkAllAsRead}
                onDeleteAll={mockOnDeleteAll}
            />
        );

        const markAllButton = screen.getByTestId('mark-all-as-read');
        fireEvent.click(markAllButton);

        expect(mockOnMarkAllAsRead).toHaveBeenCalledTimes(1);
    });

    it('calls onDeleteAll when delete all is clicked', () => {
        render(
            <NotificationMenuActions
                unreadCount={3}
                notificationsLength={5}
                onMarkAllAsRead={mockOnMarkAllAsRead}
                onDeleteAll={mockOnDeleteAll}
            />
        );

        const deleteAllButton = screen.getByTestId('delete-all');
        fireEvent.click(deleteAllButton);

        expect(mockOnDeleteAll).toHaveBeenCalledTimes(1);
    });
});

