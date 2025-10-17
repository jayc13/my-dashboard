import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationListItem from './NotificationListItem';
import type { Notification } from '@/types/index';

describe('NotificationListItem', () => {
  const baseNotification: Notification = {
    id: 1,
    title: 'Test Notification',
    message: 'This is a test notification',
    createdAt: new Date().toISOString(),
    isRead: false,
    type: 'info',
    link: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.pathname before each test
    window.location.pathname = '/';
  });

  it('renders unread notification', async () => {
    render(
      <NotificationListItem
        notification={baseNotification}
        onMarkAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('notification-title-1')).toHaveTextContent('Test Notification');
      expect(screen.getByLabelText('unread')).toBeInTheDocument();
      expect(screen.getByTestId('mark-as-read-1')).toBeInTheDocument();
    });
  });

  it('renders read notification', async () => {
    render(
      <NotificationListItem
        notification={{ ...baseNotification, isRead: true }}
        onMarkAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByLabelText('unread')).not.toBeInTheDocument();
      expect(screen.getByTestId('delete-notification-1')).toBeInTheDocument();
    });
  });

  it('calls onMarkAsRead when mark-as-read button is clicked', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = vi.fn().mockResolvedValue(undefined);
    render(
      <NotificationListItem
        notification={baseNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={vi.fn()}
      />,
    );
    await user.click(screen.getByTestId('mark-as-read-1'));
    expect(onMarkAsRead).toHaveBeenCalledWith(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <NotificationListItem
        notification={{ ...baseNotification, isRead: true }}
        onMarkAsRead={vi.fn()}
        onDelete={onDelete}
      />,
    );

    // Use fireEvent instead of userEvent because the button has pointer-events: none until hover
    // We're testing the onClick handler, not the hover behavior
    const deleteButton = screen.getByTestId('delete-notification-1');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('marks as read when clicking notification with link', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = vi.fn().mockResolvedValue(undefined);
    const notificationWithLink = { ...baseNotification, link: '/somewhere', isRead: false };
    render(
      <NotificationListItem
        notification={notificationWithLink}
        onMarkAsRead={onMarkAsRead}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByTestId('notification-alert-1'));

    // Wait for async operations to complete
    await waitFor(() => {
      expect(onMarkAsRead).toHaveBeenCalledWith(1);
    });

    // Verify navigation was attempted (window.location.pathname is mocked in test setup)
    expect(window.location.pathname).toBe('/somewhere');
  });
});
