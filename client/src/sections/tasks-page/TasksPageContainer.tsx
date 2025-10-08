import { useMyJiraTickets, useManualQATasks } from '@/hooks';
import TasksPage from './TasksPage';

const TasksPageContainer = () => {
  const {
    data: myTicketsData,
    loading: isLoadingMyTickets,
    error: errorMyTickets,
    refetch: refetchMyTickets,
  } = useMyJiraTickets();

  const {
    data: manualTestingData,
    loading: isLoadingManualTesting,
    error: errorManualTesting,
    refetch: refetchManualTesting,
  } = useManualQATasks();

  return (
    <TasksPage
      myTicketsData={myTicketsData?.issues}
      manualTestingData={manualTestingData?.issues}
      isLoadingMyTickets={isLoadingMyTickets}
      isLoadingManualTesting={isLoadingManualTesting}
      errorMyTickets={errorMyTickets}
      errorManualTesting={errorManualTesting}
      refetchMyTickets={refetchMyTickets}
      refetchManualTesting={refetchManualTesting}
    />
  );
};

export default TasksPageContainer;
