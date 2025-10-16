# Getting Started

This guide will help you set up and run My Dashboard locally for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 (recommended: v22.20.0)
- **pnpm** - Fast, disk space efficient package manager
- **MySQL** 8.0 or higher
- **Redis** - For pub/sub messaging
- **Git** - Version control

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

### Installing Redis

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

**Windows:**
Use [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install) or [Docker](https://hub.docker.com/_/redis)

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

## Installation

### 1. Clone the Repository

```bash
git clone git@github.com:jayc13/my-dashboard.git
cd my-dashboard
```

### 2. Install Dependencies

Install all workspace dependencies using pnpm:

```bash
pnpm install --registry=https://registry.npmjs.org/
```

:::tip
Always use the `--registry=https://registry.npmjs.org/` flag when installing packages in this project.
:::

### 3. Set Up Environment Variables

Each workspace has its own environment configuration. Copy the example files and configure them:

#### Server Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=my_dashboard

# API Security
API_SECURITY_KEY=your-secret-api-key-here

# Redis
REDIS_URL=redis://localhost:6379

# GitHub Integration (optional)
GITHUB_TOKEN=your_github_token

# JIRA Integration (optional)
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_jira_token

# Firebase (optional, for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

#### Client Environment

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_KEY=your-secret-api-key-here
```

#### Cron Environment

```bash
cd ../cron
cp .env.example .env
```

Edit `cron/.env`:

```bash
# API Configuration
API_URL=http://localhost:3000
API_KEY=your-secret-api-key-here

# Redis
REDIS_URL=redis://localhost:6379

# Cron Schedules (optional - defaults provided)
E2E_REPORT_CRON_SCHEDULE="0 9 * * *"
PR_MANAGEMENT_SCHEDULE="0 9 * * 1-5"
MANUAL_TICKETS_REMINDER_SCHEDULE="0 9 * * 1-5"
DELETE_COMPLETED_TODOS_SCHEDULE="0 2 * * 0"
```

### 4. Set Up the Database

Create a MySQL database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE my_dashboard;
CREATE USER 'your_db_user'@'localhost' IDENTIFIED BY 'your_db_password';
GRANT ALL PRIVILEGES ON my_dashboard.* TO 'your_db_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Run database migrations:

```bash
cd server
pnpm run migrate
```

## Running the Application

### Development Mode

You can run each service individually or all together.

#### Option 1: Run All Services (Recommended)

From the root directory:

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev

# Terminal 3 - Cron (optional)
cd cron
npm run dev
```

#### Option 2: Using Package Scripts

If configured in the root `package.json`:

```bash
pnpm run dev:server
pnpm run dev:client
pnpm run dev:cron
```

### Accessing the Application

Once running, you can access:

- **Client Application**: http://localhost:5173
- **Server API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

### First Login

1. Navigate to http://localhost:5173
2. You'll be redirected to the login page
3. Enter the API key you configured in `API_SECURITY_KEY`
4. Click "Login"

## Verify Installation

### Check Server Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "redis": "connected"
}
```

### Check Database Connection

```bash
cd server
npm run migrate
```

Should show:
```
✓ Database connection successful
✓ Migrations applied successfully
```

### Check Redis Connection

```bash
redis-cli ping
```

Should return:
```
PONG
```

Or test from the server:
```bash
cd server
node -e "require('./src/config/redis').testRedisConnection().then(r => console.log('Redis:', r ? 'OK' : 'FAILED'))"
```

### Run Tests

```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test

# E2E tests
cd tests/e2e-tests
npm test
```

## Common Issues

### Port Already in Use

If port 3000 or 5173 is already in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

Or change the port in the respective `.env` files.

### Database Connection Failed

1. Verify MySQL is running:
   ```bash
   mysql.server status
   ```

2. Check credentials in `server/.env`

3. Ensure the database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### pnpm Installation Issues

If you encounter issues with pnpm:

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install --registry=https://registry.npmjs.org/
```

### Redis Connection Failed

1. Verify Redis is running:
   ```bash
   redis-cli ping
   ```

2. Check `REDIS_URL` in `.env` files

3. Start Redis if not running:
   ```bash
   # macOS
   brew services start redis

   # Linux
   sudo systemctl start redis
   ```

### Cron Jobs Not Running

1. Ensure Redis is running (cron jobs need Redis for pub/sub)
2. Verify server is running (to process Redis messages)
3. Check cron service logs for errors
4. Verify environment variables in `cron/.env`

## Next Steps

Now that you have the application running:

1. **Explore the Architecture** - Read the [Architecture Overview](./architecture/overview.md)
2. **Review Coding Standards** - Check [Coding Standards](./development/coding-standards.md)
3. **Understand the Git Workflow** - See [Git Workflow](./development/git-workflow.md)
4. **Start Contributing** - Read the [Contributing Guide](./development/contributing.md)

## Development Tools

### Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Language support
- **MySQL** - Database management
- **GitLens** - Git integration

### Useful Commands

```bash
# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run type-check

# Build for production
pnpm run build

# Run all tests
pnpm run test
```

## Getting Help

- **Documentation**: Browse this documentation site
- **Issues**: Check [GitHub Issues](https://github.com/jayc13/my-dashboard/issues)
- **Troubleshooting**: See [Troubleshooting Guide](./development/troubleshooting.md)
- **FAQ**: Check [Frequently Asked Questions](./others/faq.md)

