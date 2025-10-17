import '@testing-library/jest-dom';
import { vi } from 'vitest';
import type { ReactNode } from 'react';

// Polyfill for HTMLFormElement.requestSubmit() which is not implemented in jsdom
if (typeof HTMLFormElement !== 'undefined' && !HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function (this: HTMLFormElement, submitter?: HTMLElement) {
    if (submitter) {
      const submitterElement = submitter as HTMLButtonElement | HTMLInputElement;
      if (!submitterElement.type || submitterElement.type !== 'submit') {
        throw new TypeError('The specified element is not a submit button');
      }
      if (submitterElement.form !== this) {
        throw new DOMException('The specified element is not owned by this form element', 'NotFoundError');
      }
    }

    // Trigger form validation if available
    if (typeof this.reportValidity === 'function') {
      if (!this.reportValidity()) {
        return;
      }
    }

    // Create and dispatch a submit event
    // Use Event instead of SubmitEvent for better compatibility
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });

    // Add submitter property if provided
    if (submitter) {
      Object.defineProperty(submitEvent, 'submitter', {
        value: submitter,
        configurable: true,
      });
    }

    this.dispatchEvent(submitEvent);
  };
}

// Mock CSS imports
vi.mock('*.css', () => ({}));

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
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Link: vi.fn(({ children }) => children),
    NavLink: vi.fn(({ children }) => children),
  };
});

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

// Mock window.location to prevent "Not implemented: navigation" errors in jsdom
// Create a writable location object that can be modified in tests
const mockLocation = {
  href: 'http://localhost:3000/',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  toString: vi.fn(() => 'http://localhost:3000/'),
};

delete (window as any).location;
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
  configurable: true,
});

// Mock window.open to prevent actual window opening in tests
window.open = vi.fn();

// Prevent navigation on anchor clicks in tests
// This prevents "Not implemented: navigation to another Document" errors
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && anchor.href) {
      // Only prevent default if the onClick handler doesn't already do it
      // This allows tests to verify onClick behavior while preventing actual navigation
      e.preventDefault();
    }
  }, true); // Use capture phase to catch before other handlers
}

// Suppress expected unhandled rejections from error scenario tests
const originalUnhandledRejection = process.listeners('unhandledRejection');
process.removeAllListeners('unhandledRejection');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('unhandledRejection', (reason: any) => {
  // Suppress expected test errors
  const expectedErrors = ['Refetch failed', 'Refresh failed'];
  const isExpectedError = expectedErrors.some(
    msg => reason?.message?.includes(msg) || String(reason).includes(msg),
  );

  if (!isExpectedError) {
    // Re-throw unexpected errors
    originalUnhandledRejection.forEach(listener => {
      if (typeof listener === 'function') {
        listener(reason, Promise.reject(reason));
      }
    });
  }
});
