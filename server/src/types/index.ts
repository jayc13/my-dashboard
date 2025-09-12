export interface ProjectSummary {
    projectName: string;
    projectCode: string | null;
    lastUpdated: string | null;
    lastRunStatus: string;
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    successRate: number;
}

export interface CypressRun {
    project_name: string;
    created_at: string;
    run_number: number;
    commit_author_name: string;
    spec: string;
    status: string;
    total_tests: number;
    pass_tests: number;
    flaky_tests: number;
    fail_tests: number;
    parallel_enabled: boolean;
    commit_branch: string;
    group_name: string | null;
    run_tags: string;
    failed_spec_prioritized: string | null;
    spec_duration: number;
    browser_name: string;
    browser_version: string;
    os_name: string;
    os_version: string;
}

export interface ProjectStatus {
    projectName: string;
    runNumber: number;
    lastRunStatus: string;
    createdAt: string;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id?: number;
    title: string;
    message: string;
    link?: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
}

export interface NotificationInput {
    title: string;
    message: string;
    link?: string; // Optional, can be undefined
    type: NotificationType;
    is_read?: boolean;
    created_at?: string;
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