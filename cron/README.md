# Cron - Scheduled Job Services

The cron application is a Node.js service that runs scheduled background jobs for the Cypress Dashboard. It handles automated tasks like E2E report generation, PR approval notifications, manual testing reminders, and data cleanup operations.

## 🚀 Technology Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **TypeScript 5.1.6** - Type-safe JavaScript development
- **node-cron 4.2.1** - Cron job scheduling
- **config 3.3.9** - Configuration management
- **dotenv 17.2.2** - Environment variable management

### Development Tools
- **ts-node 10.9.1** - TypeScript execution for development
- **ESLint 9.35.0** - Code linting and quality

## 📁 Project Structure

```
cron/
├── src/
│   ├── jobs/              # Scheduled job implementations
│   │   ├── clean-up-data-files.job.ts
│   │   ├── is-pr-approved.job.ts
│   │   ├── manualTicketsReminder.job.ts
│   │   └── report-e2e.job.ts
│   ├── utils/             # Utility functions
│   │   ├── constants.ts   # Application constants
│   │   └── helpers.ts     # Helper functions
│   └── index.ts           # Main application entry point
├── config/                # Configuration files
│   └── default.js         # Default configuration
├── dist/                  # Compiled JavaScript (generated)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration
└── railway.toml           # Railway deployment configuration
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Access to the main API server
- Proper environment variables configured

### Installation
```bash
cd cron
npm install
```

### Environment Variables
Create a `.env` file in the cron directory:
```bash
# API Configuration
API_URL=http://localhost:3000
API_KEY=your_internal_api_key

# External Service APIs
GITHUB_TOKEN=your_github_token
JIRA_API_TOKEN=your_jira_token
JIRA_BASE_URL=https://your-domain.atlassian.net

# Notification Settings
SLACK_WEBHOOK_URL=your_slack_webhook
TEAMS_WEBHOOK_URL=your_teams_webhook

# Environment
NODE_ENV=development
```

### Configuration
The application uses the `config` library for managing settings. Edit `config/default.js`:

```javascript
module.exports = {
  jobs: {
    report_e2e: {
      schedule: '0 9 * * 1-5',        // 9 AM, Monday to Friday
      enabled: true
    },
    is_pr_approved: {
      schedule: '*/15 * * * *',       // Every 15 minutes
      enabled: true
    },
    manual_tickets_reminder: {
      schedule: '0 10 * * 1-5',       // 10 AM, Monday to Friday
      enabled: true
    },
    clean_up_old_reports: {
      schedule: '0 2 * * 0',          // 2 AM every Sunday
      enabled: true
    }
  },
  api: {
    baseUrl: process.env.API_URL || 'http://localhost:3000',
    timeout: 30000
  }
};
```

### Available Scripts

#### Development
```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

#### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint-fix
```

## ⏰ Scheduled Jobs

### 1. E2E Report Generation (`report-e2e.job.ts`)
**Schedule**: `0 9 * * 1-5` (9 AM, Monday to Friday)

**Purpose**: Generates comprehensive E2E test reports and sends notifications

**Functionality**:
- Fetches latest E2E test results from Cypress
- Processes test data and generates reports
- Calculates success rates and failure trends
- Sends notifications to development team
- Updates dashboard with latest metrics

**Configuration**:
```javascript
report_e2e: {
  schedule: '0 9 * * 1-5',    // 9 AM weekdays
  enabled: true,
  recipients: ['team@company.com'],
  includeFailureDetails: true
}
```

### 2. PR Approval Monitoring (`is-pr-approved.job.ts`)
**Schedule**: `*/15 * * * *` (Every 15 minutes)

**Purpose**: Monitors pull requests for approval status and sends notifications

**Functionality**:
- Checks GitHub for newly approved PRs
- Identifies PRs ready for merge
- Sends notifications to relevant team members
- Updates PR status in the dashboard
- Triggers automated merge workflows (if configured)

**Configuration**:
```javascript
is_pr_approved: {
  schedule: '*/15 * * * *',   // Every 15 minutes
  enabled: true,
  autoMerge: false,
  notifyOnApproval: true
}
```

### 3. Manual Testing Reminders (`manualTicketsReminder.job.ts`)
**Schedule**: `0 10 * * 1-5` (10 AM, Monday to Friday)

**Purpose**: Sends reminders for manual testing tasks that need attention

**Functionality**:
- Queries Jira for manual testing tickets
- Identifies overdue or high-priority tasks
- Sends personalized reminders to assignees
- Updates ticket status and priority
- Escalates critical issues to team leads

**Configuration**:
```javascript
manual_tickets_reminder: {
  schedule: '0 10 * * 1-5',   // 10 AM weekdays
  enabled: true,
  reminderThreshold: 2,       // Days before reminder
  escalationThreshold: 5      // Days before escalation
}
```

### 4. Data Cleanup (`clean-up-data-files.job.ts`)
**Schedule**: `0 2 * * 0` (2 AM every Sunday)

**Purpose**: Cleans up old data files and maintains system performance

**Functionality**:
- Removes old E2E test reports and artifacts
- Cleans up temporary files and logs
- Archives historical data
- Optimizes database performance
- Frees up disk space

**Configuration**:
```javascript
clean_up_old_reports: {
  schedule: '0 2 * * 0',      // 2 AM Sundays
  enabled: true,
  retentionDays: 30,          // Keep data for 30 days
  archiveOldData: true
}
```

## 🏗️ Job Architecture

### Job Structure
Each job follows a consistent structure:

```typescript
// Example job structure
export default async function jobName(): Promise<void> {
  try {
    console.log(`Starting ${jobName} at ${new Date().toISOString()}`);
    
    // Job implementation
    await performJobLogic();
    
    console.log(`${jobName} completed successfully`);
  } catch (error) {
    console.error(`${jobName} failed:`, error);
    // Error handling and notifications
  }
}
```

### Error Handling
- Comprehensive error logging
- Automatic retry mechanisms for transient failures
- Notification of critical failures to administrators
- Graceful degradation for non-critical errors

### Health Monitoring
- Regular health checks to the main API
- Job execution status tracking
- Performance metrics collection
- Alerting for job failures or delays

## 🔧 Configuration Management

### Environment-based Configuration
The application supports multiple environments with different configurations:

```javascript
// config/development.js
module.exports = {
  jobs: {
    report_e2e: {
      schedule: '*/5 * * * *',  // More frequent for testing
      enabled: true
    }
  }
};

