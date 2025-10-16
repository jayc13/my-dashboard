# AI Agent Instructions

This document provides machine-readable instructions for AI coding agents working on this project.

## Project Overview

- **Type**: Full-stack TypeScript monorepo
- **Purpose**: Cypress test results dashboard with JIRA integration
- **Stack**: React + Vite (client), Express (server), MySQL (database), Redis (pub/sub)
- **Package Manager**: pnpm with workspaces
- **Scheduled Jobs**: node-cron for background tasks

## Project Structure

```
my-dashboard/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (TypeScript)
├── cron/            # Scheduled jobs
├── mock-server/     # API mocking
├── packages/        # Shared packages
│   ├── sdk/         # TypeScript SDK
│   └── types/       # Shared types
├── tests/           # E2E and integration tests
├── scripts/         # Build and deployment scripts
└── docs/            # Docusaurus documentation
```

## Critical Rules for AI Agents

### Package Management

**ALWAYS use pnpm (never npm or yarn)**

```bash
# ✅ CORRECT
pnpm add <package> --registry=https://registry.npmjs.org/

# ❌ WRONG
npm install <package>
yarn add <package>
```

**ALWAYS add the registry flag:**
```bash
--registry=https://registry.npmjs.org/
```

**NEVER manually edit package.json for dependencies**
- Use `pnpm add` to install packages
- Use `pnpm remove` to uninstall packages
- Let pnpm manage version resolution

### Code Standards

- **Language**: TypeScript for all new code
- **Linting**: ESLint with project config
- **Formatting**: Prettier (auto-formatted)
- **Commits**: Conventional Commits (enforced by commitlint)

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Valid types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `style` - Code style changes
- `perf` - Performance improvements
- `ci` - CI configuration changes
- `build` - Build system changes
- `revert` - Revert previous commits

**Examples:**
```bash
feat(client): add user authentication modal
fix(server): resolve database connection timeout
docs(api): update authentication endpoint documentation
```

### Testing Requirements

- Write tests for all new features
- Run tests before committing: `pnpm test`
- E2E tests location: `tests/e2e-tests/`
- Unit tests: Co-located with source files

### File Modification Guidelines

1. **Read before editing**: Always view files before modification
2. **Use str-replace-editor**: Never recreate entire files
3. **Respect existing patterns**: Follow established code patterns
4. **Update tests**: Modify tests when changing functionality

## Authentication & Validation

### Authentication
- **API Key Only** (NOT JWT)
  - Single API key stored in `API_SECURITY_KEY` environment variable
  - Passed via `x-api-key` header
  - Validated using constant-time comparison (timing attack prevention)
  - Brute force protection with rate limiting and IP blocking

### Validation
- **Custom Validation Utilities** (NOT Zod)
  - Location: `server/src/utils/validation.ts`
  - Manual validation with custom error classes
  - Key functions:
    - `validateId()` - Validate positive integer IDs
    - `validateRequiredFields()` - Check required fields
    - `validateAndSanitizeString()` - String validation & sanitization
    - `validateEmail()`, `validateURL()`, `validateDate()`
    - `validateEnum()`, `validateArray()`, `validateBoolean()`

## Redis Architecture

### Purpose
- **Pub/Sub Messaging**: Async communication between cron jobs and server
- **Future**: Caching, session storage, rate limiting

### Configuration
- **Library**: ioredis
- **Connection**: Singleton pattern with separate client and subscriber
- **Files**:
  - `server/src/config/redis.ts` - Server Redis config
  - `cron/src/utils/redis.ts` - Cron Redis config
- **Environment Variable**: `REDIS_URL` (default: `redis://localhost:6379`)

