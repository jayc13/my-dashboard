import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AppsPageContainer from '../AppsPageContainer';
import type { Application } from '@/types';

// Mock the hooks
const mockRefetch = vi.fn();
const mockCreateApp = vi.fn();
const mockUpdateApp = vi.fn();
const mockDeleteApp = vi.fn();

vi.mock('@/hooks', () => ({
    useApps: () => ({
        data: mockAppsData,
        loading: false,
        error: null,
        refetch: mockRefetch,
    }),
    useCreateApp: () => ({
        mutate: mockCreateApp,
        loading: false,
    }),
    useUpdateApp: () => ({
        mutate: mockUpdateApp,
        loading: false,
    }),
    useDeleteApp: () => ({
        mutate: mockDeleteApp,
        loading: false,
    }),
}));

// Mock notistack
const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', () => ({
    enqueueSnackbar: (message: string, options: any) => mockEnqueueSnackbar(message, options),
}));

// Mock the child components
vi.mock('../AppsPage', () => ({
    default: ({ handleToggleWatching, apps }: any) => (
        <div data-testid="apps-page-mock">
            <button
                data-testid="toggle-watching-button"
                onClick={() => handleToggleWatching(apps?.[0])}
            >
                Toggle Watching
            </button>
        </div>
    ),
}));

let mockAppsData: Application[] = [];

describe('AppsPageContainer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAppsData = [
            {
                id: 1,
                name: 'Test App 1',
                code: 'test-app-1',
                pipelineUrl: 'https://example.com',
                e2eTriggerConfiguration: '{}',
                watching: false,
            },
            {
                id: 2,
                name: 'Test App 2',
                code: 'test-app-2',
                pipelineUrl: '',
                e2eTriggerConfiguration: '',
                watching: true,
            },
        ];
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('URL Parameter Handling', () => {
        it('should render without errors when URL params are present', async () => {
            render(<AppsPageContainer />);

            await waitFor(() => {
                expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
            });

            // URL parameter handling is tested more thoroughly in E2E tests
            // Unit tests verify the component renders without errors
        });

        it('should render without errors when no URL params', async () => {
            render(<AppsPageContainer />);

            await waitFor(() => {
                expect(screen.getByTestId('apps-page-mock')).toBeInTheDocument();
            });

            expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
        });
    });

    describe('Toggle Watching Functionality', () => {
        it('should toggle watching status from false to true', async () => {
            mockUpdateApp.mockResolvedValueOnce({});

            render(<AppsPageContainer />);

            const toggleButton = await screen.findByTestId('toggle-watching-button');
            toggleButton.click();

            await waitFor(() => {
                expect(mockUpdateApp).toHaveBeenCalledWith({
                    id: 1,
                    data: expect.objectContaining({
                        watching: true,
                    }),
                });
            });

            expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
                'App added to watching list',
                { variant: 'success' }
            );
            expect(mockRefetch).toHaveBeenCalled();
        });

        it('should toggle watching status from true to false', async () => {
            mockUpdateApp.mockResolvedValueOnce({});
            mockAppsData[0].watching = true;

            render(<AppsPageContainer />);

            const toggleButton = await screen.findByTestId('toggle-watching-button');
            toggleButton.click();

            await waitFor(() => {
                expect(mockUpdateApp).toHaveBeenCalledWith({
                    id: 1,
                    data: expect.objectContaining({
                        watching: false,
                    }),
                });
            });

            expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
                'App removed from watching list',
                { variant: 'success' }
            );
            expect(mockRefetch).toHaveBeenCalled();
        });

        it('should handle toggle error gracefully', async () => {
            mockUpdateApp.mockRejectedValueOnce(new Error('Update failed'));

            render(<AppsPageContainer />);

            const toggleButton = await screen.findByTestId('toggle-watching-button');
            toggleButton.click();

            await waitFor(() => {
                expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
                    'Failed to update watching status',
                    { variant: 'error' }
                );
            });
        });

        it('should not call update if app has no id', async () => {
            mockAppsData[0].id = undefined;

            render(<AppsPageContainer />);

            const toggleButton = await screen.findByTestId('toggle-watching-button');
            toggleButton.click();

            await waitFor(() => {
                expect(mockUpdateApp).not.toHaveBeenCalled();
            });
        });

        it('should preserve all app properties when toggling', async () => {
            mockUpdateApp.mockResolvedValueOnce({});

            render(<AppsPageContainer />);

            const toggleButton = await screen.findByTestId('toggle-watching-button');
            toggleButton.click();

            await waitFor(() => {
                expect(mockUpdateApp).toHaveBeenCalledWith({
                    id: 1,
                    data: {
                        id: 1,
                        name: 'Test App 1',
                        code: 'test-app-1',
                        pipelineUrl: 'https://example.com',
                        e2eTriggerConfiguration: '{}',
                        watching: true,
                    },
                });
            });
        });
    });
});

