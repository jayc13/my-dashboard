import { render, screen, fireEvent } from '@testing-library/react';
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
        onMarkAsRead={jest.fn()}
        onDelete={jest.fn()}
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
        onMarkAsRead={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.queryByLabelText('unread')).not.toBeInTheDocument();
    expect(screen.getByTestId('delete-notification-1')).toBeInTheDocument();
  });

  it('calls onMarkAsRead when mark-as-read button is clicked', async () => {
    const onMarkAsRead = jest.fn().mockResolvedValue(undefined);
    render(
      <NotificationListItem
        notification={baseNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('mark-as-read-1'));
    expect(onMarkAsRead).toHaveBeenCalledWith(1);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(
      <NotificationListItem
        notification={{ ...baseNotification, isRead: true }}
        onMarkAsRead={jest.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByTestId('delete-notification-1'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('marks as read and navigates when clicking notification with link', async () => {
    const onMarkAsRead = jest.fn().mockResolvedValue(undefined);
    const notificationWithLink = { ...baseNotification, link: '/somewhere', isRead: false };
    render(
      <NotificationListItem
        notification={notificationWithLink}
        onMarkAsRead={onMarkAsRead}
        onDelete={jest.fn()}
      />,
    );
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: '' };
    fireEvent.click(screen.getByTestId('notification-alert-1'));
    expect(onMarkAsRead).toHaveBeenCalledWith(1);
    expect(window.location.pathname).toBe('/somewhere');
    window.location = originalLocation;
  });
});

