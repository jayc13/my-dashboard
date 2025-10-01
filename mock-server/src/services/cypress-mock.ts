import { Router } from 'express';
import { createRegistryMiddleware } from '../middleware/registry-middleware';

const getMockSpecDetailsStatus = (project: string) => {
  let status = Math.random() > 0.3 ? 'passed' : 'failed';

  if (project === 'app-passing') {
    status = 'passed';
  }

  if (project === 'app-failing') {
    status = 'failed';
  }
  return status;
}

const getMockSpecDetailsResponse = (project: string) => {

  if (project === 'project-with-no-runs') {
    return [];
  }

  return (new Array(Math.floor(Math.random() * 100)))
    .fill(null).map((_, index) => ({
      project_name: project,
      created_at: "2025-09-29T03:23:58Z",
      run_number: index + 1,
      commit_author_name: "Developer Name",
      spec: `cypress/e2e/test-suite-${index + 1}.cy.ts`,
      status: getMockSpecDetailsStatus(project),
      total_tests: 7,
      pass_tests: 7,
      flaky_tests: 0,
      fail_tests: 0,
      parallel_enabled: true,
      commit_branch: "master",
      group_name: null,
      run_tags: "[gamma]",
      failed_spec_prioritized: null,
      spec_duration: 22277,
      browser_name: "Electron",
      browser_version: "136.0.7103.149",
      os_name: "linux",
      os_version: "Debian GNU/Linux - 12"
    }));
}


/**
 * Mock Cypress Dashboard API endpoints
 * Based on Cypress Dashboard API calls found in the codebase
 */
export function createCypressMockRouter(): Router {
  const router = Router();

  // Apply registry middleware to all Cypress API calls
  router.use(createRegistryMiddleware('cypress'));

  // Accept requests from the parent path "/cypress" as well as the root
  router.get('/', (req, res) => {
    const reportId = req.query.report_id as string;

    const ALLOWED_REPORT_IDS = ['spec-details'];

    if (!reportId || !ALLOWED_REPORT_IDS.includes(reportId)) {
      return res.status(400).json({
        message: 'Invalid or missing report_id parameter. Allowed values: ' + ALLOWED_REPORT_IDS.join(', ')
      });
    }

    if (reportId === 'spec-details') {
      const projects = req.query.projects;
      if (!projects) {
        return res.status(400).json({
          message: 'Missing projects parameter'
        });
      }

      // For simplicity, return a static mock response

      const projectList = Array.isArray(projects) ? projects : [projects];
      const response = projectList.map(proj => getMockSpecDetailsResponse(proj as string)).flat();

      return res.status(200).json(response);

    }

    return res.json({
      message: 'Cypress Dashboard API Mock',
      query: req.query,
      allowedReportIds: ALLOWED_REPORT_IDS
    });
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
