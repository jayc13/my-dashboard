import JiraList from '@/sections/tasks-page/components/JiraList';
import type { JiraTicket } from '@/types';

export interface JiraListSectionProps {
  title: string;
  data: JiraTicket[];
  isLoading: boolean;
  hasError: boolean;
  refresh: () => Promise<void>;
  sortByStatus?: boolean;
}

const sortTicketsByStatus = (tickets: JiraTicket[] = []) => {
  const statusOrder: Record<string, number> = Object.freeze({
    'In Progress': 1,
    'In Review': 2,
    'To Do': 3,
    Done: 4,
  });

  return tickets.sort((a: JiraTicket, b: JiraTicket) => {
    const statusA = a.status;
    const statusB = b.status;

    return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99);
  });
};

const JiraListSection = (props: JiraListSectionProps) => {
  const { title, data, isLoading, hasError, refresh, sortByStatus: shouldSort } = props;

  const displayData = shouldSort ? sortTicketsByStatus(data) : data;

  return (
    <JiraList
      title={title}
      refresh={refresh}
      data={displayData}
      isLoading={isLoading}
      hasError={hasError}
    />
  );
};

export default JiraListSection;