### Key Functions
```typescript
// Get Redis client for general operations
import { getRedisClient } from '@/config/redis';
const client = getRedisClient();

// Get Redis subscriber for pub/sub
import { getRedisSubscriber } from '@/config/redis';
const subscriber = getRedisSubscriber();

// Publish a message
await client.publish('channel-name', JSON.stringify(data));

// Subscribe to a channel
subscriber.subscribe('channel-name');
subscriber.on('message', (channel, message) => {
  const data = JSON.parse(message);
  // Process message
});
```

### Active Channels
| Channel | Publisher | Subscriber | Purpose |
|---------|-----------|------------|---------|
| `e2e:report:generate` | Cron | Server | Trigger E2E report generation |
| `notification:create` | Cron | Server | Create notifications from background jobs |

## Cron Jobs

### Configuration
- **Library**: node-cron
- **Config File**: `cron/config/default.js`
- **Entry Point**: `cron/src/index.ts`

### Scheduled Jobs

#### 1. E2E Report Generation
- **File**: `cron/src/jobs/report-e2e.job.ts`
- **Schedule**: `0 9 * * *` (Daily at 9 AM)
- **Environment Variable**: `E2E_REPORT_CRON_SCHEDULE`
- **Function**: Publishes E2E report request to Redis
- **Flow**: Cron → Redis (`e2e:report:generate`) → Server → Database

#### 2. Pull Requests Management
- **File**: `cron/src/jobs/pull-requests-management.job.ts`
- **Schedule**: `0 9 * * 1-5` (Weekdays at 9 AM)
- **Environment Variable**: `PR_MANAGEMENT_SCHEDULE`
- **Functions**:
  - Check for approved PRs ready to merge
  - Send reminders for old PRs
  - Delete merged PRs from database
- **Flow**: Cron → API (via SDK) → Notifications (via Redis)

#### 3. Manual Testing Reminders
- **File**: `cron/src/jobs/manualTicketsReminder.job.ts`
- **Schedule**: `0 9 * * 1-5` (Weekdays at 9 AM)
- **Environment Variable**: `MANUAL_TICKETS_REMINDER_SCHEDULE`
- **Function**: Checks JIRA for manual QA tickets and sends reminders
- **Flow**: Cron → JIRA API → Redis (notification) → Server

#### 4. Delete Completed Todos
- **File**: `cron/src/jobs/delete-completed-todos.job.ts`
- **Schedule**: `0 2 * * 0` (Sundays at 2 AM)
- **Environment Variable**: `DELETE_COMPLETED_TODOS_SCHEDULE`
- **Function**: Removes completed to-do items from database
- **Flow**: Cron → API (via SDK) → Database

### Creating a New Cron Job

1. Create job file in `cron/src/jobs/`
2. Export async function
3. Add schedule to `cron/config/default.js`
4. Import and schedule in `cron/src/index.ts`

**Example:**
```typescript
// cron/src/jobs/my-job.job.ts
import { getSDK } from '@/utils/sdk';

const myJob = async (): Promise<void> => {
  console.log('Running my job...');
  const sdk = await getSDK();
  // Do work
};

export default myJob;

// cron/config/default.js
module.exports = {
  jobs: {
    my_job: {
      schedule: process.env.MY_JOB_SCHEDULE || '0 * * * *', // Hourly
    },
  },
};

// cron/src/index.ts
import myJob from '@/jobs/my-job.job';

const schedules = getSchedules();
cron.schedule(schedules.myJob, async () => {
  console.log(`Running My Job at ${new Date().toISOString()}`);
  await myJob();
});
```

## Common Tasks

### Adding a New API Endpoint

1. Create route in `server/src/routes/`
2. Create controller in `server/src/controllers/`
3. Create service in `server/src/services/`
4. Add OpenAPI spec in `server/docs/api-documentation/paths/`
5. Update schema if needed in `server/docs/api-documentation/schemas/`
6. Write tests in `server/tests/`
7. Update documentation in `docs/docs/api/endpoints/`

**Example:**

