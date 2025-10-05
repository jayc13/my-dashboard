/**
 * JIRA Integration Entity Definitions
 *
 * This module contains all interface definitions related to JIRA integration,
 * including ticket information and JIRA API responses.
 */

/**
 * Raw JIRA API Types (from Atlassian JIRA REST API)
 */

export interface JiraUser {
    displayName: string;
}

export interface JiraStatus {
    name: string;
}

export interface JiraPriority {
    id: string;
    name: string;
}

export interface JiraFields {
    summary: string;
    status: JiraStatus;
    created: string;
    updated: string;
    assignee?: JiraUser;
    reporter?: JiraUser;
    parent?: {
        id: string;
        key: string;
        fields: {
            summary: string;
        };
    };
    labels?: string[];
    priority?: JiraPriority;
}

/**
 * Raw JIRA issue from Atlassian API
 */
export interface JiraIssue {
    id: string;
    key: string;
    fields: JiraFields;
}

/**
 * Raw JIRA API response for search/fetch operations
 */
export interface JiraFetchIssuesResponse {
    total: number;
    issues: JiraIssue[];
    startAt?: number;
    maxResults?: number;
}

/**
 * Formatted JIRA ticket/issue information (used by our API)
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
 * Response structure for JIRA issues API calls (formatted)
 */
export interface JiraIssuesResponse {
    issues: JiraTicket[];
    total: number;
    startAt?: number;
    maxResults?: number;
}
