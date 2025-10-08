import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import E2EPageContainer from '../E2EPageContainer';
import type { DetailedE2EReport } from '@my-dashboard/types';

const mockRefetchData = vi.fn();
const mockRefetchPrevData = vi.fn();

// Mock the hooks
vi.mock('@/hooks', () => ({
    useE2ERunReport: vi.fn(),
}));

// Mock E2EPage component
vi.mock('../E2EPage.tsx', () => ({
    default: ({ data, prevData, loading, error, refetch }: any) => (
        <div data-testid="e2e-page">
            <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
            <div data-testid="error">{error ? 'Error' : 'No Error'}</div>
            <button onClick={refetch} data-testid="refetch-button">Refetch</button>
        </div>
    ),
}));

describe('E2EPageContainer', () => {
    const mockData: DetailedE2EReport = {
        summary: {
            status: 'passed',
            totalTests: 100,
            passedTests: 95,
            failedTests: 5,
            skippedTests: 0,
            duration: 1000,
        },
        message: 'Tests completed',
        projects: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders E2EPage with data', async () => {
        const { useE2ERunReport } = await import('@/hooks');
        vi.mocked(useE2ERunReport).mockReturnValue({
            data: mockData,
            loading: false,
            error: null,
            refetch: mockRefetchData,
        });

        render(<E2EPageContainer />);
        
        expect(screen.getByTestId('e2e-page')).toBeInTheDocument();
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    it('renders loading state', async () => {
        const { useE2ERunReport } = await import('@/hooks');
        vi.mocked(useE2ERunReport).mockReturnValue({
            data: undefined,
            loading: true,
            error: null,
            refetch: mockRefetchData,
        });

        render(<E2EPageContainer />);
        
        expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });

    it('renders error state', async () => {
        const { useE2ERunReport } = await import('@/hooks');
        const error = new Error('Test error');
        vi.mocked(useE2ERunReport).mockReturnValue({
            data: undefined,
            loading: false,
            error,
            refetch: mockRefetchData,
        });

        render(<E2EPageContainer />);
        
        expect(screen.getByTestId('error')).toHaveTextContent('Error');
    });

    it('polls when status is pending', async () => {
        const { useE2ERunReport } = await import('@/hooks');
        const pendingData: DetailedE2EReport = {
            ...mockData,
            summary: {
                ...mockData.summary,
                status: 'pending',
            },
        };

        vi.mocked(useE2ERunReport).mockReturnValue({
            data: pendingData,
            loading: false,
            error: null,
            refetch: mockRefetchData,
        });

        render(<E2EPageContainer />);

        // Fast-forward time by 5 seconds
        await vi.advanceTimersByTimeAsync(5000);

        expect(mockRefetchData).toHaveBeenCalled();
    });

    it('does not poll when status is not pending', async () => {
        const { useE2ERunReport } = await import('@/hooks');
        vi.mocked(useE2ERunReport).mockReturnValue({
            data: mockData,
            loading: false,
            error: null,
            refetch: mockRefetchData,
        });

        render(<E2EPageContainer />);
        
        // Fast-forward time by 5 seconds
        vi.advanceTimersByTime(5000);
        
        // Should not have been called since status is 'passed'
        expect(mockRefetchData).not.toHaveBeenCalled();
    });
});

