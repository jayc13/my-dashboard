import { getSDK } from '@/utils/sdk';
import { GithubPullRequestDetails, PullRequest } from '@my-dashboard/types';

/**
 * Extended PR with database ID for easier reference
 */
export interface PRWithDetails extends GithubPullRequestDetails {
  dbId: string;
  dbPullRequestNumber: number;
  dbRepository: string;
}

/**
 * Result of fetching all PRs with their details
 */
export interface FetchAllPRsResult {
  allPRs: PRWithDetails[];
  errors: Array<{ prId: string; error: unknown }>;
}

/**
 * Unified Pull Request Service
 * 
 * This service provides a centralized way to fetch all pull requests
 * with their GitHub details in one operation. This avoids redundant
 * API calls across different cron jobs.
 */
export class PullRequestService {
  /**
   * Fetch all pull requests from the database and enrich them with GitHub details
   * 
   * This method:
   * 1. Fetches all PRs from the database
   * 2. For each PR, fetches detailed information from GitHub
   * 3. Returns both successful fetches and any errors encountered
   * 
   * @returns Promise with all PRs with details and any errors
   */
  public static async fetchAllPRsWithDetails(): Promise<FetchAllPRsResult> {
    const sdk = await getSDK();
    const pullRequests: PullRequest[] = await sdk.pullRequests.getPullRequests();

    const allPRs: PRWithDetails[] = [];
    const errors: Array<{ prId: string; error: unknown }> = [];

    console.log(`[PR Service] Fetching details for ${pullRequests.length} pull request(s)...`);

    // Fetch details for each PR
    for (const pr of pullRequests) {
      try {
        const details = await sdk.pullRequests.getPullRequestDetails(pr.id);
        
        allPRs.push({
          ...details,
          dbId: pr.id,
          dbPullRequestNumber: pr.pullRequestNumber,
          dbRepository: pr.repository,
        });
      } catch (error) {
        console.error(`[PR Service] Error fetching details for PR ${pr.id}:`, error);
        errors.push({ prId: pr.id, error });
      }
    }

    console.log(`[PR Service] Successfully fetched ${allPRs.length} PR(s) with details`);
    if (errors.length > 0) {
      console.warn(`[PR Service] Failed to fetch ${errors.length} PR(s)`);
    }

    return { allPRs, errors };
  }

  /**
   * Filter PRs by their state
   * 
   * @param prs Array of PRs with details
   * @param state State to filter by ('open' or 'closed')
   * @returns Filtered array of PRs
   */
  public static filterByState(prs: PRWithDetails[], state: 'open' | 'closed'): PRWithDetails[] {
    return prs.filter(pr => pr.state === state);
  }

  /**
   * Filter PRs by merged status
   * 
   * @param prs Array of PRs with details
   * @param merged Whether to filter for merged or not merged PRs
   * @returns Filtered array of PRs
   */
  public static filterByMerged(prs: PRWithDetails[], merged: boolean): PRWithDetails[] {
    return prs.filter(pr => pr.merged === merged);
  }

  /**
   * Filter PRs by mergeable state
   * 
   * @param prs Array of PRs with details
   * @param mergeableStates Array of mergeable states to include
   * @returns Filtered array of PRs
   */
  public static filterByMergeableState(
    prs: PRWithDetails[],
    mergeableStates: string[],
  ): PRWithDetails[] {
    return prs.filter(pr => mergeableStates.includes(pr.mergeableState));
  }

  /**
   * Calculate the age of a PR in days
   * 
   * @param createdAt ISO 8601 date string
   * @returns Age in days
   */
  public static calculateAgeInDays(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - created.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }
}

