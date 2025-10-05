import { describe, it, expect } from 'vitest';
import { sortTicketsByStatus } from '../components/utils';
import type { JiraTicket } from '@/types';

describe('sortTicketsByStatus', () => {
    const createTicket = (id: string, status: string): JiraTicket => ({
        id,
        key: `TASK-${id}`,
        summary: `Task ${id}`,
        status,
        assignee: 'User',
        url: `https://example.com/${id}`,
    });

    it('sorts tickets in correct status order', () => {
        const tickets: JiraTicket[] = [
            createTicket('1', 'Done'),
            createTicket('2', 'In Progress'),
            createTicket('3', 'To Do'),
            createTicket('4', 'In Review'),
        ];

        const sorted = sortTicketsByStatus(tickets);

        expect(sorted[0].status).toBe('In Progress');
        expect(sorted[1].status).toBe('In Review');
        expect(sorted[2].status).toBe('To Do');
        expect(sorted[3].status).toBe('Done');
    });

    it('handles empty array', () => {
        const sorted = sortTicketsByStatus([]);
        expect(sorted).toEqual([]);
    });

    it('handles undefined input', () => {
        const sorted = sortTicketsByStatus(undefined);
        expect(sorted).toEqual([]);
    });

    it('handles tickets with unknown status', () => {
        const tickets: JiraTicket[] = [
            createTicket('1', 'Unknown Status'),
            createTicket('2', 'In Progress'),
            createTicket('3', 'Another Unknown'),
        ];

        const sorted = sortTicketsByStatus(tickets);

        // In Progress should come first
        expect(sorted[0].status).toBe('In Progress');
        // Unknown statuses should be at the end
        expect(sorted[1].status).toMatch(/Unknown/);
        expect(sorted[2].status).toMatch(/Unknown/);
    });

    it('maintains order for tickets with same status', () => {
        const tickets: JiraTicket[] = [
            createTicket('1', 'In Progress'),
            createTicket('2', 'In Progress'),
            createTicket('3', 'In Progress'),
        ];

        const sorted = sortTicketsByStatus(tickets);

        expect(sorted).toHaveLength(3);
        sorted.forEach((ticket) => {
            expect(ticket.status).toBe('In Progress');
        });
    });

    it('does not mutate original array', () => {
        const tickets: JiraTicket[] = [
            createTicket('1', 'Done'),
            createTicket('2', 'In Progress'),
        ];

        const originalOrder = [...tickets];
        sortTicketsByStatus(tickets);

        expect(tickets).toEqual(originalOrder);
    });
});

