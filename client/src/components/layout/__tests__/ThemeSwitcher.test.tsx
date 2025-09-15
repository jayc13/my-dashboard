import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the useColorScheme hook
const mockSetMode = vi.fn();
const mockUseColorScheme = vi.fn();

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useColorScheme: () => mockUseColorScheme(),
  };
});

// Create a theme for testing
const theme = createTheme();

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ThemeSwitcher Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with dark mode icon and tooltip', () => {
    mockUseColorScheme.mockReturnValue({
      mode: 'dark',
      setMode: mockSetMode,
    });

    render(
      <TestWrapper>
        <ThemeSwitcher />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('renders with light mode icon and tooltip', () => {
    mockUseColorScheme.mockReturnValue({
      mode: 'light',
      setMode: mockSetMode,
    });

    render(
      <TestWrapper>
        <ThemeSwitcher />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('cycles through modes correctly when clicked', () => {
    // Test dark -> light
    mockUseColorScheme.mockReturnValue({
      mode: 'dark',
      setMode: mockSetMode,
    });

    render(
      <TestWrapper>
        <ThemeSwitcher />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetMode).toHaveBeenCalledWith('light');
  });
});
