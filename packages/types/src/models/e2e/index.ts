/**
 * E2E Testing Entity Definitions
 * 
 * This module contains all interface definitions related to end-to-end testing,
 * including Cypress test runs, project summaries, and test status information.
 */

/**
 * Summary statistics for an E2E test project
 */
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

/**
 * Individual Cypress test run details
 */
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

/**
 * Current status of a project's test runs
 */
export interface ProjectStatus {
    projectName: string;
    runNumber: number;
    lastRunStatus: string;
    createdAt: string;
}

export interface E2EReportSummary {
    id: number;
    date: string; // ISO date string in 'YYYY-MM-DD' format (UTC)
    status: 'ready' | 'pending' | 'failed';
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    successRate: number; // Value between 0 and 1
}

export interface E2EReportDetail {
    id: number;
    reportSummaryId: number;
    appId: number;
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    successRate: number; // Value between 0 and 1
    lastRunStatus: string;
    lastFailedRunAt: string | null; // ISO date string or null
    lastRunAt: string; // ISO date string
}
