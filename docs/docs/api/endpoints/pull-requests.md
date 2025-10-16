# Pull Requests API

The Pull Requests API provides endpoints for tracking and managing GitHub pull requests.

## Endpoints

### List All Pull Requests

Retrieve all tracked pull requests.

**Endpoint:** `GET /api/pull_requests`

**Authentication:** Required (API Key)

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/pull_requests" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "url": "https://github.com/myorg/myrepo/pull/123",
      "title": "Add new feature",
      "status": "open",
      "createdAt": "2025-10-15T10:00:00.000Z",
      "updatedAt": "2025-10-15T14:30:00.000Z"
    }
  ]
}
```

---

### Get Pull Request Details

Retrieve detailed information about a specific pull request, including GitHub API data.

**Endpoint:** `GET /api/pull_requests/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| `id`      | number | Yes      | Pull request ID |

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/pull_requests/1" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://github.com/myorg/myrepo/pull/123",
    "title": "Add new feature",
    "status": "open",
    "createdAt": "2025-10-15T10:00:00.000Z",
    "updatedAt": "2025-10-15T14:30:00.000Z",
    "githubDetails": {
      "number": 123,
      "state": "open",
      "title": "Add new feature",
      "body": "This PR adds a new feature...",
      "user": {
        "login": "developer",
        "avatar_url": "https://avatars.githubusercontent.com/u/123456"
      },
      "created_at": "2025-10-15T10:00:00Z",
      "updated_at": "2025-10-15T14:30:00Z",
      "merged_at": null,
      "draft": false,
      "head": {
        "ref": "feature-branch",
        "sha": "abc123def456"
      },
      "base": {
        "ref": "main",
        "sha": "def456abc123"
      },
      "mergeable": true,
      "mergeable_state": "clean",
      "comments": 5,
      "review_comments": 3,
      "commits": 4,
      "additions": 150,
      "deletions": 50,
      "changed_files": 8
    }
  }
}
```

#### Response Codes

| Code | Description                               |
|------|-------------------------------------------|
| 200  | Pull request retrieved successfully       |
| 400  | Invalid pull request ID                   |
| 401  | Unauthorized - Invalid or missing API key |
| 404  | Pull request not found                    |
| 500  | Internal server error                     |
| 502  | GitHub API error                          |

---

### Add Pull Request

Add a new pull request to track.

**Endpoint:** `POST /api/pull_requests`

**Authentication:** Required (API Key)

#### Request Body

| Field   | Type   | Required | Description                                    |
|---------|--------|----------|------------------------------------------------|
| `url`   | string | Yes      | GitHub pull request URL                        |
| `title` | string | No       | PR title (fetched from GitHub if not provided) |

#### Request Example

```bash
curl -X POST "http://localhost:3000/api/pull_requests" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/myorg/myrepo/pull/123"
  }'
```

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://github.com/myorg/myrepo/pull/123",
    "title": "Add new feature",
    "status": "open",
    "createdAt": "2025-10-15T10:00:00.000Z",
    "updatedAt": "2025-10-15T10:00:00.000Z"
  }
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 201 | Pull request added successfully |
| 400 | Invalid URL or validation error |
| 401 | Unauthorized - Invalid or missing API key |
| 409 | Pull request already tracked |
| 500 | Internal server error |
| 502 | GitHub API error |

---

### Delete Pull Request

Remove a pull request from tracking.

**Endpoint:** `DELETE /api/pull_requests/:id`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Pull request ID |

#### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/pull_requests/1" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Pull request deleted successfully"
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | Pull request deleted successfully |
| 400 | Invalid pull request ID |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | Pull request not found |
| 500 | Internal server error |

---

## SDK Usage

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
});

// List all pull requests
const prs = await api.getPullRequests();
console.log('Pull Requests:', prs);

// Get PR details with GitHub data
const prDetails = await api.getPullRequestDetails(1);
console.log('PR Details:', prDetails);
console.log('GitHub Info:', prDetails.githubDetails);

// Add new pull request
const newPR = await api.addPullRequest({
  url: 'https://github.com/myorg/myrepo/pull/123',
});

// Delete pull request
await api.deletePullRequest(1);
```

---

## Data Models

### PullRequest

```typescript
interface PullRequest {
  id: number;
  url: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
```

### PullRequestInput

```typescript
interface PullRequestInput {
  url: string;
  title?: string;
}
```

### GithubPullRequestDetails

```typescript
interface GithubPullRequestDetails {
  number: number;
  state: string;
  title: string;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  draft: boolean;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  mergeable: boolean;
  mergeable_state: string;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}
```

---

## Common Use Cases

### Track Team Pull Requests

```typescript
// Add multiple PRs to track
const prUrls = [
  'https://github.com/myorg/myrepo/pull/123',
  'https://github.com/myorg/myrepo/pull/124',
  'https://github.com/myorg/myrepo/pull/125',
];

for (const url of prUrls) {
  await api.addPullRequest({ url });
}

// Get all tracked PRs
const prs = await api.getPullRequests();
console.log(`Tracking ${prs.length} pull requests`);
```

### Monitor PR Status

```typescript
// Get detailed PR information
const pr = await api.getPullRequestDetails(1);

if (pr.githubDetails) {
  console.log(`PR #${pr.githubDetails.number}: ${pr.githubDetails.title}`);
  console.log(`State: ${pr.githubDetails.state}`);
  console.log(`Mergeable: ${pr.githubDetails.mergeable}`);
  console.log(`Comments: ${pr.githubDetails.comments}`);
  console.log(`Changes: +${pr.githubDetails.additions} -${pr.githubDetails.deletions}`);
}
```

---

## Error Handling

```typescript
try {
  const pr = await api.addPullRequest({
    url: 'https://github.com/myorg/myrepo/pull/123',
  });
} catch (error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        console.error('Invalid GitHub URL');
        break;
      case 409:
        console.error('PR already tracked');
        break;
      case 502:
        console.error('GitHub API error - check credentials');
        break;
    }
  }
}
```

---

## Next Steps

- [Applications API](./applications.md) - Manage applications
- [E2E Reports API](./e2e-reports.md) - View E2E test reports
- [Notifications API](./notifications.md) - Manage notifications
- [Error Handling](../error-handling.md) - Error codes and responses

