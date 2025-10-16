# E2E Reports API

The E2E Reports API provides endpoints for managing and retrieving Cypress end-to-end test execution reports.

## Endpoints

### Get E2E Test Report

Retrieve Cypress end-to-end test execution reports for all monitored projects.

**Endpoint:** `GET /api/e2e_run_report`

**Authentication:** Required (API Key)

#### Query Parameters

| Parameter     | Type   | Required | Description                                                      |
|---------------|--------|----------|------------------------------------------------------------------|
| `date`        | string | No       | Report date in YYYY-MM-DD format (defaults to current date)      |
| `force`       | string | No       | Force regeneration of report (`'true'`, `'false'`, `'1'`, `'0'`) |
| `enrichments` | string | No       | JSON string containing enrichment options                        |

#### Enrichment Options

The `enrichments` parameter accepts a JSON string with the following options:

```typescript
{
  includeDetails: boolean;      // Include detailed report data (default: true)
  includeAppInfo: boolean;       // Include application information (default: true)
  includeManualRuns: boolean;    // Include manual run data (default: true)
}
```

#### Request Example

```bash
# Get today's report
curl -X GET "http://localhost:3000/api/e2e_run_report" \
  -H "x-api-key: your-api-key"

# Get report for specific date
curl -X GET "http://localhost:3000/api/e2e_run_report?date=2025-10-15" \
  -H "x-api-key: your-api-key"

# Force regeneration with custom enrichments
curl -X GET "http://localhost:3000/api/e2e_run_report?date=2025-10-15&force=true&enrichments=%7B%22includeDetails%22%3Atrue%2C%22includeAppInfo%22%3Atrue%2C%22includeManualRuns%22%3Afalse%7D" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "summary": {
    "id": 1,
    "date": "2025-10-15",
    "status": "ready",
    "totalRuns": 150,
    "passedRuns": 142,
    "failedRuns": 8,
    "successRate": 0.9467
  },
  "details": [
    {
      "id": 1,
      "reportSummaryId": 1,
      "appId": 1,
      "totalRuns": 50,
      "passedRuns": 48,
      "failedRuns": 2,
      "successRate": 0.96,
      "lastRunStatus": "passed",
      "lastRunAt": "2025-10-15T14:30:00.000Z",
      "lastFailedRunAt": "2025-10-15T10:15:00.000Z",
      "app": {
        "id": 1,
        "name": "My Web App",
        "code": "my-web-app",
        "pipelineUrl": "https://app.circleci.com/pipelines/github/myorg/my-web-app",
        "watching": true,
        "e2eRunsQuantity": 3,
        "lastRun": {
          "id": 5,
          "status": "success",
          "url": "https://app.circleci.com/pipelines/...",
          "pipelineId": "abc123",
          "createdAt": "2025-10-15T14:00:00.000Z"
        },
        "manualRuns": [
          {
            "id": 5,
            "appId": 1,
            "pipelineId": "abc123",
            "createdAt": "2025-10-15T14:00:00.000Z"
          }
        ]
      }
    }
  ]
}
```

#### Response (202 Accepted)

When the report is being generated:

```json
{
  "success": true,
  "summary": {
    "date": "2025-10-15",
    "status": "pending",
    "totalRuns": 0,
    "passedRuns": 0,
    "failedRuns": 0,
    "successRate": 0
  },
  "details": [],
  "message": "Report is being generated. Please check back later."
}
```

#### Response Codes

| Code | Description                               |
|------|-------------------------------------------|
| 200  | Report retrieved successfully             |
| 202  | Report generation in progress             |
| 400  | Invalid request parameters                |
| 401  | Unauthorized - Invalid or missing API key |
| 500  | Internal server error                     |

---

### Get Last Project Status

Get detailed report for a specific application within a summary.

**Endpoint:** `GET /api/e2e_run_report/:summaryId/:appId`

**Authentication:** Required (API Key)

#### Path Parameters

