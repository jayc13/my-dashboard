import { render, screen, fireEvent } from '@testing-library/react';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import HeaderNavigation from '../HeaderNavigation.tsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the constants
vi.mock('../../../utils/constants', () => ({
  NAVIGATION_ITEMS: [
    { text: 'Home', icon: <div>Home Icon</div>, path: '/' },
    { text: 'E2E Dashboard', icon: <div>Dashboard Icon</div>, path: '/e2e-dashboard' },
    { text: 'Pull Requests', icon: <div>GitHub Icon</div>, path: '/pull_requests' },
    { text: 'Apps', icon: <div>Apps Icon</div>, path: '/apps' },
  ],
}));

// Create a theme for testing
const theme = createTheme();

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('HeaderNavigation Component', () => {
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
      },
      writable: true,
    });
  });

  it('renders all navigation items', () => {
    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    expect(screen.getByTestId('header-nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('header-nav-e2e-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('header-nav-pull-requests')).toBeInTheDocument();
    expect(screen.getByTestId('header-nav-apps')).toBeInTheDocument();
  });

  it('displays navigation item text', () => {
    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('E2E Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Pull Requests')).toBeInTheDocument();
    expect(screen.getByText('Apps')).toBeInTheDocument();
  });

  it('displays navigation item icons', () => {
    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    expect(screen.getByText('Home Icon')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Icon')).toBeInTheDocument();
    expect(screen.getByText('GitHub Icon')).toBeInTheDocument();
    expect(screen.getByText('Apps Icon')).toBeInTheDocument();
  });

  it('calls onNavigate when a navigation item is clicked', () => {
    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const homeButton = screen.getByTestId('header-nav-home');
    fireEvent.click(homeButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('/');
    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigate with correct path for each navigation item', () => {
    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    // Test Home
    fireEvent.click(screen.getByTestId('header-nav-home'));
    expect(mockOnNavigate).toHaveBeenLastCalledWith('/');

    // Test E2E Dashboard
    fireEvent.click(screen.getByTestId('header-nav-e2e-dashboard'));
    expect(mockOnNavigate).toHaveBeenLastCalledWith('/e2e-dashboard');

    // Test Pull Requests
    fireEvent.click(screen.getByTestId('header-nav-pull-requests'));
    expect(mockOnNavigate).toHaveBeenLastCalledWith('/pull_requests');

    // Test Apps
    fireEvent.click(screen.getByTestId('header-nav-apps'));
    expect(mockOnNavigate).toHaveBeenLastCalledWith('/apps');

    expect(mockOnNavigate).toHaveBeenCalledTimes(4);
  });

  it('highlights the current page', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/e2e-dashboard',
      },
      writable: true,
    });

    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const dashboardButton = screen.getByTestId('header-nav-e2e-dashboard');
    // Check if the button has the selected class/attribute
    expect(dashboardButton).toHaveClass('Mui-selected');
  });

  it('does not highlight non-current pages', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/e2e-dashboard',
      },
      writable: true,
    });

    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const homeButton = screen.getByTestId('header-nav-home');
    const appsButton = screen.getByTestId('header-nav-apps');

    expect(homeButton).not.toHaveClass('Mui-selected');
    expect(appsButton).not.toHaveClass('Mui-selected');
  });

  it('renders as a horizontal list', () => {
    const { container } = render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const list = container.querySelector('[class*="MuiList-root"]');
    expect(list).toBeInTheDocument();
  });

  it('renders ListItem components with disablePadding', () => {
    const { container } = render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const listItems = container.querySelectorAll('[class*="MuiListItem-root"]');
    expect(listItems.length).toBe(4);
  });

  it('renders ListItemButton components', () => {
    const { container } = render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const listItemButtons = container.querySelectorAll('[class*="MuiListItemButton-root"]');
    expect(listItemButtons.length).toBe(4);
  });

  it('renders ListItemIcon components', () => {
    const { container } = render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const listItemIcons = container.querySelectorAll('[class*="MuiListItemIcon-root"]');
    expect(listItemIcons.length).toBe(4);
  });

  it('renders ListItemText components', () => {
    const { container } = render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const listItemTexts = container.querySelectorAll('[class*="MuiListItemText-root"]');
    expect(listItemTexts.length).toBe(4);
  });

  it('handles multiple clicks on the same item', () => {
    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    const homeButton = screen.getByTestId('header-nav-home');

    fireEvent.click(homeButton);
    fireEvent.click(homeButton);
    fireEvent.click(homeButton);

    expect(mockOnNavigate).toHaveBeenCalledTimes(3);
    expect(mockOnNavigate).toHaveBeenCalledWith('/');
  });

  it('handles rapid clicks on different items', () => {
    render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByTestId('header-nav-home'));
    fireEvent.click(screen.getByTestId('header-nav-e2e-dashboard'));
    fireEvent.click(screen.getByTestId('header-nav-apps'));

    expect(mockOnNavigate).toHaveBeenCalledTimes(3);
  });

  it('updates selected state when pathname changes', () => {
    const { rerender } = render(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    // Initially on home
    expect(screen.getByTestId('header-nav-home')).toHaveClass('Mui-selected');

    // Change location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/apps',
      },
      writable: true,
    });

    // Rerender
    rerender(
      <TestWrapper>
        <HeaderNavigation onNavigate={mockOnNavigate} />
      </TestWrapper>,
    );

    expect(screen.getByTestId('header-nav-apps')).toHaveClass('Mui-selected');
    expect(screen.getByTestId('header-nav-home')).not.toHaveClass('Mui-selected');
  });
});
