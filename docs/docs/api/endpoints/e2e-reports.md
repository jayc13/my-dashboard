# E2E Reports API

The E2E Reports API provides access to Cypress end-to-end test execution reports and project status information.

## Overview

These endpoints allow you to:
- Retrieve test execution summaries for all monitored projects
- Get detailed reports for specific projects
- Check the status of the most recent test runs
- Monitor test success rates and trends

## Authentication

All E2E Reports endpoints require API key authentication via the `x-api-key` header.

## Endpoints

### Get All E2E Reports

Retrieve Cypress test execution reports for all monitored projects.

```http
GET /api/e2e_reports
```

**Query Parameters:**
- `date` (optional): Report date in YYYY-MM-DD format (defaults to current date)

**Example Request:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
     "http://localhost:3000/api/e2e_reports?date=2025-09-20"
```

**Example Response:**
```json
[
  {
    "projectName": "my-web-app",
    "projectCode": "abc123",
    "lastUpdated": "2025-09-20T10:30:00.000Z",
    "lastRunStatus": "passed",
    "totalRuns": 50,
    "passedRuns": 45,
    "failedRuns": 5,
    "successRate": 90.0
  },
  {
    "projectName": "mobile-app",
    "projectCode": "def456",
    "lastUpdated": "2025-09-20T09:15:00.000Z",
    "lastRunStatus": "failed",
    "totalRuns": 30,
    "passedRuns": 25,
    "failedRuns": 5,
    "successRate": 83.3
  }
]
```

### Get E2E Report by Project

Retrieve detailed E2E test execution report for a specific project.

```http
GET /api/e2e_reports/report/{projectName}
```

**Path Parameters:**
- `projectName`: Name of the project (e.g., "my-web-app")

**Query Parameters:**
- `date` (optional): Report date in YYYY-MM-DD format (defaults to current date)

**Example Request:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
     "http://localhost:3000/api/e2e_reports/report/my-web-app"
```

**Example Response:**
```json
{
  "projectName": "my-web-app",
  "projectCode": "abc123",
  "lastUpdated": "2025-09-20T10:30:00.000Z",
  "lastRunStatus": "passed",
  "totalRuns": 50,
  "passedRuns": 45,
  "failedRuns": 5,
  "successRate": 90.0
}
```

### Get Project Status

Retrieve the status of the most recent test run for a specific project.

```http
GET /api/e2e_reports/project_status/{projectName}
```

**Path Parameters:**
- `projectName`: Name of the project

**Example Request:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
     "http://localhost:3000/api/e2e_reports/project_status/my-web-app"
```

**Example Response:**
```json
{
  "projectName": "my-web-app",
  "runNumber": 123,
  "lastRunStatus": "passed",
  "createdAt": "2025-09-20T10:30:00.000Z"
}
```

## Data Models

### ProjectSummary

| Field | Type | Description |
|-------|------|-------------|
| `projectName` | string | Name of the Cypress project |
| `projectCode` | string\|null | Cypress project code identifier |
| `lastUpdated` | string\|null | ISO 8601 timestamp of last update |
| `lastRunStatus` | string | Status of most recent run |
| `totalRuns` | integer | Total number of runs in period |
| `passedRuns` | integer | Number of successful runs |
| `failedRuns` | integer | Number of failed runs |
| `successRate` | number | Success rate percentage (0-100) |

### Run Status Values

| Status | Description |
|--------|-------------|
| `passed` | All tests passed successfully |
| `failed` | One or more tests failed |
| `running` | Test run is currently in progress |
| `canceled` | Test run was canceled |
| `errored` | Test run encountered an error |
| `timedout` | Test run exceeded time limit |

## Error Handling

### Common Error Responses

**404 Not Found - Project not found:**
```json
{
  "error": "Project not found"
}
```

**401 Unauthorized - Invalid API key:**
```json
{
  "error": "Unauthorized: Invalid or missing API key"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Usage Examples

### JavaScript/Node.js

```javascript
const API_BASE_URL = 'http://localhost:3000';
const API_KEY = 'your-api-key-here';

class E2EReportsAPI {
  async getAllReports(date = null) {
    const url = new URL('/api/e2e_reports', API_BASE_URL);
    if (date) url.searchParams.set('date', date);
    
    const response = await fetch(url, {
      headers: { 'x-api-key': API_KEY }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getProjectReport(projectName, date = null) {
    const url = new URL(`/api/e2e_reports/report/${projectName}`, API_BASE_URL);
    if (date) url.searchParams.set('date', date);
    
    const response = await fetch(url, {
      headers: { 'x-api-key': API_KEY }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project report: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getProjectStatus(projectName) {
    const response = await fetch(
      `${API_BASE_URL}/api/e2e_reports/project_status/${projectName}`,
      { headers: { 'x-api-key': API_KEY } }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project status: ${response.status}`);
    }
    
    return response.json();
  }
}

