# Frequently Asked Questions (FAQ)

Common questions and answers about My Dashboard.

## General Questions

### What is My Dashboard?

My Dashboard is a comprehensive Cypress test results dashboard with JIRA integration. It aggregates E2E test results, monitors pull requests, manages tasks, and provides real-time notifications.

### What technologies does it use?

- **Frontend**: React 19, Vite, TypeScript, Material-UI
- **Backend**: Express.js, TypeScript, MySQL, Redis
- **Scheduled Jobs**: node-cron
- **Infrastructure**: pnpm, Railway, GitHub Actions

### Is this open source?

Check the LICENSE file in the repository for licensing information.

## Setup and Installation

### What are the system requirements?

- Node.js >= 18.0.0 (recommended: v22.20.0)
- pnpm package manager
- MySQL 8.0 or higher
- Redis (for pub/sub messaging)
- Git

### Why do I need to use pnpm?

This project uses pnpm workspaces for monorepo management. pnpm is faster, more disk-efficient, and provides better dependency management than npm or yarn.

### Can I use npm or yarn instead of pnpm?

No, the project is configured specifically for pnpm. Using npm or yarn may cause dependency resolution issues.

### Why do I need the `--registry` flag?

The `--registry=https://registry.npmjs.org/` flag ensures packages are installed from the official npm registry, which is a project requirement.

## Authentication

### Does the API use JWT tokens?

No, the API uses simple API key authentication only. There are no JWT tokens.

### How do I get an API key?

The API key is set in the server's environment variables (`API_SECURITY_KEY`). You configure it yourself when setting up the project.

### Can I have multiple API keys?

Currently, the system supports a single shared API key. For multiple users, you would need to implement a more sophisticated authentication system.

### How secure is API key authentication?

The implementation includes:
- Constant-time comparison to prevent timing attacks
- Brute force protection (3 attempts, 30-minute block)
- Rate limiting
- HTTPS in production

For higher security needs, consider implementing OAuth2 or JWT-based authentication.

## Development

### How do I add a new dependency?

```bash
# For server
pnpm add <package> --filter server --registry=https://registry.npmjs.org/

# For client
pnpm add <package> --filter client --registry=https://registry.npmjs.org/
```

### Why are my commits being rejected?

The project uses git hooks to enforce:
- Conventional Commit format
- Code linting
- Unit tests passing

Make sure your commit message follows the format:
```
<type>(<scope>): <description>
```

### How do I skip git hooks temporarily?

```bash
git commit --no-verify -m "your message"
```

**Warning**: Only use this in exceptional cases. Hooks exist for code quality.

### What validation library does the project use?

The project uses **custom validation utilities** (not Zod, Joi, or Yup). See `server/src/utils/validation.ts`.

## Database

### How do I create a new migration?

1. Create a file in `server/migrations/mysql/`
2. Name it: `YYYYMMDDHHMMSS_description.sql`
3. Write your SQL migration
4. Run: `npm run migrate`

### How do I reset the database?

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE my_dashboard; CREATE DATABASE my_dashboard;"

# Run migrations
cd server
npm run migrate
```

### Can I use a different database?

The project is built specifically for MySQL. Switching to PostgreSQL or MongoDB would require significant changes to the database layer.

### Do I need Redis?

Yes, Redis is required for:
- Pub/Sub messaging between cron jobs and the server
- E2E report generation workflow
- Notification delivery from background jobs

Without Redis, scheduled jobs won't be able to communicate with the server.

### How do I install Redis?

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

### How do I check if Redis is running?

```bash
redis-cli ping
# Should return: PONG
```

## API

### Where is the API documentation?

- **OpenAPI Spec**: `server/docs/api-documentation/openapi.yaml`
- **Documentation**: This site's [API section](../api/overview.md)

### How do I test API endpoints?

Use tools like:
- cURL
- Postman
- Insomnia
- The TypeScript SDK

Example:
```bash
curl http://localhost:3000/api/apps \
  -H "x-api-key: your-api-key"
```

### What's the difference between the API and the SDK?

- **API**: Raw HTTP endpoints
- **SDK**: TypeScript client library that wraps the API with type safety and convenience methods

## Testing

### How do I run tests?

```bash
# All tests
pnpm -r test

# Server tests only
cd server && npm test

# Client tests only
cd client && npm test

# E2E tests
cd tests/e2e-tests && npm test
```

### Why are E2E tests failing?

Common causes:
- Server not running
- Database not set up
- Wrong API key in test environment
- Port conflicts

### How do I debug tests?

```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test
npm test -- path/to/test.test.ts

