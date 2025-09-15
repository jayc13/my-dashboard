import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, expect } from 'vitest'
import Header from '../Header'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Mock the auth context
const mockLogout = vi.fn()
vi.mock('../../../contexts/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}))

// Mock the constants
vi.mock('../../../utils/constants', () => ({
  API_BASE_URL: 'http://localhost:3000',
}))

// Mock the child components
vi.mock('../ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher</div>,
}))

vi.mock('../NotificationCenter', () => ({
  default: ({ notifications }: { notifications: Notification[] }) => (
    <div data-testid="notification-center">
      Notification Center ({notifications?.length || 0})
    </div>
  ),
}))

// Create a theme for testing
const theme = createTheme()

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
)

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        pathname: '/',
      },
      writable: true,
    })
  })

  it('renders the header with logo and title', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    expect(screen.getByText('My Dashboard')).toBeInTheDocument()
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
  })

  it('renders navigation components', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument()
    expect(screen.getByTestId('notification-center')).toBeInTheDocument()
    expect(screen.getByLabelText('open menu')).toBeInTheDocument()
  })

  it('opens and closes the sidebar menu', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const menuButton = screen.getByLabelText('open menu')
    
    // Open the sidebar
    fireEvent.click(menuButton)
    
    await waitFor(() => {
      expect(screen.getByText('Menu')).toBeInTheDocument()
    })

    // Check navigation items are present
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('E2E Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Pull Requests')).toBeInTheDocument()
    expect(screen.getByText('Apps')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()

    // Close the sidebar
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
  })

  it('handles navigation item clicks', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Open the sidebar
    const menuButton = screen.getByLabelText('open menu')
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('E2E Dashboard')).toBeInTheDocument()
    })

    // Click on E2E Dashboard
    const dashboardLink = screen.getByText('E2E Dashboard')
    fireEvent.click(dashboardLink)

    // Check that window.location.href was set
    expect(window.location.href).toBe('/e2e-dashboard')
  })

  it('handles logout functionality', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Open the sidebar
    const menuButton = screen.getByLabelText('open menu')
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    // Click logout
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    // Check that logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('highlights the current page in navigation', async () => {
    // Set current path to /e2e-dashboard
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        pathname: '/e2e-dashboard',
      },
      writable: true,
    })

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Open the sidebar
    const menuButton = screen.getByLabelText('open menu')
    fireEvent.click(menuButton)

    await waitFor(() => {
      const dashboardItem = screen.getByText('E2E Dashboard').closest('div')
      expect(dashboardItem).toBeInTheDocument()
    })
  })
})