// Usage
const api = new E2EReportsAPI();

// Get all reports for today
const reports = await api.getAllReports();

// Get specific project report for a date
const projectReport = await api.getProjectReport('my-web-app', '2025-09-20');

// Get current project status
const status = await api.getProjectStatus('my-web-app');
```

### Python

```python
import requests
from datetime import datetime
from typing import Optional, List, Dict

class E2EReportsAPI:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
    
    def get_all_reports(self, date: Optional[str] = None) -> List[Dict]:
        """Get all E2E reports for a specific date."""
        params = {'date': date} if date else {}
        
        response = requests.get(
            f"{self.base_url}/api/e2e_reports",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_project_report(self, project_name: str, date: Optional[str] = None) -> Dict:
        """Get E2E report for a specific project."""
        params = {'date': date} if date else {}
        
        response = requests.get(
            f"{self.base_url}/api/e2e_reports/report/{project_name}",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_project_status(self, project_name: str) -> Dict:
        """Get current status of a project."""
        response = requests.get(
            f"{self.base_url}/api/e2e_reports/project_status/{project_name}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage
api = E2EReportsAPI('http://localhost:3000', 'your-api-key-here')

# Get all reports
reports = api.get_all_reports()

# Get specific project report
project_report = api.get_project_report('my-web-app', '2025-09-20')

# Get project status
status = api.get_project_status('my-web-app')
```

## Integration Patterns

### Monitoring Dashboard

```javascript
// Create a monitoring dashboard that refreshes project status
async function createMonitoringDashboard() {
  const api = new E2EReportsAPI();
  
  // Get all projects
  const reports = await api.getAllReports();
  
  // Check status of each project
  const statusChecks = reports.map(async (report) => {
    const status = await api.getProjectStatus(report.projectName);
    return {
      ...report,
      currentStatus: status
    };
  });
  
  const projectStatuses = await Promise.all(statusChecks);
  
  // Display results
  projectStatuses.forEach(project => {
    console.log(`${project.projectName}: ${project.currentStatus.lastRunStatus} (${project.successRate}% success rate)`);
  });
}
```

### Automated Alerting

```javascript
// Check for failed projects and send alerts
async function checkForFailures() {
  const api = new E2EReportsAPI();
  const reports = await api.getAllReports();
  
  const failedProjects = reports.filter(report => 
    report.lastRunStatus === 'failed' || report.successRate < 80
  );
  
  if (failedProjects.length > 0) {
    // Send alert notification
    console.log(`Alert: ${failedProjects.length} projects need attention`);
    failedProjects.forEach(project => {
      console.log(`- ${project.projectName}: ${project.lastRunStatus} (${project.successRate}% success)`);
    });
  }
}
```

## Best Practices

1. **Date Handling**: Always use ISO 8601 date format (YYYY-MM-DD)
2. **Error Handling**: Implement proper error handling for network and API errors
3. **Caching**: Consider caching report data as it doesn't change frequently
4. **Monitoring**: Set up automated monitoring for critical projects
5. **Rate Limiting**: Respect API rate limits in automated scripts
