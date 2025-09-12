import { db } from '../db/database';
import { PullRequest } from '../types';

export interface PullRequestInput {
    pullRequestNumber: number;
    repository: string;
}

export class PullRequestService {
  async listPullRequests(): Promise<PullRequest[]> {
    try {
      const rows = await db.all('SELECT * FROM pull_requests ORDER BY id DESC');
      return rows.map(row => ({
        id: row.id,
        pullRequestNumber: row.pull_request_number,
        repository: row.repo,
      }));
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      throw error;
    }
  }

  async addPullRequest(data: PullRequestInput): Promise<PullRequest> {
    const { pullRequestNumber, repository } = data;

    if (!pullRequestNumber || !repository) {
      throw new Error('Pull request number and repository are required');
    }

    try {
      await db.run(
        'INSERT INTO pull_requests (pull_request_number, repo) VALUES (?, ?)',
        [pullRequestNumber, repository],
      );

      // Fetch the newly added pull request
      const row = await db.get(
        'SELECT * FROM pull_requests WHERE pull_request_number = ? AND repo = ?',
        [pullRequestNumber, repository],
      );

      if (!row) {
        throw new Error('Failed to retrieve newly added pull request');
      }

      return {
        id: row.id,
        pullRequestNumber: row.pull_request_number,
        repository: row.repo,
      };
    } catch (error) {
      console.error('Error adding pull request:', error);
      throw error;
    }
  }

  async getPullRequestById(id: number | string): Promise<PullRequest> {
    try {
      const row = await db.get('SELECT * FROM pull_requests WHERE id = ?', [id]);
      if (!row) {
        throw new Error(`Pull request with id ${id} not found`);
      }
      return {
        id: row.id,
        pullRequestNumber: row.pull_request_number,
        repository: row.repo,
      };
    } catch (error) {
      console.error('Error fetching pull request:', error);
      throw error;
    }
  }

  async deletePullRequest(id: number | string): Promise<void> {
    try {
      await db.run('DELETE FROM pull_requests WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting pull request:', error);
      throw error;
    }
  }
}

