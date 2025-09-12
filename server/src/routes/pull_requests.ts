import express from 'express';
import { PullRequestController } from '../controllers/pull_request.controller';

const controller = new PullRequestController();

export function createPullRequestRouter() {
  const router = express.Router();

  // List all PRs
  router.get('/', controller.listPullRequests);

  // Add a new PR
  router.post('/', controller.addPullRequest);

  // Get a GitHub PR information
  router.get('/:id', controller.getPullRequestDetails);

  // Delete a PR
  router.delete('/:id', controller.deletePullRequest);

  return router;
}