```typescript
// 1. Route (server/src/routes/example.ts)
import { Router } from 'express';
import { ExampleController } from '../controllers/example.controller';

export function createExampleRouter() {
  const router = Router();
  const controller = new ExampleController();
  
  router.get('/', controller.getAll);
  router.post('/', controller.create);
  
  return router;
}

// 2. Controller (server/src/controllers/example.controller.ts)
import { Request, Response, NextFunction } from 'express';
import { ExampleService } from '../services/example.service';
import { validateRequiredFields } from '../utils/validation';

export class ExampleController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequiredFields(req.body, ['name']);
      const result = await ExampleService.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

// 3. Service (server/src/services/example.service.ts)
import { db } from '../db/database';

export class ExampleService {
  static async create(data: any) {
    const result = await db.run(
      'INSERT INTO examples (name) VALUES (?)',
      [data.name]
    );
    return { id: result.insertId, ...data };
  }
}
```

### Adding a New React Component

1. Create component in `client/src/components/` or `client/src/sections/`
2. Use TypeScript with proper types
3. Follow existing component patterns
4. Add tests in `client/test/`

**Example:**

```typescript
// client/src/components/ExampleWidget.tsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface ExampleWidgetProps {
  title: string;
  value: number;
}

export const ExampleWidget: React.FC<ExampleWidgetProps> = ({ title, value }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
};
```

### Database Changes

1. Create migration in `server/migrations/mysql/`
2. Update database schema documentation
3. Update TypeScript types in `packages/types/`
4. Test migration locally before committing

**Migration naming convention:**
```
YYYYMMDDHHMMSS_description.sql
```

**Example migration:**
```sql
-- server/migrations/mysql/20240120120000_add_examples_table.sql
CREATE TABLE IF NOT EXISTS examples (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_examples_name ON examples(name);
```

## Key Files to Reference

- **Types**: `packages/types/src/`
- **API Client**: `packages/sdk/src/`
- **Environment**: `.env.example` files in each workspace
- **Git Hooks**: `scripts/` directory
- **CI/CD**: `.github/workflows/`
- **OpenAPI Spec**: `server/docs/api-documentation/openapi.yaml`

## Dependencies

### Client
- React 19
- Vite
- Material-UI (MUI)
- React Router DOM
- TypeScript

### Server
- Express.js
- MySQL2
- TypeScript
- Helmet (security)
- express-rate-limit

### Testing
- Jest (unit tests)
- Playwright (E2E tests)
- Vitest (client tests)

## Environment Variables

Check `.env.example` in each workspace for required variables.

### Server (.env)
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASSWORD=password
DB_NAME=my_dashboard
API_SECURITY_KEY=your-secret-key
GITHUB_TOKEN=optional
JIRA_BASE_URL=optional
JIRA_API_TOKEN=optional
```

### Client (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_KEY=your-secret-key
```

## Deployment

- **Server**: Railway (auto-deploy from main)
- **Client**: Railway (auto-deploy from main)
- **Docs**: GitHub Pages (auto-deploy from main)
- **Pre-deploy**: Database migrations run automatically

## Error Handling

Always use custom error classes from `server/src/errors/`:

```typescript
import { ValidationError, NotFoundError, DatabaseError } from '../errors';

// Validation error
throw new ValidationError('Invalid input', [{
  field: 'email',
  message: 'Email is required',
  code: 'REQUIRED_FIELD'
}]);

// Not found error
throw new NotFoundError('User not found');

// Database error
throw new DatabaseError('Failed to insert record', originalError);
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [ ... ]
}
```

## Getting Help

- Check existing documentation first
- Review similar implementations in codebase
- Consult OpenAPI spec for API contracts
- Check ADRs for architectural decisions
- Review test files for usage examples

## Important Notes

1. **Never commit directly to main** - Always use feature branches
2. **Run tests before pushing** - Ensure all tests pass
3. **Update documentation** - Keep docs in sync with code
4. **Follow conventions** - Respect existing patterns
5. **Ask before major changes** - Discuss architectural changes first