| Parameter   | Type   | Required | Description       |
|-------------|--------|----------|-------------------|
| `summaryId` | number | Yes      | Report summary ID |
| `appId`     | number | Yes      | Application ID    |

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/e2e_run_report/1/1" \
  -H "x-api-key: your-api-key"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "reportSummaryId": 1,
    "appId": 1,
    "totalRuns": 50,
    "passedRuns": 48,
    "failedRuns": 2,
    "successRate": 0.96,
    "lastRunStatus": "passed",
    "lastRunAt": "2025-10-15T14:30:00.000Z",
    "lastFailedRunAt": "2025-10-15T10:15:00.000Z"
  }
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | Project status retrieved successfully |
| 400 | Invalid summaryId or appId |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | Report or application not found |
| 500 | Internal server error |

---

## SDK Usage

### Get E2E Report

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!,
});

// Get today's report
const report = await api.getE2EReport();

// Get report for specific date
const dateReport = await api.getE2EReport({
  date: '2025-10-15',
});

// Force regeneration with custom enrichments
const customReport = await api.getE2EReport({
  date: '2025-10-15',
  force: true,
  enrichments: {
    includeDetails: true,
    includeAppInfo: true,
    includeManualRuns: false,
  },
});

console.log('Summary:', report.summary);
console.log('Details:', report.details);
```

### Get App Last Status

```typescript
// Get latest status for specific app
const status = await api.getAppLastStatus(1, 1);

console.log('Last run status:', status.lastRunStatus);
console.log('Success rate:', status.successRate);
```

---

## Data Models

### E2EReportSummary

```typescript
interface E2EReportSummary {
  id: number;
  date: string;                    // YYYY-MM-DD format
  status: 'ready' | 'pending' | 'failed';
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  successRate: number;             // 0.0 to 1.0
}
```

### E2EReportDetail

```typescript
interface E2EReportDetail {
  id: number;
  reportSummaryId: number;
  appId: number;
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  successRate: number;             // 0.0 to 1.0
  lastRunStatus: 'passed' | 'failed';
  lastRunAt: string;               // ISO 8601 timestamp
  lastFailedRunAt: string | null;  // ISO 8601 timestamp
}
```

### DetailedE2EReport

```typescript
interface DetailedE2EReport {
  summary: E2EReportSummary;
  details?: DetailedE2EReportDetail[];
  message?: string;
}

interface DetailedE2EReportDetail extends E2EReportDetail {
  app?: AppDetailedE2EReportDetail;
}
```

---

## Common Use Cases

### Monitor Daily Test Results

```typescript
// Get today's test results
const report = await api.getE2EReport();

if (report.summary.status === 'pending') {
  console.log('Report is being generated...');
} else {
  const successRate = report.summary.successRate * 100;
  console.log(`Success rate: ${successRate.toFixed(2)}%`);
  
  if (report.summary.failedRuns > 0) {
    console.log(`⚠️ ${report.summary.failedRuns} failed runs`);
  }
}
```

### Check Specific Application Status

```typescript
// Get report and find specific app
const report = await api.getE2EReport({
  enrichments: {
    includeDetails: true,
    includeAppInfo: true,
  },
});

const appDetail = report.details?.find(d => d.appId === 1);

if (appDetail) {
  console.log(`${appDetail.app?.name}: ${appDetail.lastRunStatus}`);
  console.log(`Success rate: ${(appDetail.successRate * 100).toFixed(2)}%`);
}
```

### Force Report Regeneration

```typescript
// Force regeneration if data seems stale
const freshReport = await api.getE2EReport({
  date: '2025-10-15',
  force: true,
});

// Wait for generation if needed
if (freshReport.summary.status === 'pending') {
  console.log('Waiting for report generation...');
  
  // Poll until ready
  let attempts = 0;
  while (attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const updatedReport = await api.getE2EReport({
      date: '2025-10-15',
    });
    
    if (updatedReport.summary.status === 'ready') {
      console.log('Report ready!');
      break;
    }
    
    attempts++;
  }
}
```

---

## Error Handling

```typescript
try {
  const report = await api.getE2EReport({ date: '2025-10-15' });
} catch (error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        console.error('Invalid date format');
        break;
      case 401:
        console.error('Invalid API key');
        break;
      case 500:
        console.error('Server error - try again later');
        break;
    }
  }
}
```

---

## Next Steps

- [Applications API](./applications.md) - Manage applications
- [Pull Requests API](./pull-requests.md) - Track pull requests
- [Notifications API](./notifications.md) - Manage notifications
- [Error Handling](../error-handling.md) - Error codes and responses