// config/production.js
module.exports = {
  jobs: {
    report_e2e: {
      schedule: '0 9 * * 1-5',  // Standard schedule
      enabled: true
    }
  }
};
```

### Dynamic Configuration
- Runtime configuration updates
- Feature flags for enabling/disabling jobs
- Schedule modifications without restarts
- A/B testing for job parameters

## 🚀 Deployment

### Production Build
```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Railway Deployment
The cron service includes Railway configuration (`railway.toml`):
```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[env]
NODE_ENV = "production"
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY config/ ./config/

CMD ["npm", "start"]
```

### Health Checks
The application includes health check functionality:
- API connectivity verification
- Job execution status monitoring
- System resource monitoring
- External service availability checks

## 📊 Monitoring & Logging

### Job Execution Monitoring
- Start and completion timestamps
- Execution duration tracking
- Success/failure rates
- Performance metrics

### Logging Strategy
```typescript
// Structured logging example
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  job: 'report-e2e',
  status: 'started',
  metadata: { reportCount: 15 }
}));
```

### Alerting
- Critical job failures
- Extended execution times
- API connectivity issues
- Resource utilization alerts

## 🐛 Troubleshooting

### Common Issues

**Job Not Running:**
```bash
# Check cron schedule syntax
node -e "const cron = require('node-cron'); console.log(cron.validate('0 9 * * 1-5'));"

# Verify configuration
node -e "const config = require('config'); console.log(config.get('jobs'));"
```

**API Connection Issues:**
```bash
# Test API connectivity
curl -H "Authorization: Bearer $API_KEY" $API_URL/health

# Check environment variables
echo $API_URL $API_KEY
```

**Job Execution Failures:**
```bash
# Check logs for specific job
npm run dev | grep "report-e2e"

# Test individual job
node -e "require('./dist/jobs/report-e2e.job.js').default()"
```

### Development Debugging
```bash
# Start with verbose logging
DEBUG=* npm run dev

# Run TypeScript compilation check
npx tsc --noEmit

# Test configuration loading
node -e "console.log(require('config'))"
```

## 🔄 Development Workflow

### Adding New Jobs
1. Create new job file in `src/jobs/`
2. Implement job logic following existing patterns
3. Add job configuration to `config/default.js`
4. Register job in `src/index.ts`
5. Add appropriate error handling and logging
6. Test job execution in development
7. Update documentation

### Job Development Best Practices
- Use TypeScript for type safety
- Implement comprehensive error handling
- Add detailed logging for debugging
- Include performance monitoring
- Write unit tests for job logic
- Document job purpose and configuration

## 📚 Additional Resources

- [node-cron Documentation](https://github.com/node-cron/node-cron)
- [Node.js Config Documentation](https://github.com/node-config/node-config)
- [Cron Expression Generator](https://crontab.guru/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
