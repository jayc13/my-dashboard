# JIRA Integration API

The JIRA Integration API provides endpoints for fetching JIRA tickets using predefined JQL queries.

## Overview

This API integrates with Atlassian JIRA to retrieve tickets based on specific criteria. The endpoints use predefined JQL (JIRA Query Language) queries to fetch relevant issues.

**Authentication:** The JIRA API uses server-side authentication configured with environment variables (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`). Client requests only need the dashboard API key.

## Endpoints

### Get Manual QA Tasks

Retrieve JIRA issues that require manual QA testing.

**Endpoint:** `GET /api/jira/manual_qa`

**Authentication:** Required (API Key)

#### Predefined JQL Query

```jql
labels in ("manual_qa") AND "Status" NOT IN ("Done", "Ready to Release", "To Do") 
AND project = "Agent Client Tools" ORDER BY created DESC
```

This query returns tickets with the `manual_qa` label that are actively being worked on (not in Done, Ready to Release, or To Do status).

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/jira/manual_qa" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 3,
    "issues": [
      {
        "id": "10001",
        "key": "ACT-123",
        "url": "https://company.atlassian.net/browse/ACT-123",
        "summary": "Test new user registration flow",
        "status": "In Progress",
        "created": "2025-10-10T10:30:00.000Z",
        "updated": "2025-10-15T14:45:00.000Z",
        "assignee": "QA Team",
        "reporter": "Product Manager",
        "labels": ["manual_qa", "user-flow"],
        "priority": "High",
        "parent": {
          "id": "10002",
          "key": "ACT-100",
          "url": "https://company.atlassian.net/browse/ACT-100",
          "summary": "User authentication epic"
        }
      }
    ]
  }
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | Tickets retrieved successfully |
| 401 | Unauthorized - Invalid or missing API key |
| 500 | Internal server error |
| 502 | JIRA API error - Check server configuration |

---

### Get My Tickets

Retrieve JIRA issues assigned to the current user that are unresolved.

**Endpoint:** `GET /api/jira/my_tickets`

**Authentication:** Required (API Key)

#### Predefined JQL Query

```jql
assignee = currentUser() AND resolution = Unresolved order by updated DESC
```

This query returns all unresolved tickets assigned to the authenticated JIRA user (configured on the server).

**Note:** The "current user" is determined by the JIRA API credentials configured on the server (`JIRA_EMAIL` environment variable).

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/jira/my_tickets" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 4,
    "issues": [
      {
        "id": "10001",
        "key": "ACT-789",
        "url": "https://company.atlassian.net/browse/ACT-789",
        "summary": "Implement user authentication API",
        "status": "In Progress",
        "created": "2025-10-10T08:00:00.000Z",
        "updated": "2025-10-15T16:30:00.000Z",
        "assignee": "Current User",
        "reporter": "Product Manager",
        "labels": ["backend", "api", "authentication"],
        "priority": "High"
      },
      {
        "id": "10002",
        "key": "ACT-790",
        "url": "https://company.atlassian.net/browse/ACT-790",
        "summary": "Fix login bug",
        "status": "In Review",
        "created": "2025-10-12T09:00:00.000Z",
        "updated": "2025-10-15T15:00:00.000Z",
        "assignee": "Current User",
        "reporter": "QA Team",
        "labels": ["bug", "login"],
        "priority": "Critical"
      }
    ]
  }
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | Tickets retrieved successfully |
| 401 | Unauthorized - Invalid or missing API key |
| 500 | Internal server error |
| 502 | JIRA API error - Check server configuration |

---

## SDK Usage

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
});

// Get manual QA tasks
const manualQA = await api.getManualQATasks();
console.log(`${manualQA.total} manual QA tasks`);

for (const issue of manualQA.issues) {
  console.log(`${issue.key}: ${issue.summary} (${issue.status})`);
}

// Get my assigned tickets
const myTickets = await api.getMyJiraTickets();
console.log(`${myTickets.total} tickets assigned to me`);

for (const issue of myTickets.issues) {
  console.log(`${issue.key}: ${issue.summary} - ${issue.priority}`);
}
```

---

## Data Models

### JiraIssuesResponse

```typescript
interface JiraIssuesResponse {
  total: number;
  issues: JiraTicket[];
  startAt?: number;
  maxResults?: number;
}
```

### JiraTicket

```typescript
interface JiraTicket {
  id: string;
  key: string;
  url: string;
  summary: string;
  status: string;
  created: string;
  updated: string;
  assignee: string;
  reporter: string;
  labels: string[];
  priority: string;
  parent?: {
    id: string;
    key: string;
    url: string;
    summary: string;
  };
}
```

---

## Common Use Cases

### Display Manual QA Dashboard

```typescript
const manualQA = await api.getManualQATasks();

console.log('=== Manual QA Tasks ===');
console.log(`Total: ${manualQA.total}`);

// Group by status
const byStatus = manualQA.issues.reduce((acc, issue) => {
  if (!acc[issue.status]) acc[issue.status] = [];
  acc[issue.status].push(issue);
  return acc;
}, {} as Record<string, JiraTicket[]>);

for (const [status, issues] of Object.entries(byStatus)) {
  console.log(`\n${status} (${issues.length}):`);
  issues.forEach(issue => {
    console.log(`  - ${issue.key}: ${issue.summary}`);
  });
}
```

### Track Personal Workload

```typescript
const myTickets = await api.getMyJiraTickets();

console.log('=== My Tickets ===');
console.log(`Total: ${myTickets.total}`);

// Group by priority
const highPriority = myTickets.issues.filter(i => 
  i.priority === 'High' || i.priority === 'Critical'
);

console.log(`\nHigh Priority (${highPriority.length}):`);
highPriority.forEach(issue => {
  console.log(`  - ${issue.key}: ${issue.summary} [${issue.status}]`);
});
```

### Monitor QA Workload

```typescript
const manualQA = await api.getManualQATasks();

// Calculate metrics
const inProgress = manualQA.issues.filter(i => i.status === 'In Progress').length;
const inReview = manualQA.issues.filter(i => i.status === 'In Review').length;

console.log('QA Workload Metrics:');
console.log(`  Total tasks: ${manualQA.total}`);
console.log(`  In Progress: ${inProgress}`);
console.log(`  In Review: ${inReview}`);
console.log(`  Completion rate: ${((inReview / manualQA.total) * 100).toFixed(1)}%`);
```

---

## Server Configuration

The JIRA integration requires the following environment variables to be configured on the server:

```bash
# .env file
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
```

### Generating a JIRA API Token

1. Log in to your Atlassian account
2. Go to Account Settings → Security → API tokens
3. Click "Create API token"
4. Copy the token and add it to your server's `.env` file

---

## Error Handling

```typescript
try {
  const manualQA = await api.getManualQATasks();
} catch (error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 502:
        console.error('JIRA API error - check server configuration');
        console.error('Verify JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN');
        break;
      case 500:
        console.error('Server error fetching JIRA tickets');
        break;
    }
  }
}
```

---

## Limitations

- **Predefined Queries Only:** The API uses predefined JQL queries. Custom queries are not supported through the API.
- **Server-Side Authentication:** JIRA credentials are configured on the server. The "current user" in queries refers to the server's JIRA account, not the API client.
- **Read-Only:** This API only supports reading JIRA tickets. Creating, updating, or deleting tickets is not supported.

---

## Next Steps

- [Applications API](./applications.md) - Manage applications
- [To-Do Lists API](./todo-list.md) - Manage tasks
- [Notifications API](./notifications.md) - Manage notifications
- [Error Handling](../error-handling.md) - Error codes and responses

