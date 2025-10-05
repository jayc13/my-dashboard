/**
 * JIRA Integration Entity Definitions
 * 
 * This module contains all interface definitions related to JIRA integration,
 * including ticket information and JIRA API responses.
 */

/**
 * JIRA ticket/issue information
 */
export interface JiraTicket {
    id: string;
    key: string;
    url: string;
    summary: string;
    status: string;
    created: string;
    updated: string;
    assignee: string;
    reporter: string;
    labels: string[];
    priority: string;
    parent?: {
        id: string;
        key: string;
        url: string;
        summary: string;
    };
}

/**
 * Response structure for JIRA issues API calls
 */
export interface JiraIssuesResponse {
    issues: JiraTicket[];
    total: number;
    startAt?: number;
    maxResults?: number;
}
