import { Request, Response, NextFunction } from 'express';
import { PullRequestService } from '../services/pull_request.service';
import { GitHubService } from '../services/github.service';
import { NotFoundError, ValidationError, DatabaseError, ExternalServiceError } from '../errors/AppError';
import { validateId, validateRequiredFields, validateAndSanitizeString } from '../utils/validation';

const pullRequestService = new PullRequestService();

export class PullRequestController {
  // List all PRs
  listPullRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pullRequests = await pullRequestService.listPullRequests();
      res.status(200).json({ success: true, data: pullRequests });
    } catch (error) {
      next(new DatabaseError('Failed to fetch pull requests', error as Error));
    }
  };

  // Add a new PR
  addPullRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pullRequestNumber, repository } = req.body;

      // Validate required fields
      validateRequiredFields(req.body, ['pullRequestNumber', 'repository']);

      // Validate pull request number
      const prNumber = validateId(pullRequestNumber, 'pullRequestNumber');

      // Validate and sanitize repository
      const sanitizedRepository = validateAndSanitizeString(repository, 'repository', {
        required: true,
        max: 255,
      });

      const newPR = await pullRequestService.addPullRequest({
        pullRequestNumber: prNumber,
        repository: sanitizedRepository!,
      });

      res.status(201).json({ success: true, data: newPR });
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        next(new DatabaseError('Failed to create pull request', error as Error));
      }
    }
  };

  getPullRequestDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = validateId(req.params.id, 'id');

      const pullRequest = await pullRequestService.getPullRequestById(id.toString());
      if (!pullRequest) {
        throw new NotFoundError('Pull request', id);
      }

      const details = await GitHubService.getPullRequestDetails(
        pullRequest.repository,
        pullRequest.pullRequestNumber,
      );

      res.status(200).json({ success: true, data: details });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        next(error);
      } else {
        next(new ExternalServiceError('GitHub', 'Failed to fetch pull request details', error as Error));
      }
    }
  };

  // Delete a PR
  deletePullRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = validateId(req.params.id, 'id');

      // Check if PR exists
      const existingPR = await pullRequestService.getPullRequestById(id.toString());
      if (!existingPR) {
        throw new NotFoundError('Pull request', id);
      }

      await pullRequestService.deletePullRequest(id.toString());
      res.status(200).json({ success: true, message: 'Pull request deleted successfully' });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        next(error);
      } else {
        next(new DatabaseError('Failed to delete pull request', error as Error));
      }
    }
  };
}