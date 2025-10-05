import { Router } from 'express';
import { JiraIssue } from '@my-dashboard/types';
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
        reporter: {
          displayName: 'Product Manager'
        },
        priority: {
          id: '2',
          name: 'High'
        },
        labels: ['frontend', 'feature'],
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
        reporter: {
          displayName: 'John Developer'
        },
        priority: {
          id: '1',
          name: 'Critical'
        },
        labels: ['backend', 'bug'],
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
          name: 'In Progress'
        },
        assignee: {
          displayName: 'QA Team Lead'
        },
        reporter: {
          displayName: 'Product Manager'
        },
        priority: {
          id: '2',
          name: 'High'
        },
        labels: ['manual_qa', 'testing'],
        created: '2024-01-15T08:00:00.000Z',
        updated: '2024-01-15T08:00:00.000Z'
      }
    },
    {
      id: '10004',
      key: 'DASH-126',
      fields: {
        summary: 'Refactor authentication module',
        status: {
          name: 'In Progress'
        },
        assignee: {
          displayName: 'John Developer'
        },
        reporter: {
          displayName: 'Tech Lead'
        },
        priority: {
          id: '3',
          name: 'Medium'
        },
        labels: ['backend', 'refactoring'],
        created: '2024-01-12T11:00:00.000Z',
        updated: '2024-01-16T09:15:00.000Z'
      }
    },
    {
      id: '10005',
      key: 'DASH-127',
      fields: {
        summary: 'Add unit tests for user service',
        status: {
          name: 'To Do'
        },
        assignee: {
          displayName: 'John Developer'
        },
        reporter: {
          displayName: 'Tech Lead'
        },
        priority: {
          id: '3',
          name: 'Medium'
        },
        labels: ['testing', 'backend'],
        parent: {
          id: '10004',
          key: 'DASH-126',
          fields: {
            summary: 'Refactor authentication module'
          }
        },
        created: '2024-01-14T13:30:00.000Z',
        updated: '2024-01-14T13:30:00.000Z'
      }
    },
    {
      id: '10006',
      key: 'DASH-128',
      fields: {
        summary: 'Manual QA for payment flow',
        status: {
          name: 'In Progress'
        },
        assignee: {
          displayName: 'John Developer'
        },
        reporter: {
          displayName: 'Product Manager'
        },
        priority: {
          id: '1',
          name: 'Critical'
        },
        labels: ['manual_qa', 'payment', 'critical'],
        parent: {
          id: '10009',
          key: 'DASH-131',
          fields: {
            summary: 'Payment system integration epic'
          }
        },
        created: '2024-01-13T10:00:00.000Z',
        updated: '2024-01-16T15:20:00.000Z'
      }
    },
    {
      id: '10007',
      key: 'DASH-129',
      fields: {
        summary: 'Update documentation for API endpoints',
        status: {
          name: 'In Progress'
        },
        assignee: {
          displayName: 'John Developer'
        },
        reporter: {
          displayName: 'Product Manager'
        },
        priority: {
          id: '4',
          name: 'Low'
        },
        labels: ['documentation'],
        created: '2024-01-11T14:00:00.000Z',
        updated: '2024-01-15T16:45:00.000Z'
      }
    },
    {
      id: '10008',
      key: 'DASH-130',
      fields: {
        summary: 'Manual QA for checkout process',
        status: {
          name: 'In Review'
        },
        assignee: {
          displayName: 'QA Team Lead'
        },
        reporter: {
          displayName: 'Product Manager'
        },
        priority: {
          id: '2',
          name: 'High'
        },
        labels: ['manual_qa', 'checkout'],
        parent: {
          id: '10009',
          key: 'DASH-131',
          fields: {
            summary: 'Payment system integration epic'
          }
        },
        created: '2024-01-16T09:00:00.000Z',
        updated: '2024-01-16T11:30:00.000Z'
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

      console.log(`[JIRA] Searching issues with JQL: ${jqlStr}`);
      
      // Filter by assignee
      if (jqlStr.includes('assignee = currentUser()')) {
        filteredIssues = filteredIssues.filter(issue => 
          issue.fields.assignee?.displayName === 'John Developer'
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

      // Filter for manual QA tasks (by label or summary)
      if (jqlStr.toLowerCase().includes('manual') && jqlStr.toLowerCase().includes('qa')) {
        filteredIssues = filteredIssues.filter(issue =>
          issue.fields.labels?.includes('manual_qa') ||
          issue.fields.summary.toLowerCase().includes('manual') ||
          issue.fields.summary.toLowerCase().includes('qa')
        );
      }

      // Filter by labels
      if (jqlStr.toLowerCase().includes('labels in')) {
        const labelMatch = jqlStr.match(/labels in \("([^"]+)"\)/i);
        if (labelMatch && labelMatch[1]) {
          const label = labelMatch[1];
          filteredIssues = filteredIssues.filter(issue =>
            issue.fields.labels?.includes(label) || false
          );
        }
      }

      // Filter out specific statuses (NOT IN)
      if (jqlStr.includes('NOT IN')) {
        const statusMatch = jqlStr.match(/status NOT IN \(([^)]+)\)/i);
        if (statusMatch && statusMatch[1]) {
          const excludedStatuses = statusMatch[1]
            .split(',')
            .map(s => s.trim().replace(/"/g, ''));
          filteredIssues = filteredIssues.filter(issue =>
            !excludedStatuses.includes(issue.fields.status.name)
          );
        }
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
            description: `Mock description for ${issue.fields.summary}`,
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
  router.get('/rest/api/3/issue/:issueIdOrKey', (req, res) => {
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
          description: `Mock description for ${issue.fields.summary}`,
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
  router.all('/*path', (req, res) => {
    console.log(`[JIRA] Unhandled endpoint: ${req.method} ${req.path}`);
    res.status(404).json({
      errorMessages: ['The requested resource does not exist.'],
      errors: {}
    });
  });

  return router;
}
