import '@testing-library/jest-dom';
import { vi } from 'vitest';
import type { ReactNode } from 'react';

// Mock Firebase to avoid initialization issues in tests
vi.mock('../src/firebase-config', () => ({
  messaging: null,
  vapidKey: 'mock-vapid-key',
  getToken: vi.fn(),
  onMessage: vi.fn(),
  initializeFirebase: vi.fn(() => null),
}));

// Mock SWR to avoid network requests in tests
vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    mutate: vi.fn(),
  })),
  mutate: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: vi.fn(({ children }) => children),
  NavLink: vi.fn(({ children }) => children),
}));

// Mock notistack for notifications
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: vi.fn(),
    closeSnackbar: vi.fn(),
  }),
  SnackbarProvider: ({ children }: { children: ReactNode }) => children,
  enqueueSnackbar: vi.fn(),
}));

// Mock SDK context
vi.mock('../src/contexts/useSDK', () => ({
  useSDK: () => ({
    api: {
      notifications: {
        getNotifications: vi.fn().mockResolvedValue([]),
        markNotificationAsRead: vi.fn().mockResolvedValue({ success: true }),
        deleteNotification: vi.fn().mockResolvedValue({ success: true }),
      },
    },
    isReady: true,
  }),
}));

// Mock Auth context
vi.mock('../src/contexts/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
  }),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
