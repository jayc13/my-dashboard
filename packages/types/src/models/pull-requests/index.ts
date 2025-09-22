/**
 * Pull Request Entity Definitions
 * 
 * This module contains all interface definitions related to pull requests,
 * including basic pull request information and detailed GitHub pull request data.
 */

/**
 * Basic pull request information
 */
export interface PullRequest {
    id: string;
    pullRequestNumber: number;
    repository: string;
}

/**
 * Input data for creating or updating pull requests
 */
export interface PullRequestInput {
    id: string;
    pullRequestNumber: number;
    repository: string;
}

/**
 * Detailed GitHub pull request data
 */
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
    };
}
