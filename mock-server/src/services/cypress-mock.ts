import { Router } from 'express';
import { CypressRun } from '../types';
import { createRegistryMiddleware } from '../middleware/registry-middleware';

/**
 * Mock Cypress Dashboard API endpoints
 * Based on Cypress Dashboard API calls found in the codebase
 */
export function createCypressMockRouter(): Router {
  const router = Router();

  // Apply registry middleware to all Cypress API calls
  router.use(createRegistryMiddleware('cypress'));

  // Mock data
  const mockRuns: CypressRun[] = [
    {
      runId: 'run-1',
      status: 'passed',
      totalTests: 25,
      totalPassed: 25,
      totalFailed: 0,
      totalPending: 0,
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: '2024-01-15T10:15:00Z'
    },
    {
      runId: 'run-2',
      status: 'failed',
      totalTests: 30,
      totalPassed: 27,
      totalFailed: 3,
      totalPending: 0,
      createdAt: '2024-01-15T09:00:00Z',
      completedAt: '2024-01-15T09:18:00Z'
    },
    {
      runId: 'run-3',
      status: 'running',
      totalTests: 20,
      totalPassed: 15,
      totalFailed: 0,
      totalPending: 5,
      createdAt: '2024-01-15T11:00:00Z'
    }
  ];

  // GET /projects/{projectId}/runs
  // List runs for a project
  router.get('/projects/:projectId/runs', (req, res) => {
    const { projectId } = req.params;
    const { branch, status, limit = '20', offset = '0' } = req.query;

    console.log(`[CYPRESS] Listing runs for project ${projectId}${branch ? ` (branch: ${branch})` : ''}${status ? ` (status: ${status})` : ''}`);

    let filteredRuns = [...mockRuns];
    
    // Filter by status if specified
    if (status && status !== 'all') {
      filteredRuns = filteredRuns.filter(run => run.status === status);
    }

    // Pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    const paginatedRuns = filteredRuns.slice(offsetNum, offsetNum + limitNum);

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        runs: paginatedRuns.map(run => ({
          ...run,
          projectId,
          branch: branch || 'main',
          commit: {
            sha: 'abc123def456',
            branch: branch || 'main',
            message: 'Mock commit message',
            authorName: 'Mock Author',
            authorEmail: 'mock@example.com'
          },
          specs: [
            {
              name: 'cypress/e2e/login.cy.ts',
              tests: Math.floor(run.totalTests * 0.4),
              passing: Math.floor(run.totalPassed * 0.4),
              failing: Math.floor(run.totalFailed * 0.4),
              pending: Math.floor(run.totalPending * 0.4)
            },
            {
              name: 'cypress/e2e/dashboard.cy.ts',
              tests: Math.floor(run.totalTests * 0.6),
              passing: Math.floor(run.totalPassed * 0.6),
              failing: Math.floor(run.totalFailed * 0.6),
              pending: Math.floor(run.totalPending * 0.6)
            }
          ]
        })),
        totalCount: filteredRuns.length,
        hasMore: offsetNum + limitNum < filteredRuns.length
      });
    }, delay);
  });

  // GET /projects/{projectId}/runs/{runId}
  // Get a specific run
  router.get('/projects/:projectId/runs/:runId', (req, res) => {
    const { projectId, runId } = req.params;

    console.log(`[CYPRESS] Fetching run ${runId} for project ${projectId}`);

    const run = mockRuns.find(r => r.runId === runId);
    
    if (!run) {
      res.status(404).json({
        message: 'Run not found'
      });
      return;
    }

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        ...run,
        projectId,
        branch: 'main',
        commit: {
          sha: 'abc123def456',
          branch: 'main',
          message: 'Mock commit message',
          authorName: 'Mock Author',
          authorEmail: 'mock@example.com'
        },
        specs: [
          {
            name: 'cypress/e2e/login.cy.ts',
            tests: Math.floor(run.totalTests * 0.4),
            passing: Math.floor(run.totalPassed * 0.4),
            failing: Math.floor(run.totalFailed * 0.4),
            pending: Math.floor(run.totalPending * 0.4),
            duration: 45000,
            screenshots: run.totalFailed > 0 ? [
              {
                name: 'login failure screenshot',
                url: 'https://mock-cypress-dashboard.com/screenshots/login-failure.png'
              }
            ] : []
          },
          {
            name: 'cypress/e2e/dashboard.cy.ts',
            tests: Math.floor(run.totalTests * 0.6),
            passing: Math.floor(run.totalPassed * 0.6),
            failing: Math.floor(run.totalFailed * 0.6),
            pending: Math.floor(run.totalPending * 0.6),
            duration: 67000,
            screenshots: []
          }
        ],
        duration: run.completedAt ? 
          new Date(run.completedAt).getTime() - new Date(run.createdAt).getTime() : 
          null
      });
    }, delay);
  });

  // GET /projects/{projectId}
  // Get project information
  router.get('/projects/:projectId', (req, res) => {
    const { projectId } = req.params;

    console.log(`[CYPRESS] Fetching project info for ${projectId}`);

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        projectId,
        name: 'My Dashboard E2E Tests',
        public: false,
        orgId: 'org-12345',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        defaultBranch: 'main',
        recentRuns: mockRuns.slice(0, 5).map(run => ({
          runId: run.runId,
          status: run.status,
          createdAt: run.createdAt,
          completedAt: run.completedAt
        }))
      });
    }, delay);
  });

  // GET /projects
  // List projects
  router.get('/projects', (_req, res) => {
    console.log('[CYPRESS] Listing projects');

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json([
        {
          projectId: 'proj-12345',
          name: 'My Dashboard E2E Tests',
          public: false,
          orgId: 'org-12345',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: new Date().toISOString(),
          defaultBranch: 'main'
        },
        {
          projectId: 'proj-67890',
          name: 'Mobile App E2E Tests',
          public: false,
          orgId: 'org-12345',
          createdAt: '2023-02-01T00:00:00Z',
          updatedAt: new Date().toISOString(),
          defaultBranch: 'main'
        }
      ]);
    }, delay);
  });

  // Catch-all for unhandled Cypress API endpoints
  router.all('/*path', (req, res) => {
    console.log(`[CYPRESS] Unhandled endpoint: ${req.method} ${req.path}`);
    res.status(404).json({
      message: 'Not Found'
    });
  });

  return router;
}
