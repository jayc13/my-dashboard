import { Router } from 'express';
import { CircleCIPipeline } from '../types';
import { createRegistryMiddleware } from '../middleware/registry-middleware';

/**
 * Mock CircleCI API endpoints
 * Based on CircleCI API calls found in the codebase
 */
export function createCircleCIMockRouter(): Router {
  const router = Router();

  // Apply registry middleware to all CircleCI API calls
  router.use(createRegistryMiddleware('circleci'));

  // Mock data
  const mockPipelines: CircleCIPipeline[] = [
    {
      id: 'pipeline-1',
      number: 123,
      state: 'success',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:15:00Z',
      project_slug: 'gh/jayc13/my-dashboard'
    },
    {
      id: 'pipeline-2',
      number: 124,
      state: 'running',
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:05:00Z',
      project_slug: 'gh/jayc13/my-dashboard'
    },
    {
      id: 'pipeline-3',
      number: 125,
      state: 'failed',
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-15T09:20:00Z',
      project_slug: 'gh/jayc13/my-dashboard'
    }
  ];

  // GET /v2/project/{project-slug}/pipeline
  // List pipelines for a project
  router.get('/v2/project/:vcs/:org/:repo/pipeline', (req, res) => {
    const { vcs, org, repo } = req.params;
    const projectSlug = `${vcs}/${org}/${repo}`;
    const { branch, page_token } = req.query;

    console.log(`[CIRCLECI] Listing pipelines for ${projectSlug}${branch ? ` (branch: ${branch})` : ''}`);

    let filteredPipelines = mockPipelines.filter(p => p.project_slug === projectSlug);
    
    // If branch filter is specified, simulate filtering
    if (branch) {
      // For mock purposes, assume some pipelines are for the specified branch
      filteredPipelines = filteredPipelines.filter((_, index) => index % 2 === 0);
    }

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        items: filteredPipelines.map(pipeline => ({
          ...pipeline,
          vcs: {
            origin_repository_url: `https://github.com/${org}/${repo}`,
            target_repository_url: `https://github.com/${org}/${repo}`,
            revision: 'abc123def456',
            provider_name: 'GitHub',
            branch: branch || 'main'
          },
          trigger: {
            type: 'webhook',
            received_at: pipeline.created_at
          }
        })),
        next_page_token: page_token ? null : 'next-page-token-123'
      });
    }, delay);
  });

  // GET /v2/pipeline/{pipeline-id}
  // Get a single pipeline
  router.get('/v2/pipeline/:pipeline_id', (req, res) => {
    const { pipeline_id } = req.params;

    console.log(`[CIRCLECI] Fetching pipeline ${pipeline_id}`);

    const pipeline = mockPipelines.find(p => p.id === pipeline_id);
    
    if (!pipeline) {
      res.status(404).json({
        message: 'Pipeline not found'
      });
      return;
    }

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        ...pipeline,
        vcs: {
          origin_repository_url: 'https://github.com/jayc13/my-dashboard',
          target_repository_url: 'https://github.com/jayc13/my-dashboard',
          revision: 'abc123def456',
          provider_name: 'GitHub',
          branch: 'main'
        },
        trigger: {
          type: 'webhook',
          received_at: pipeline.created_at
        }
      });
    }, delay);
  });

  // GET /v2/pipeline/{pipeline-id}/workflow
  // Get workflows for a pipeline
  router.get('/v2/pipeline/:pipeline_id/workflow', (req, res) => {
    const { pipeline_id } = req.params;

    console.log(`[CIRCLECI] Fetching workflows for pipeline ${pipeline_id}`);

    const pipeline = mockPipelines[Math.floor(Math.random() * mockPipelines.length)]!;

    const getRandomStatus = () => {
      const statuses = ['success', 'failed', 'running'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    }

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        items: [
          {
            id: `workflow-${pipeline_id}-1`,
            name: 'build-and-test',
            status: getRandomStatus(),
            created_at: pipeline.created_at,
            stopped_at: pipeline.state === 'running' ? null : pipeline.updated_at,
            pipeline_id: pipeline_id,
            pipeline_number: pipeline.number
          }
        ],
        next_page_token: null
      });
    }, delay);
  });

  // GET /v2/workflow/{workflow-id}/job
  // Get jobs for a workflow
  router.get('/v2/workflow/:workflow_id/job', (req, res) => {
    const { workflow_id } = req.params;

    console.log(`[CIRCLECI] Fetching jobs for workflow ${workflow_id}`);

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        items: [
          {
            id: `job-${workflow_id}-1`,
            name: 'build',
            status: 'success',
            started_at: '2024-01-15T10:01:00Z',
            stopped_at: '2024-01-15T10:05:00Z',
            job_number: 1
          },
          {
            id: `job-${workflow_id}-2`,
            name: 'test',
            status: 'success',
            started_at: '2024-01-15T10:05:00Z',
            stopped_at: '2024-01-15T10:12:00Z',
            job_number: 2
          },
          {
            id: `job-${workflow_id}-3`,
            name: 'e2e-tests',
            status: Math.random() > 0.7 ? 'failed' : 'success',
            started_at: '2024-01-15T10:12:00Z',
            stopped_at: '2024-01-15T10:18:00Z',
            job_number: 3
          }
        ],
        next_page_token: null
      });
    }, delay);
  });

  // POST /v2/project/{project-slug}/pipeline
  // Trigger a new pipeline
  router.post('/v2/project/:vcs/:org/:repo/pipeline', (req, res) => {
    const { vcs, org, repo } = req.params;
    const projectSlug = `${vcs}/${org}/${repo}`;
    const { branch = 'main', parameters = {} } = req.body;

    console.log(`[CIRCLECI] Triggering pipeline for ${projectSlug} on branch ${branch}`);

    const newPipeline: CircleCIPipeline = {
      id: `pipeline-${Date.now()}`,
      number: mockPipelines.length + 1,
      state: 'created',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_slug: projectSlug
    };

    mockPipelines.unshift(newPipeline);

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.status(201).json({
        ...newPipeline,
        vcs: {
          origin_repository_url: `https://github.com/${org}/${repo}`,
          target_repository_url: `https://github.com/${org}/${repo}`,
          revision: 'latest-commit-sha',
          provider_name: 'GitHub',
          branch: branch
        },
        trigger: {
          type: 'api',
          received_at: newPipeline.created_at
        },
        parameters
      });
    }, delay);
  });

  // GET /v2/me
  // Get current user info
  router.get('/v2/me', (_req, res) => {
    console.log('[CIRCLECI] Fetching current user info');
    
    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        id: 'user-12345',
        login: 'mock-circleci-user',
        name: 'Mock CircleCI User'
      });
    }, delay);
  });

  // Catch-all for unhandled CircleCI API endpoints
  router.all('/*path', (req, res) => {
    console.log(`[CIRCLECI] Unhandled endpoint: ${req.method} ${req.path}`);
    res.status(404).json({
      message: 'Not Found'
    });
  });

  return router;
}
