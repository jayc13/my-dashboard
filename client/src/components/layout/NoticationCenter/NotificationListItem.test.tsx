import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

  it('renders unread notification', () => {
    render(
      <NotificationListItem
        notification={baseNotification}
        onMarkAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByTestId('notification-title-1')).toHaveTextContent('Test Notification');
    expect(screen.getByLabelText('unread')).toBeInTheDocument();
    expect(screen.getByTestId('mark-as-read-1')).toBeInTheDocument();
  });

  it('renders read notification', () => {
    render(
      <NotificationListItem
        notification={{ ...baseNotification, isRead: true }}
        onMarkAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('unread')).not.toBeInTheDocument();
    expect(screen.getByTestId('delete-notification-1')).toBeInTheDocument();
  });

  it('calls onMarkAsRead when mark-as-read button is clicked', async () => {
    const onMarkAsRead = vi.fn().mockResolvedValue(undefined);
    render(
      <NotificationListItem
        notification={baseNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('mark-as-read-1'));
    expect(onMarkAsRead).toHaveBeenCalledWith(1);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <NotificationListItem
        notification={{ ...baseNotification, isRead: true }}
        onMarkAsRead={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByTestId('delete-notification-1'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('marks as read when clicking notification with link', async () => {
    const onMarkAsRead = vi.fn().mockResolvedValue(undefined);
    const notificationWithLink = { ...baseNotification, link: '/somewhere', isRead: false };
    render(
      <NotificationListItem
        notification={notificationWithLink}
        onMarkAsRead={onMarkAsRead}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('notification-alert-1'));
    expect(onMarkAsRead).toHaveBeenCalledWith(1);
    // Navigation cannot be reliably tested due to JSDOM limitations.
  });
});
