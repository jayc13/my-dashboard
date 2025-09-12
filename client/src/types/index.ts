export interface Notification {
    id: number;
    title: string;
    message: string;
    link?: string
    type: string; // e.g., "info", "warning", "error"
    read: boolean;
    created_at: string;
}

export interface PullRequest {
    id: string;
    pullRequestNumber: number;
    repository: string;
}

export interface GithubPullRequestDetails {
    id: number;
    number: number;
    title: string;
    state: string;
    isDraft: boolean | undefined;
    merged: boolean;
    mergeableState: string;
    createdAt: string;
    updatedAt: string;
    closedAt: string | null;
    mergedAt: string | null;
    labels: { name: string; color: string }[];
    url: string;
    author: {
        username: string | null;
        avatarUrl: string | null;
        htmlUrl: string | null;
    }
}

export interface Application {
    id?: number;
    name: string;
    code: string;
    pipeline_url?: string;
    e2e_trigger_configuration?: string;
    watching: boolean;
}

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
}