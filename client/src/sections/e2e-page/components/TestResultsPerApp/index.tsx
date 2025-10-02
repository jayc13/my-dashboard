import { useEffect, useState } from 'react';
import { Box, Grid, Pagination } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { API_BASE_URL } from '@/utils/constants.ts';
import { apiFetch } from '@/utils/helpers.ts';
import type { Application, DetailedE2EReportDetail } from '@my-dashboard/types';
import { PAGE_SIZE } from './constants';
import LoadingState from './LoadingState';
import { AllTestsPassing, NoTestResults } from './EmptyStates';
import ProjectCard from './ProjectCard';
import ContextMenu from './ContextMenu';


export interface TestResultsPerAppProps {
    data: DetailedE2EReportDetail[];
    isLoading?: boolean;
    refetchData: () => Promise<void>;
}

const TestResultsPerApp = (props: TestResultsPerAppProps) => {
    const {
        data = [],
        isLoading = false,
        refetchData,
    } = props;

    const [page, setPage] = useState(1);
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        result: DetailedE2EReportDetail;
        loadingAppDetails: boolean;
    } | null>(null);

    const fetchAppDetails = async (projectCode: string): Promise<Application | null> => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/apps/code/${projectCode}`);
            return await response.json();
        } catch {
            return null;
        }
    };

    const handleContextMenu = async (event: React.MouseEvent, result: DetailedE2EReportDetail) => {
        event.preventDefault();

        // Set initial context menu state with loading
        setContextMenu({
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            result,
            loadingAppDetails: true,
        });

        // Fetch app details
        const appDetails = await fetchAppDetails(result.app!.code);

        // Update context menu with app details
        setContextMenu(prev => prev ? {
            ...prev,
            appDetails,
            loadingAppDetails: false,
        } : null);
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleOpenUrlInNewTab = (url: string) => {
        if (contextMenu) {
            window.open(url, '_blank');
            handleCloseContextMenu();
        }
    };

    const handleCopyProjectName = async () => {
        if (contextMenu) {
            await navigator.clipboard.writeText(contextMenu.result.app!.name);
            handleCloseContextMenu();
        }
    };

    const handleTriggerE2ERuns = async () => {
        if (contextMenu) {
            const app_id = contextMenu.result.app?.id;
            if (!app_id) {
                enqueueSnackbar('App ID is missing. Cannot trigger E2E runs.', { variant: 'error' });
                return;
            }
            handleCloseContextMenu();
            try {
                const response = await apiFetch(`${API_BASE_URL}/api/e2e_manual_runs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        app_id,
                    }),
                });

                if (response.ok) {
                    const appName = contextMenu.result.app!.name;
                    enqueueSnackbar(`E2E run for ${appName} were triggered successfully!`, { variant: 'success', autoHideDuration: 10 * 1000 });
                } else {
                    const errorData = await response.json();
                    enqueueSnackbar(`Failed to trigger E2E runs: ${errorData.error || response.statusText}`, { variant: 'error' });
                }
            } catch {
                enqueueSnackbar('Failed to trigger E2E runs due to a network error.', { variant: 'error' });
            }
        }
    };

    const handleCopyProjectCode = async () => {
        if (contextMenu) {
            await navigator.clipboard.writeText(contextMenu.result.app!.code);
            handleCloseContextMenu();
        }
    };

    // Handle right-click on different cards to close current menu
    useEffect(() => {
        const handleGlobalContextMenu = (event: MouseEvent) => {
            // Only handle if we have an open context menu
            if (contextMenu) {
                const target = event.target as Element;
                // Check if the right-click is on a different project card
                const clickedCard = target.closest('[data-project-card]');
                const currentCard = document.querySelector(`[data-project-card="${contextMenu.result.app!.name}"]`);

                if (clickedCard && clickedCard !== currentCard) {
                    // Right-clicked on a different card, close current menu
                    setContextMenu(null);
                }
            }
        };

        document.addEventListener('mousedown', handleGlobalContextMenu);
        document.addEventListener('contextmenu', handleGlobalContextMenu);

        return () => {
            document.removeEventListener('mousedown', handleGlobalContextMenu);
            document.removeEventListener('contextmenu', handleGlobalContextMenu);
        };
    }, [contextMenu]);

    if (isLoading) {
        return <LoadingState />;
    }

    // Filter out apps that don't have failures
    const appsWithFailures = data.filter(app => app.failedRuns > 0);

    if (data.length === 0) {
        return <NoTestResults />;
    }

    if (appsWithFailures.length === 0) {
        return <AllTestsPassing />;
    }

    const updateLastRunStatus = async (projectName: string) => {
        await apiFetch(`${API_BASE_URL}/api/e2e_reports/project_status/${projectName}`);
        await refetchData();
    };

    // Pagination logic
    const pageCount = Math.ceil(appsWithFailures.length / PAGE_SIZE);
    // Sort data by successRate ascending before paginating
    const sortedData = [...appsWithFailures].sort((a, b) => a.successRate - b.successRate);
    const paginatedData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <Box sx={{ marginTop: 2 }}>
            <Grid container spacing={1.5}>
                {paginatedData.map((result, idx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + idx;
                    const previousValue = globalIdx > 0 ? sortedData[globalIdx - 1] : null;
                    return <ProjectCard
                        key={idx}
                        result={result}
                        previousValue={previousValue}
                        onUpdate={() => updateLastRunStatus(result.app!.code)}
                        onContextMenu={handleContextMenu}
                    />;
                })}
            </Grid>
            {pageCount > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}
            {contextMenu && (
                <ContextMenu
                    mouseX={contextMenu.mouseX}
                    mouseY={contextMenu.mouseY}
                    result={contextMenu.result}
                    loadingAppDetails={contextMenu.loadingAppDetails}
                    onOpenUrl={handleOpenUrlInNewTab}
                    onCopyProjectName={handleCopyProjectName}
                    onCopyProjectCode={handleCopyProjectCode}
                    onTriggerE2ERuns={handleTriggerE2ERuns}
                />
            )}
        </Box>
    );
};

export default TestResultsPerApp;

