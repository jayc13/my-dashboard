import type { JiraTicket } from '@/types';

export const sortTicketsByStatus = (tickets: JiraTicket[] = []): JiraTicket[] => {
    const statusOrder: Record<string, number> = Object.freeze({
        'In Progress': 1,
        'In Review': 2,
        'To Do': 3,
        'Done': 4,
    });

    return [...tickets].sort((a: JiraTicket, b: JiraTicket) => {
        const statusA = a.status;
        const statusB = b.status;

        return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99);
    });
};

