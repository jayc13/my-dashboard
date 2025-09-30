import { Router } from 'express';
import { JiraIssue } from '../types';
import { createRegistryMiddleware } from '../middleware/registry-middleware';

/**
 * Mock Jira API endpoints
 * Based on Jira API calls found in the codebase
 */
export function createJiraMockRouter(): Router {
  const router = Router();

  // Apply registry middleware to all Jira API calls
  router.use(createRegistryMiddleware('jira'));

  // Mock data
  const mockIssues: JiraIssue[] = [
    {
      id: '10001',
      key: 'DASH-123',
      fields: {
        summary: 'Implement new dashboard feature',
        status: {
          name: 'In Progress'
        },
        assignee: {
          displayName: 'John Developer'
        },
        created: '2024-01-10T09:00:00.000Z',
        updated: '2024-01-15T14:30:00.000Z'
      }
    },
    {
      id: '10002',
      key: 'DASH-124',
      fields: {
        summary: 'Fix API endpoint bug',
        status: {
          name: 'Done'
        },
        assignee: {
          displayName: 'Jane Tester'
        },
        created: '2024-01-08T10:00:00.000Z',
        updated: '2024-01-14T16:45:00.000Z'
      }
    },
    {
      id: '10003',
      key: 'DASH-125',
      fields: {
        summary: 'Manual QA testing for release',
        status: {
          name: 'To Do'
        },
        assignee: {
          displayName: 'QA Team Lead'
        },
        created: '2024-01-15T08:00:00.000Z',
        updated: '2024-01-15T08:00:00.000Z'
      }
    }
  ];

  // GET /rest/api/3/search/jql
  // Search for issues using JQL
  router.get('/rest/api/3/search/jql', (req, res) => {
    const { jql, startAt = '0', maxResults = '50' } = req.query;

    console.log(`[JIRA] Searching issues with JQL: ${jql}`);

    let filteredIssues = [...mockIssues];

    // Simple JQL parsing for common cases
    if (jql) {
      const jqlStr = jql as string;
      
      // Filter by assignee
      if (jqlStr.includes('assignee = currentUser()')) {
        filteredIssues = filteredIssues.filter(issue => 
          issue.fields.assignee?.displayName === 'Mock Current User'
        );
      }
      
      // Filter by status
      if (jqlStr.includes('status = "In Progress"')) {
        filteredIssues = filteredIssues.filter(issue => 
          issue.fields.status.name === 'In Progress'
        );
      }
      
      // Filter by project
      if (jqlStr.includes('project = DASH')) {
        filteredIssues = filteredIssues.filter(issue => 
          issue.key.startsWith('DASH-')
        );
      }

      // Filter for manual QA tasks
      if (jqlStr.toLowerCase().includes('manual') && jqlStr.toLowerCase().includes('qa')) {
        filteredIssues = filteredIssues.filter(issue => 
          issue.fields.summary.toLowerCase().includes('manual') || 
          issue.fields.summary.toLowerCase().includes('qa')
        );
      }
    }

    // Pagination
    const startAtNum = parseInt(startAt as string, 10);
    const maxResultsNum = parseInt(maxResults as string, 10);
    const paginatedIssues = filteredIssues.slice(startAtNum, startAtNum + maxResultsNum);

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        expand: 'schema,names',
        startAt: startAtNum,
        maxResults: maxResultsNum,
        total: filteredIssues.length,
        issues: paginatedIssues.map(issue => ({
          ...issue,
          expand: '',
          self: `https://mock-jira.atlassian.net/rest/api/2/issue/${issue.id}`,
          fields: {
            ...issue.fields,
            issuetype: {
              id: '10001',
              name: 'Task',
              iconUrl: 'https://mock-jira.atlassian.net/images/icons/issuetypes/task.png'
            },
            project: {
              id: '10000',
              key: 'DASH',
              name: 'Dashboard Project'
            },
            priority: {
              id: '3',
              name: 'Medium'
            },
            reporter: {
              displayName: 'Product Manager'
            },
            description: `Mock description for ${issue.fields.summary}`,
            labels: ['frontend', 'backend'],
            components: [
              {
                id: '10000',
                name: 'Web Interface'
              }
            ]
          }
        }))
      });
    }, delay);
  });

  // GET /rest/api/2/issue/{issueIdOrKey}
  // Get a specific issue
  router.get('/rest/api/2/issue/:issueIdOrKey', (req, res) => {
    const { issueIdOrKey } = req.params;
    const { expand } = req.query;

    console.log(`[JIRA] Fetching issue ${issueIdOrKey}`);

    const issue = mockIssues.find(i => i.id === issueIdOrKey || i.key === issueIdOrKey);
    
    if (!issue) {
      res.status(404).json({
        errorMessages: ['Issue does not exist or you do not have permission to see it.'],
        errors: {}
      });
      return;
    }

    const delay = parseInt(process.env.DEFAULT_DELAY_MS || '100', 10);
    setTimeout(() => {
      res.json({
        ...issue,
        expand: expand || '',
        self: `https://mock-jira.atlassian.net/rest/api/2/issue/${issue.id}`,
        fields: {
          ...issue.fields,
          issuetype: {
            id: '10001',
            name: 'Task',
            iconUrl: 'https://mock-jira.atlassian.net/images/icons/issuetypes/task.png'
          },
          project: {
            id: '10000',
            key: 'DASH',
            name: 'Dashboard Project'
          },
          priority: {
            id: '3',
            name: 'Medium'
          },
          reporter: {
            displayName: 'Product Manager'
          },
          description: `Mock description for ${issue.fields.summary}`,
          labels: ['frontend', 'backend'],
          components: [
            {
              id: '10000',
              name: 'Web Interface'
            }
          ],
          timetracking: {
            originalEstimate: '2h',
            remainingEstimate: '1h',
            timeSpent: '1h'
          }
        }
      });
    }, delay);
  });

  router.get('/browse/:issueKey', (req, res) => {
    const { issueKey } = req.params;
    res.status(200).send(`<html><body><h1>Jira Issue: ${issueKey}</h1></body></html>`);
  });

  // Catch-all for unhandled Jira API endpoints
  router.all('*', (req, res) => {
    console.log(`[JIRA] Unhandled endpoint: ${req.method} ${req.path}`);
    res.status(404).json({
      errorMessages: ['The requested resource does not exist.'],
      errors: {}
    });
  });

  return router;
}
