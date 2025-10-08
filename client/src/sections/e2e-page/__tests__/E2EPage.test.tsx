import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import E2EPage from '../E2EPage';
import type { DetailedE2EReport } from '@my-dashboard/types';

// Mock the child components
vi.mock('../components/TestResultsPerApp', () => ({
    default: () => <div data-testid="test-results-per-app">Test Results</div>,
}));

vi.mock('../components/E2EGeneralMetrics', () => ({
    default: () => <div data-testid="e2e-general-metrics">General Metrics</div>,
}));

vi.mock('../components/LoadingBackdrop.tsx', () => ({
    default: () => <div data-testid="loading-backdrop">Loading</div>,
}));

describe('E2EPage', () => {
    const mockRefetch = vi.fn();
    
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
    });

    it('renders error state', () => {
        const error = new Error('Test error');
        render(
            <E2EPage
                data={null}
                prevData={null}
                loading={false}
                error={error}
                refetch={mockRefetch}
            />,
        );
        
        expect(screen.getByText('Error fetching information')).toBeInTheDocument();
    });

    it('renders main content when no error', () => {
        render(
            <E2EPage
                data={mockData}
                prevData={null}
                loading={false}
                error={null}
                refetch={mockRefetch}
            />,
        );
        
        expect(screen.getByTestId('e2e-page')).toBeInTheDocument();
        expect(screen.getByTestId('test-results-per-app')).toBeInTheDocument();
        expect(screen.getByTestId('e2e-general-metrics')).toBeInTheDocument();
    });

    it('renders loading backdrop', () => {
        render(
            <E2EPage
                data={mockData}
                prevData={null}
                loading={true}
                error={null}
                refetch={mockRefetch}
            />,
        );
        
        expect(screen.getByTestId('loading-backdrop')).toBeInTheDocument();
    });

    it('renders with null data', () => {
        render(
            <E2EPage
                data={null}
                prevData={null}
                loading={false}
                error={null}
                refetch={mockRefetch}
            />,
        );
        
        expect(screen.getByTestId('e2e-page')).toBeInTheDocument();
    });
});

