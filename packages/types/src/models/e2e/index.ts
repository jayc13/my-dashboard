import { ApplicationDetails } from '../applications';

/**
 * E2E Testing Entity Definitions
 * 
 * This module contains all interface definitions related to end-to-end testing,
 * including Cypress test runs, project summaries, and test status information.
 */


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
    lastRunStatus: 'passed' | 'failed';
    lastFailedRunAt: string | null; // ISO date string or null
    lastRunAt: string; // ISO date string
}

/**
 * Message payload for E2E report generation
 */
export interface E2EReportMessage {
    date: string; // ISO date string in 'YYYY-MM-DD' format
    requestId?: string; // Optional request ID for tracking
    retryCount?: number; // Number of retry attempts
}

export interface AppDetailedE2EReportDetail extends ApplicationDetails {
    manualRuns?: E2EManualRun[]
}

export interface DetailedE2EReportDetail extends E2EReportDetail {
    app?: AppDetailedE2EReportDetail
}

export interface DetailedE2EReport {
    summary: E2EReportSummary;
    details?: DetailedE2EReportDetail[];
    message?: string; // Optional message, e.g., for pending status
}

export interface E2EManualRun {
    id?: number;
    appId: number;
    pipelineId: string;
    createdAt?: string;
}

export interface E2EManualRunInput {
    appId: number;
}

export interface E2EManualRunOptions {
    filter?: {
        from?: string; // ISO date string
        to?: string;   // ISO date string
    };
}

export interface DetailedE2EReportEnrichments {
    includeDetails?: boolean; // Include detailed report entries
    includeAppInfo?: boolean; // Include application details
    includeManualRuns?: boolean; // Include manual runs for each application
}

export interface DetailedE2EReportOptions {
    date?: string;
    enrichments?: DetailedE2EReportEnrichments;
}