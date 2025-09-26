/**
 * Application Entity Definitions
 * 
 * This module contains all interface definitions related to applications/projects,
 * including basic application configuration and detailed runtime information.
 */

/**
 * Basic application/project configuration and metadata
 */
export interface Application {
    id?: number;
    name: string;
    code: string;
    pipelineUrl?: string;
    e2eTriggerConfiguration?: string;
    watching: boolean;
}

/**
 * Information about the most recent application run
 */
export interface LastApplicationRun {
    id: number;
    status: string;
    url: string;
    pipelineId: string;
    createdAt: string;
}

/**
 * Extended application information with runtime details
 */
export interface ApplicationDetails extends Application {
    lastRun?: LastApplicationRun;
    e2eRunsQuantity: number;
}
