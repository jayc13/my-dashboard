import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, expect } from 'vitest';
import Header from '../Header.tsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the auth context
const mockLogout = vi.fn();
vi.mock('../../../contexts/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

// Mock the constants
vi.mock('../../../utils/constants', () => ({
  API_BASE_URL: 'http://localhost:3000',
  NAVIGATION_ITEMS: [
    { text: 'Home', icon: <div>Home</div>, path: '/' },
    { text: 'E2E Dashboard', icon: <div>Dashboard</div>, path: '/e2e-dashboard' },
    { text: 'Pull Requests', icon: <div>GitHub</div>, path: '/pull_requests' },
    { text: 'Apps', icon: <div>Apps</div>, path: '/apps' },
  ],
}));

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useNotifications: () => ({
    data: [],
    refetch: vi.fn(),
    loading: false,
    error: null,
  }),
  useMarkNotificationAsRead: () => ({
    mutate: vi.fn(),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
  useDeleteNotification: () => ({
    mutate: vi.fn(),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

// Mock the child components
vi.mock('../../layout/ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher</div>,
}));

vi.mock('../../layout/NotificationCenter', () => ({
  default: ({ notifications }: { notifications: Notification[] }) => (
    <div data-testid="notification-center">Notification Center ({notifications?.length || 0})</div>
  ),
}));

// Create a theme for testing
const theme = createTheme();

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        pathname: '/',
      },
      writable: true,
    });
  });

  it('renders the header with logo and title', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('renders navigation components', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('notification-center')).toBeInTheDocument();
    expect(screen.getByLabelText('open menu')).toBeInTheDocument();
  });

  it('opens and closes the sidebar menu', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    const menuButton = screen.getByLabelText('open menu');

    // Open the sidebar
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    // Check navigation items are present using test IDs
    expect(screen.getByTestId('nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('nav-e2e-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-pull-requests')).toBeInTheDocument();
    expect(screen.getByTestId('nav-apps')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();

    // Close the sidebar
    const closeButton = screen.getByTestId('sidebar_close-btn');
    fireEvent.click(closeButton);
  });

  it('handles navigation item clicks', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    // Open the sidebar
    const menuButton = screen.getByLabelText('open menu');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('nav-e2e-dashboard')).toBeInTheDocument();
    });

    // Click on E2E Dashboard in drawer
    const dashboardLink = screen.getByTestId('nav-e2e-dashboard');
    fireEvent.click(dashboardLink);

    // Check that window.location.href was set
    expect(window.location.href).toBe('/e2e-dashboard');
  });

  it('handles logout functionality', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    // Open the sidebar
    const menuButton = screen.getByLabelText('open menu');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    // Click logout
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Check that logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('highlights the current page in navigation', async () => {
    // Set current path to /e2e-dashboard
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        pathname: '/e2e-dashboard',
      },
      writable: true,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    // Open the sidebar
    const menuButton = screen.getByLabelText('open menu');
    fireEvent.click(menuButton);

    await waitFor(() => {
      const dashboardItem = screen.getByTestId('nav-e2e-dashboard');
      expect(dashboardItem).toBeInTheDocument();
      expect(dashboardItem).toHaveClass('Mui-selected');
    });
  });

  it('renders header navigation items', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    // Check that header navigation items are present
    expect(screen.getByTestId('header-nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('header-nav-e2e-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('header-nav-pull-requests')).toBeInTheDocument();
    expect(screen.getByTestId('header-nav-apps')).toBeInTheDocument();
  });

  it('handles navigation from header navigation items', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    // Click on E2E Dashboard in header navigation
    const dashboardButton = screen.getByTestId('header-nav-e2e-dashboard');
    fireEvent.click(dashboardButton);

    // Check that window.location.href was set
    expect(window.location.href).toBe('/e2e-dashboard');
  });

  it('highlights current page in header navigation', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        pathname: '/pull_requests',
      },
      writable: true,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    const pullRequestsButton = screen.getByTestId('header-nav-pull-requests');
    expect(pullRequestsButton).toHaveClass('Mui-selected');
  });

  it('closes sidebar when navigating from header navigation', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    // Open the sidebar first
    const menuButton = screen.getByLabelText('open menu');
    fireEvent.click(menuButton);

    // Wait for sidebar to open
    waitFor(() => {
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    // Click on a header navigation item
    const appsButton = screen.getByTestId('header-nav-apps');
    fireEvent.click(appsButton);

    // Sidebar should close (Menu text should not be visible)
    waitFor(() => {
      expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    });
  });

  it('renders both header navigation and drawer navigation', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    // Header navigation should be visible
    expect(screen.getByTestId('header-nav-home')).toBeInTheDocument();

    // Open drawer
    const menuButton = screen.getByLabelText('open menu');
    fireEvent.click(menuButton);

    await waitFor(() => {
      // Drawer navigation should also be visible
      expect(screen.getByTestId('nav-home')).toBeInTheDocument();
    });
  });

  it('uses the same navigation handler for both header and drawer', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>,
    );

    // Navigate from header
    const headerAppsButton = screen.getByTestId('header-nav-apps');
    fireEvent.click(headerAppsButton);
    expect(window.location.href).toBe('/apps');

    // Reset location
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        pathname: '/',
      },
      writable: true,
    });

    // Open drawer
    const menuButton = screen.getByLabelText('open menu');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('nav-e2e-dashboard')).toBeInTheDocument();
    });

    // Navigate from drawer
    const drawerDashboardButton = screen.getByTestId('nav-e2e-dashboard');
    fireEvent.click(drawerDashboardButton);
    expect(window.location.href).toBe('/e2e-dashboard');
  });
});
