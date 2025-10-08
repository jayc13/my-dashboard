import { Router } from 'express';
import { DateTime } from 'luxon';
import { JiraIssue } from '@my-dashboard/types';
import { createRegistryMiddleware } from '../middleware/registry-middleware';

/**
 * Generate a random past date within the specified number of days ago
 */
function randomPastDate(minDaysAgo: number, maxDaysAgo: number): string {
  const daysAgo = Math.floor(Math.random() * (maxDaysAgo - minDaysAgo + 1)) + minDaysAgo;
  return DateTime.now().minus({ days: daysAgo }).toISO() || '';
}

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
        created: randomPastDate(10, 15),
        updated: randomPastDate(1, 5)
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
        created: randomPastDate(15, 20),
        updated: randomPastDate(1, 3)
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
        labels: ['testing'],
        created: randomPastDate(5, 8),
        updated: randomPastDate(1, 2)
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
        created: randomPastDate(8, 12),
        updated: randomPastDate(1, 3)
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
        created: randomPastDate(6, 10),
        updated: randomPastDate(2, 5)
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
        created: randomPastDate(7, 10),
        updated: randomPastDate(1, 2)
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
        created: randomPastDate(12, 15),
        updated: randomPastDate(2, 4)
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
        created: randomPastDate(3, 5),
        updated: randomPastDate(1, 2)
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
        console.log('[JIRA] Applying assignee filter for currentUser()');
        filteredIssues = filteredIssues.filter(issue => 
          issue.fields.assignee?.displayName === 'John Developer'
        );
      }
      
      // Filter by status
      if (jqlStr.includes('status = "In Progress"')) {
        console.log(`[JIRA] Searching issues with JQL: ${jqlStr}`);
        filteredIssues = filteredIssues.filter(issue => 
          issue.fields.status.name === 'In Progress'
        );
      }
      
      // Filter by project
      if (jqlStr.includes('project = DASH')) {
        console.log('[JIRA] Applying project DASH filter');
        filteredIssues = filteredIssues.filter(issue => 
          issue.key.startsWith('DASH-')
        );
      }

      // Filter for manual QA tasks (by label or summary)
      if (jqlStr.toLowerCase().includes('manual_qa')) {
        console.log('[JIRA] Applying manual QA filter');
        filteredIssues = filteredIssues.filter(issue =>
          issue.fields.labels?.includes('manual_qa') ||
          issue.fields.summary.toLowerCase().includes('manual') ||
          issue.fields.summary.toLowerCase().includes('qa')
        );

        if (Math.random() >= 0.7) {
          filteredIssues = [];
        } else {
          filteredIssues = filteredIssues.slice(0, 3);
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
