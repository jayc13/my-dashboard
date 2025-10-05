import { Octokit } from '@octokit/core';
import { GithubPullRequestDetails } from '@my-dashboard/types/pull-requests';
import { Logger } from '../utils/logger';

export class GitHubService {
  private static getInstance() {
    return new Octokit({
      auth: process.env.GITHUB_TOKEN,
      baseUrl: process.env.GITHUB_URL,
    });
  }
  /**
     * Get details of a single pull request from GitHub.
     * @param repository - The repository in "owner/repo" format.
     * @param pullNumber - The pull request number.
     */
  public static async getPullRequestDetails(repository: string, pullNumber: number): Promise<GithubPullRequestDetails> {
    const gitHubInstance = this.getInstance();

    const owner = repository.split('/')[0];
    const repo = repository.split('/')[1];

    const result = await gitHubInstance.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
      owner,
      repo,
      pull_number: pullNumber,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    Logger.info(`Fetched pull request details for ${repository}#${pullNumber}`);
    // Check if the request was successful
    if (!result || !result.data) {
      throw new Error(`Failed to fetch pull request details for ${repository}#${pullNumber}`);
    }

    const { data: pullRequestData, status } = result;

    if (status !== 200) {
      throw new Error(`Failed to fetch pull request: ${status}`);
    }

    return {
      // Basic pull request information
      id: pullRequestData.id,
      number: pullRequestData.number,
      title: pullRequestData.title,
      state: pullRequestData.state,
      isDraft: pullRequestData.draft,
      url: pullRequestData.html_url,


      // Timestamps
      createdAt: pullRequestData.created_at,
      updatedAt: pullRequestData.updated_at,
      closedAt: pullRequestData.closed_at,
      mergedAt: pullRequestData.merged_at,

      // Labels, extracted as a simple array of names
      labels: pullRequestData.labels ? pullRequestData.labels.map(label => ({
        name: label.name,
        color: label.color,
      })) : [],
      mergeableState: pullRequestData.mergeable_state,
      merged: pullRequestData.merged,
      // Author information
      author: {
        username: pullRequestData.user ? pullRequestData.user.login : null,
        avatarUrl: pullRequestData.user ? pullRequestData.user.avatar_url : null,
        htmlUrl: pullRequestData.user ? pullRequestData.user.html_url : null,
      },
    };
  }
}