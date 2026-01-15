import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import type { AppDetailedE2EReportDetail, DetailedE2EReportDetail } from '@my-dashboard/types';
import { useTriggerManualRun, useGetAppLastStatus } from '@/hooks/useE2ERun';
import { useSDK } from '@/contexts/useSDK';
import LoadingState from './LoadingState';
import { AllTestsPassing, NoTestResults } from './EmptyStates';
import ProjectCardGroup from './ProjectCardGroup';
import ContextMenu from './ContextMenu.tsx';

export interface TestResultsPerAppProps {
  data?: DetailedE2EReportDetail[];
  isLoading?: boolean;
  refetchData: () => Promise<void>;
  showAllApps?: boolean;
  isPending?: boolean;
}

const TestResultsPerApp = (props: TestResultsPerAppProps) => {
  const { data, isLoading = false, refetchData, showAllApps = false, isPending = false } = props;

  const { api } = useSDK();
  const { mutate: triggerManualRun } = useTriggerManualRun();
  const { mutate: getAppLastStatus } = useGetAppLastStatus();

  // Filter apps based on showAllApps toggle
  const filteredApps = showAllApps || !data ? data : data.filter(app => app.failedRuns > 0);

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    result?: AppDetailedE2EReportDetail;
    loadingAppDetails: boolean;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const fetchAppDetails = async (appId: number): Promise<AppDetailedE2EReportDetail | null> => {
    if (!api) {
      enqueueSnackbar('API is not available.', { variant: 'error' });
      return null;
    }
    return await api.applications.getApplication(appId);
  };

  const handleContextMenu = async (event: React.MouseEvent, result: AppDetailedE2EReportDetail) => {
    event.preventDefault();

    // Set initial context menu state with loading
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      result,
      loadingAppDetails: true,
    });

    // Fetch app details
    const appDetails: AppDetailedE2EReportDetail | null = await fetchAppDetails(result!.id!);

    if (!appDetails) {
      enqueueSnackbar('Failed to fetch application details.', { variant: 'error' });
      handleCloseContextMenu();
      return;
    }

    // Update context menu with app details
    setContextMenu(prev => {
      if (prev) {
        return {
          ...prev,
          result: appDetails,
          loadingAppDetails: false,
        };
      }
      return prev;
    });
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
      await navigator.clipboard.writeText(contextMenu.result!.name!);
      handleCloseContextMenu();
    }
  };

  const handleTriggerE2ERuns = async () => {
    if (contextMenu) {
      const appId: number = contextMenu.result!.id!;
      if (!appId) {
        enqueueSnackbar('App ID is missing. Cannot trigger E2E runs.', { variant: 'error' });
        return;
      }
      handleCloseContextMenu();
      try {
        await triggerManualRun(appId);
        const appName = contextMenu.result!.name;
        refetchData();
        enqueueSnackbar(`E2E run for ${appName} were triggered successfully!`, {
          variant: 'success',
          autoHideDuration: 10 * 1000,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        enqueueSnackbar(`Failed to trigger E2E runs: ${errorMessage}`, { variant: 'error' });
      }
    }
  };

  const handleCopyProjectCode = async () => {
    if (contextMenu) {
      await navigator.clipboard.writeText(contextMenu.result!.code);
      handleCloseContextMenu();
    }
  };

  // Handle right-click on different cards to close current menu
  useEffect(() => {
    if (!contextMenu) {
      return;
    }
    const handleGlobalContextMenu = (event: MouseEvent) => {
      if (contextMenu) {
        const target = event.target as Element;
        const clickedCard = target.closest('[data-project-card]');
        const currentCard = document.querySelector(
          `[data-project-card="${contextMenu.result!.name}"]`,
        );
        if (clickedCard && clickedCard !== currentCard) {
          setContextMenu(null);
        }
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleGlobalContextMenu);
    document.addEventListener('contextmenu', handleGlobalContextMenu);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleGlobalContextMenu);
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  if (isLoading || isPending || !data) {
    return <LoadingState />;
  }

  if (data.length === 0 && !isPending) {
    return <NoTestResults />;
  }

  if (filteredApps?.length === 0 && !isPending) {
    return <AllTestsPassing />;
  }

  const updateLastRunStatus = async (summaryId: number, appId: number) => {
    await getAppLastStatus({ summaryId, appId });
    await refetchData();
  };
  // Sort data by successRate ascending
  const sortedData = filteredApps
    ? [...filteredApps].sort((a, b) => a.successRate - b.successRate)
    : [];

  // Group by lastRunStatus
  const failedApps = sortedData.filter(app => app.lastRunStatus === 'failed');
  const passingApps = sortedData.filter(app => app.lastRunStatus === 'passed');

  return (
    <Box sx={{ marginTop: 2 }}>
      <ProjectCardGroup
        title="Failed"
        status="failing"
        data={failedApps}
        sortedData={sortedData}
        onUpdate={updateLastRunStatus}
        onContextMenu={handleContextMenu}
        backgroundColor="error.light"
      />
      <ProjectCardGroup
        title="Passing"
        status="passing"
        data={passingApps}
        sortedData={sortedData}
        onUpdate={updateLastRunStatus}
        onContextMenu={handleContextMenu}
        hiddenByDefault
        backgroundColor="success.light"
      />
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'absolute',
            left: contextMenu.mouseX,
            top: contextMenu.mouseY,
            zIndex: 1300,
          }}
        >
          <ContextMenu
            mouseX={0}
            mouseY={0}
            result={contextMenu.result}
            loadingAppDetails={contextMenu.loadingAppDetails}
            onOpenUrl={handleOpenUrlInNewTab}
            onCopyProjectName={handleCopyProjectName}
            onCopyProjectCode={handleCopyProjectCode}
            onTriggerE2ERuns={handleTriggerE2ERuns}
          />
        </div>
      )}
    </Box>
  );
};

export default TestResultsPerApp;
