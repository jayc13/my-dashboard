import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';

import { createGitHubMockRouter } from './services/github-mock';
import { createCircleCIMockRouter } from './services/circleci-mock';
import { createCypressMockRouter } from './services/cypress-mock';
import { createJiraMockRouter } from './services/jira-mock';
import { createRegistryRouter } from './routes/registry';
import { createStatsLoggingMiddleware } from './middleware/registry-middleware';
import { apiCallRegistry } from './registry/api-call-registry';

// Load environment variables
dotenv.config();

const app: express.Express = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
if (process.env.LOG_API_CALLS === 'true') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Stats logging middleware (logs every 30 minutes)
app.use(createStatsLoggingMiddleware(30));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Third-Party Mock Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      github: 'active',
      circleci: 'active',
      cypress: 'active',
      jira: 'active'
    }
  });
});

// Registry management endpoints
app.use('/registry', createRegistryRouter());

// Third-party service mock endpoints
app.use('/github', createGitHubMockRouter());
app.use('/circleci', createCircleCIMockRouter());
app.use('/cypress', createCypressMockRouter());
app.use('/jira', createJiraMockRouter());

// Root endpoint with service information
app.get('/', (_req, res) => {
  const stats = apiCallRegistry.getStats();
  
  res.json({
    name: 'Third-Party Services Mock Server',
    description: 'Mock server for GitHub, CircleCI, Cypress Dashboard, and Jira APIs',
    version: '1.0.0',
    services: {
      github: {
        baseUrl: '/github',
        description: 'GitHub API mock endpoints',
        endpoints: [
          'GET /github/repos/{owner}/{repo}/pulls/{pull_number}',
          'GET /github/repos/{owner}/{repo}/pulls',
          'GET /github/user',
          'GET /github/repos/{owner}/{repo}'
        ]
      },
      circleci: {
        baseUrl: '/circleci',
        description: 'CircleCI API mock endpoints',
        endpoints: [
          'GET /circleci/v2/project/{project-slug}/pipeline',
          'GET /circleci/v2/pipeline/{pipeline-id}',
          'POST /circleci/v2/project/{project-slug}/pipeline',
          'GET /circleci/v2/me'
        ]
      },
      cypress: {
        baseUrl: '/cypress',
        description: 'Cypress Dashboard API mock endpoints',
        endpoints: [
          'GET /cypress/projects/{projectId}/runs',
          'GET /cypress/projects/{projectId}/runs/{runId}',
          'POST /cypress/projects/{projectId}/runs',
          'GET /cypress/projects/{projectId}'
        ]
      },
      jira: {
        baseUrl: '/jira',
        description: 'Jira API mock endpoints',
        endpoints: [
          'GET /jira/rest/api/2/search',
          'GET /jira/rest/api/2/issue/{issueIdOrKey}',
          'POST /jira/rest/api/2/issue',
          'PUT /jira/rest/api/2/issue/{issueIdOrKey}'
        ]
      }
    },
    registry: {
      totalCalls: stats.totalCalls,
      callsToday: stats.callsToday,
      endpoints: {
        calls: 'GET /registry/calls',
        summary: 'GET /registry/summary',
        stats: 'GET /registry/stats',
        export: 'GET /registry/export',
        clear: 'DELETE /registry/calls',
        search: 'GET /registry/calls/search'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`[MOCK-SERVER] Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} is not available on this mock server`,
    availableServices: ['github', 'circleci', 'cypress', 'jira'],
    registryEndpoints: '/registry'
  });
});

// Error handling middleware

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Mock server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An error occurred in the mock server',
    timestamp: new Date().toISOString()
  });
});

// Clear registry on startup if configured
if (process.env.CLEAR_REGISTRY_ON_START === 'true') {
  apiCallRegistry.clear();
  console.log('Registry cleared on startup');
}

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Third-Party Services Mock Server Started');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Registry stats: http://localhost:${PORT}/registry/stats`);
  console.log('\n📋 Available Services:');
  console.log(`   • GitHub API: http://localhost:${PORT}/github`);
  console.log(`   • CircleCI API: http://localhost:${PORT}/circleci`);
  console.log(`   • Cypress Dashboard: http://localhost:${PORT}/cypress`);
  console.log(`   • Jira API: http://localhost:${PORT}/jira`);
  console.log('\n📈 Registry Management:');
  console.log(`   • View calls: http://localhost:${PORT}/registry/calls`);
  console.log(`   • Summary: http://localhost:${PORT}/registry/summary`);
  console.log(`   • Export: http://localhost:${PORT}/registry/export`);
  console.log('\n🎯 All API calls to third-party services will be automatically registered and logged.');
  console.log('================================================================================\n');
});

export default app;
