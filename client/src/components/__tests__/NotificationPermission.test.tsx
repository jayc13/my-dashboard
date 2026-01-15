import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  let mockEnqueueSnackbar: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRequestPermission.mockClear();
    // Get fresh reference to mock each time
    const notistack = await import('notistack');
    mockEnqueueSnackbar = vi.mocked(notistack.enqueueSnackbar);
  });

  it('renders warning when notifications are not supported', async () => {
    const { useFCM } = await import('@/hooks');
    vi.mocked(useFCM).mockReturnValue({
      token: null,
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
      token: 'mock-token',
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
      token: null,
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
      token: null,
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
      token: null,
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
      token: null,
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

  it('calls onPermissionGranted callback when permission is granted', async () => {
    const { useFCM } = await import('@/hooks');
    const onPermissionGranted = vi.fn();
    mockRequestPermission.mockResolvedValue(true);

    vi.mocked(useFCM).mockReturnValue({
      token: null,
      isSupported: true,
      isPermissionGranted: false,
      requestPermission: mockRequestPermission,
      error: null,
    });

    render(<NotificationPermission onPermissionGranted={onPermissionGranted} />);
    const enableButton = screen.getByTestId('enable-notifications-btn');
    fireEvent.click(enableButton);

    const enablePermissionButton = screen.getByTestId('enable-permission');
    fireEvent.click(enablePermissionButton);

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(onPermissionGranted).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Notifications enabled successfully'),
        expect.objectContaining({ variant: 'success' }),
      );
    });
  });

  it('calls onPermissionDenied callback when permission is denied', async () => {
    const { useFCM } = await import('@/hooks');
    const onPermissionDenied = vi.fn();
    mockRequestPermission.mockResolvedValue(false);

    vi.mocked(useFCM).mockReturnValue({
      token: null,
      isSupported: true,
      isPermissionGranted: false,
      requestPermission: mockRequestPermission,
      error: null,
    });

    render(<NotificationPermission onPermissionDenied={onPermissionDenied} />);
    const enableButton = screen.getByTestId('enable-notifications-btn');
    fireEvent.click(enableButton);

    const enablePermissionButton = screen.getByTestId('enable-permission');
    fireEvent.click(enablePermissionButton);

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(onPermissionDenied).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Notification permission denied'),
        expect.objectContaining({ variant: 'error' }),
      );
    });
  });

  it('closes dialog when not now button is clicked', async () => {
    const { useFCM } = await import('@/hooks');
    vi.mocked(useFCM).mockReturnValue({
      token: null,
      isSupported: true,
      isPermissionGranted: false,
      requestPermission: mockRequestPermission,
      error: null,
    });

    render(<NotificationPermission />);
    const enableButton = screen.getByTestId('enable-notifications-btn');
    fireEvent.click(enableButton);

    expect(screen.getByText(/Would you like to enable push notifications/i)).toBeInTheDocument();

    const notNowButton = screen.getByTestId('not-now');
    fireEvent.click(notNowButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/Would you like to enable push notifications/i),
      ).not.toBeInTheDocument();
    });
  });

  it('dismisses error alert when close button is clicked', async () => {
    const { useFCM } = await import('@/hooks');
    vi.mocked(useFCM).mockReturnValue({
      token: null,
      isSupported: true,
      isPermissionGranted: false,
      requestPermission: mockRequestPermission,
      error: 'Test error',
    });

    const { getByRole } = render(<NotificationPermission />);

    expect(screen.getByText(/Error with notifications/i)).toBeInTheDocument();

    // Click the close button in the alert
    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Error with notifications/i)).not.toBeInTheDocument();
  });

  it('dismisses unsupported browser alert when close button is clicked', async () => {
    const { useFCM } = await import('@/hooks');
    vi.mocked(useFCM).mockReturnValue({
      token: null,
      isSupported: false,
      isPermissionGranted: false,
      requestPermission: mockRequestPermission,
      error: null,
    });

    const { getByRole } = render(<NotificationPermission />);

    expect(screen.getByText(/Push notifications are not supported/i)).toBeInTheDocument();

    // Click the close button in the alert
    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Push notifications are not supported/i)).not.toBeInTheDocument();
  });
});
