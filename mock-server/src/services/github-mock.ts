import { Router } from 'express';
import { GitHubPullRequest } from '../types';
import { createRegistryMiddleware } from '../middleware/registry-middleware';

/**
 * Mock GitHub API endpoints
 * Based on the GitHub API calls found in the codebase
 */
export function createGitHubMockRouter(): Router {
  const router = Router();

  // Apply registry middleware to all GitHub API calls
  router.use(createRegistryMiddleware('github'));

  // Mock data
  const mockPullRequests: GitHubPullRequest[] = [
    {
      id: 1,
      number: 123,
      title: 'Add new feature for dashboard',
      state: 'open',
      user: {
        login: 'developer1',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4'
      },
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      html_url: 'https://github.com/jayc13/my-dashboard/pull/123'
    },
    {
      id: 2,
      number: 124,
      title: 'Fix bug in API endpoint',
      state: 'closed',
      user: {
        login: 'developer2',
        avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4'
      },
      created_at: '2024-01-14T09:00:00Z',
      updated_at: '2024-01-14T16:45:00Z',
      merged_at: '2024-01-14T16:45:00Z',
      html_url: 'https://github.com/jayc13/my-dashboard/pull/124'
    }
  ];

  // GET /repos/{owner}/{repo}/pulls/{pull_number}
  // This matches the GitHub API call in server/src/services/github.service.ts
  router.get('/repos/:owner/:repo/pulls/:pull_number', (req, res) => {
    const { owner, repo, pull_number } = req.params;
    const pullNumber = parseInt(pull_number, 10);

    console.log(`[GITHUB] Fetching PR details for ${owner}/${repo}#${pullNumber}`);

    // Find mock PR or create a dynamic one
    let pullRequest = mockPullRequests.find(pr => pr.number === pullNumber);
    
    if (!pullRequest) {
      // Generate a mock PR if not found
      pullRequest = {
        id: Date.now(),
        number: pullNumber,
        title: `Mock PR #${pullNumber} for ${repo}`,
        state: Math.random() > 0.5 ? 'open' : 'closed',
        user: {
          login: 'mock-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/mock?v=4'
        },
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        html_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}`
      };

      if (pullRequest.state === 'closed' && Math.random() > 0.5) {
        pullRequest.merged_at = pullRequest.updated_at;
      }
    }

    // Add realistic delay
    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        ...pullRequest,
        // Add additional GitHub API fields that might be expected
        draft: false,
        mergeable_state: 'clean',
        merged: !!pullRequest.merged_at,
        labels: [
          { name: 'enhancement', color: 'a2eeef' },
          { name: 'frontend', color: 'e99695' }
        ]
      });
    }, delay);
  });

  // Catch-all for unhandled GitHub API endpoints
  router.all('*', (req, res) => {
    console.log(`[GITHUB] Unhandled endpoint: ${req.method} ${req.path}`);
    res.status(404).json({
      message: 'Not Found',
      documentation_url: 'https://docs.github.com/rest'
    });
  });

  return router;
}
