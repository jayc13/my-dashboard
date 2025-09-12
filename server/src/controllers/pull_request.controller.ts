import { Request, Response } from 'express';
import { PullRequestService } from '../services/pull_request.service';
import { GitHubService } from '../services/github.service';

const pullRequestService = new PullRequestService();

export class PullRequestController {
  // List all PRs
  listPullRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const pullRequests = await pullRequestService.listPullRequests();
      res.status(200).json(pullRequests);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pull requests', error });
    }
  };

  // Add a new PR
  addPullRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pull_request_number, repository } = req.body;
      const newPR = await pullRequestService.addPullRequest({
        pullRequestNumber: pull_request_number,
        repository,
      });
      res.status(201).json(newPR);
    } catch (error) {
      res.status(500).json({ message: 'Error creating pull request', error });
    }
  };

  getPullRequestDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const pullRequest = await pullRequestService.getPullRequestById(id);
      if (!pullRequest) {
        res.status(404).json({ message: 'Pull request not found' });
        return;
      }
      const details = await GitHubService.getPullRequestDetails(pullRequest.repository, pullRequest.pullRequestNumber);
      res.status(200).json(details);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pull request details', error });
    }
  };

  // Delete a PR
  deletePullRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await pullRequestService.deletePullRequest(id);
      res.status(200).json({ message: 'Pull request deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting pull request', error });
    }
  };
}