# E2E tests in headed mode
cd tests/e2e-tests
npm run test:headed
```

## Deployment

### Where is the application deployed?

The project is configured for deployment on Railway, but can be deployed to any platform that supports Node.js and MySQL.

### How do I deploy to production?

The project uses GitHub Actions for CI/CD. Pushing to the `main` branch triggers automatic deployment to Railway.

### How do I set environment variables in production?

In Railway:
1. Go to your project dashboard
2. Select the service (server/client)
3. Go to "Variables" tab
4. Add your environment variables

### Do I need to run migrations in production?

Yes, but they run automatically as a pre-deploy command in Railway. See `railway.toml`.

## Cron Jobs

### What cron jobs are available?

The project includes 4 scheduled jobs:

1. **E2E Report Generation** - Daily at 9 AM
2. **Pull Requests Management** - Weekdays at 9 AM
3. **Manual Testing Reminders** - Weekdays at 9 AM
4. **Delete Completed Todos** - Sundays at 2 AM

### How do I run cron jobs locally?

```bash
cd cron
npm run dev
```

The cron service will start and schedule all jobs according to their configured schedules.

### How do I change cron schedules?

Set environment variables in `cron/.env`:

```bash
E2E_REPORT_CRON_SCHEDULE="0 9 * * *"
PR_MANAGEMENT_SCHEDULE="0 9 * * 1-5"
MANUAL_TICKETS_REMINDER_SCHEDULE="0 9 * * 1-5"
DELETE_COMPLETED_TODOS_SCHEDULE="0 2 * * 0"
```

### How do I test a cron job manually?

You can import and run individual jobs:

```typescript
import reportE2EJob from './src/jobs/report-e2e.job';

// Run the job
await reportE2EJob();
```

### Why aren't my cron jobs running?

Check:
1. Cron service is running: `cd cron && npm run dev`
2. Redis is running: `redis-cli ping`
3. Server is running to process Redis messages
4. Check cron logs for errors

### How do cron jobs communicate with the server?

Cron jobs use two methods:
1. **Redis Pub/Sub**: For async messaging (E2E reports, notifications)
2. **API Calls**: Via the TypeScript SDK (PR management, todos)

## Troubleshooting

### "Port 3000 already in use"

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or change the port
# Edit server/.env: PORT=3001
```

### "Database connection failed"

1. Check MySQL is running: `mysql.server status`
2. Verify credentials in `server/.env`
3. Test connection: `mysql -u dashboard_user -p my_dashboard`

### "Invalid or missing API key"

1. Check `x-api-key` header is included
2. Verify key matches `API_SECURITY_KEY` in server `.env`
3. Ensure server has been restarted after changing `.env`

### "Too many failed attempts"

You've exceeded the brute force protection limit (3 attempts in 15 minutes). Wait 30 minutes or restart the server to clear the block.

### "pnpm install fails"

```bash
# Clear cache
pnpm store prune

# Remove node_modules
rm -rf node_modules */node_modules

# Reinstall
pnpm install --registry=https://registry.npmjs.org/
```

### Git hooks not working

```bash
# Reinstall hooks
pnpm run prepare

# Or manually
npx husky install
```

### "Redis connection failed"

1. Check Redis is running: `redis-cli ping`
2. Verify `REDIS_URL` in `.env` files
3. Default URL: `redis://localhost:6379`
4. Check Redis logs: `redis-cli INFO`

### Cron jobs not executing

1. Verify cron service is running
2. Check Redis connection
3. Verify server is running (to process Redis messages)
4. Check cron schedule syntax
5. Review cron service logs

## Features

### How do I integrate with JIRA?

1. Get JIRA API token from Atlassian
2. Add to `server/.env`:
   ```bash
   JIRA_BASE_URL=https://your-domain.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=your_token
   ```
3. Restart server

### How do I set up GitHub integration?

1. Create GitHub Personal Access Token
2. Add to `server/.env`:
   ```bash
   GITHUB_TOKEN=your_token
   ```
3. Restart server

### How do I enable push notifications?

1. Set up Firebase project
2. Add Firebase credentials to `server/.env` and `client/.env`
3. Register device token via `/api/fcm/register-token`

### Can I customize the dashboard?

Yes! The client is built with React and Material-UI. You can customize:
- Components in `client/src/components/`
- Pages in `client/src/pages/`
- Themes in Material-UI configuration

## Contributing

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

See [Contributing Guide](../development/contributing.md) for details.

### What should I include in a pull request?

- Clear description of changes
- Tests for new functionality
- Updated documentation
- Conventional commit messages

### How long does PR review take?

This depends on the project maintainers' availability. Check the repository for response times.

## Performance

### How do I optimize the client build?

The client uses Vite which is already optimized. Additional optimizations:
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis: `npm run build -- --analyze`

### How do I improve API performance?

- Add database indexes
- Implement caching
- Optimize SQL queries
- Use pagination for large datasets

## Getting More Help

### Where can I get help?

1. Check this FAQ
2. Read the [Troubleshooting Guide](../development/troubleshooting.md)
3. Search [GitHub Issues](https://github.com/jayc13/my-dashboard/issues)
4. Create a new issue with details

### How do I report a bug?

1. Check if it's already reported in GitHub Issues
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

### How do I request a feature?

Create a GitHub Issue with:
- Feature description
- Use case
- Proposed implementation (optional)

---

**Still have questions?** Check the [Troubleshooting Guide](../development/troubleshooting.md) or create an issue on GitHub.

