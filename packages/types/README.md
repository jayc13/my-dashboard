# @my-dashboard/types

Shared entity interfaces and types for My Dashboard server and client applications.

## Overview

This package contains all the TypeScript interface definitions and type declarations used across the My Dashboard ecosystem. It provides a centralized location for entity definitions, ensuring consistency between the server and client applications.

## Installation

```bash
npm install @my-dashboard/types
```

## Usage

### Import all entities
```typescript
import { Application, Notification, JiraTicket } from '@my-dashboard/types';
```

### Import from specific modules
```typescript
import { Application, ApplicationDetails } from '@my-dashboard/types/applications';
import { Notification, NotificationInput } from '@my-dashboard/types/notifications';
import { ProjectSummary, CypressRun } from '@my-dashboard/types/e2e';
import { AuthValidationRequest, SuccessResponse } from '@my-dashboard/types/api';
```

## Available Entities

### Applications
- `Application` - Basic application/project configuration
- `ApplicationDetails` - Extended application information with runtime details
- `LastApplicationRun` - Information about the most recent application run

### E2E Testing
- `ProjectSummary` - Summary statistics for E2E test projects
- `CypressRun` - Individual Cypress test run details
- `ProjectStatus` - Current status of a project's test runs

### Notifications
- `Notification` - System notification entity
- `NotificationInput` - Input data for creating notifications
- `NotificationType` - Type union for notification categories

### Pull Requests
- `PullRequest` - Basic pull request information
- `GithubPullRequestDetails` - Detailed GitHub pull request data

### JIRA Integration
- `JiraTicket` - JIRA ticket/issue information

### To-Do Lists
- `Todo` - To-do item with task details
- `TodoInput` - Input data for creating/updating todos

### Firebase Cloud Messaging
- `FCMMessage` - FCM notification message structure
- `DeviceToken` - FCM device token information

### File System
- `FileSystemItem` - File or directory information
- `DirectoryListing` - Directory contents listing
- `DeletionResult` - Result of file/directory deletion operations

### API Request/Response
- `AuthValidationRequest` - API key validation request
- `AuthValidationResponse` - API key validation response
- `SuccessResponse<T>` - Standard success response wrapper
- `ErrorResponse` - Standard error response
- `ValidationError` - Validation error with detailed field errors
- `RateLimitResponse` - Rate limit exceeded response
- `E2EManualRun` - E2E manual test run record
- `E2EManualRunInput` - Input for creating E2E manual runs
- `E2EManualRunUpdateResponse` - Response for E2E manual run updates
- `HealthCheckResponse` - Health check endpoint response
- `PaginatedResponse<T>` - Paginated response wrapper
- `ApiOperationResult` - Generic API operation result
- `BulkOperationResponse` - Bulk operation response

## Development

### Building the package
```bash
npm run build
```

### Watch mode for development
```bash
npm run dev
```

### Clean build artifacts
```bash
npm run clean
```

## License

MIT
