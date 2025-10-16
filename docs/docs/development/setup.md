# Development Setup

This guide provides detailed instructions for setting up your development environment for My Dashboard.

## Prerequisites

### Required Software

1. **Node.js** (v22.20.0 recommended)
   ```bash
   # Check version
   node --version
   
   # Install via nvm (recommended)
   nvm install 22.20.0
   nvm use 22.20.0
   ```

2. **pnpm** (package manager)
   ```bash
   # Install globally
   npm install -g pnpm
   
   # Verify installation
   pnpm --version
   ```

3. **MySQL** (8.0 or higher)
   ```bash
   # macOS (via Homebrew)
   brew install mysql@8.0
   brew services start mysql@8.0
   
   # Verify installation
   mysql --version
   ```

4. **Git**
   ```bash
   # Verify installation
   git --version
   ```

### Optional Tools

- **MySQL Workbench** - GUI for database management
- **Postman** or **Insomnia** - API testing
- **VS Code** - Recommended IDE

## Initial Setup

### 1. Clone Repository

```bash
git clone git@github.com:jayc13/my-dashboard.git
cd my-dashboard
```

### 2. Install Dependencies

Install all workspace dependencies:

```bash
pnpm install --registry=https://registry.npmjs.org/
```

:::tip
Always use the `--registry=https://registry.npmjs.org/` flag when installing packages.
:::

### 3. Database Setup

#### Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE my_dashboard;
CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON my_dashboard.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Run Migrations

```bash
cd server
npm run migrate
```

### 4. Environment Configuration

#### Server Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=dashboard_user
DB_PASSWORD=your_password
DB_NAME=my_dashboard

# API Security
API_SECURITY_KEY=dev-secret-key-change-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# GitHub Integration (Optional)
GITHUB_TOKEN=your_github_personal_access_token

# JIRA Integration (Optional)
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_jira_api_token

# Firebase Configuration (Optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Brute Force Protection
BRUTE_FORCE_MAX_ATTEMPTS=3
BRUTE_FORCE_WINDOW_MS=900000
```

#### Client Environment

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_KEY=dev-secret-key-change-in-production

# Firebase Configuration (Optional)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

#### Cron Environment

```bash
cd ../cron
cp .env.example .env
```

Edit as needed for scheduled jobs.

## Running the Application

### Development Mode

Open three terminal windows:

#### Terminal 1: Server

```bash
cd server
npm run dev
```

Server will start on `http://localhost:3000`

#### Terminal 2: Client

```bash
cd client
npm run dev
```

Client will start on `http://localhost:5173`

#### Terminal 3: Cron (Optional)

```bash
cd cron
npm run dev
```

### Verify Setup

1. **Check Server Health**
   ```bash
   curl http://localhost:3000/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-20T12:00:00.000Z"
   }
   ```

2. **Access Client**
   - Open browser to `http://localhost:5173`
   - You should see the login page

3. **Login**
   - Enter the API key from your `.env` file
   - You should be redirected to the dashboard

## IDE Setup

### VS Code (Recommended)

#### Recommended Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens",
    "mysql.mysql-shell"
  ]
}
```

#### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Git Hooks

The project uses Husky for git hooks. They should be automatically installed after `pnpm install`.

### Verify Git Hooks

```bash
# Check if hooks are installed
ls -la .husky

# You should see:
# - pre-commit
# - commit-msg
# - pre-push
```

### Git Hook Behavior

- **pre-commit**: Runs linting and formatting
- **commit-msg**: Validates commit message format (Conventional Commits)
- **pre-push**: Runs unit tests

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes

Edit files in your preferred editor.

### 3. Run Tests

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

### 4. Lint and Format

```bash
# Lint
pnpm run lint

# Format
pnpm run format
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat(client): add new feature"
```

The commit message will be validated by commitlint.

### 6. Push Changes

```bash
git push origin feat/your-feature-name
```

Tests will run automatically before push.

## Common Development Tasks

### Adding a New Package

```bash
# To server
pnpm add <package> --filter server --registry=https://registry.npmjs.org/

# To client
pnpm add <package> --filter client --registry=https://registry.npmjs.org/

# To all workspaces
pnpm add -w <package> --registry=https://registry.npmjs.org/
```

### Running Specific Tests

```bash
# Run specific test file
npm test -- path/to/test.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Database Operations

```bash
# Run migrations
cd server
npm run migrate

# Create new migration
# Manually create file: server/migrations/mysql/YYYYMMDDHHMMSS_description.sql

# Backup database
./scripts/mysql-backup.sh
```

### Building for Production

```bash
# Build all workspaces
pnpm -r build

# Build specific workspace
pnpm --filter server build
pnpm --filter client build
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Database Connection Issues

1. Verify MySQL is running:
   ```bash
   mysql.server status
   ```

2. Test connection:
   ```bash
   mysql -u dashboard_user -p my_dashboard
   ```

3. Check credentials in `server/.env`

### pnpm Issues

```bash
# Clear cache
pnpm store prune

# Remove node_modules
rm -rf node_modules
rm -rf */node_modules

# Reinstall
pnpm install --registry=https://registry.npmjs.org/
```

### Git Hooks Not Working

```bash
# Reinstall hooks
pnpm run prepare

# Or manually
npx husky install
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf */tsconfig.tsbuildinfo

# Rebuild
pnpm -r build
```

## Next Steps

- [Coding Standards](./coding-standards.md) - Learn coding conventions
- [Git Workflow](./git-workflow.md) - Understand branching and commits
- [Testing](./testing.md) - Write and run tests
- [Contributing](./contributing.md) - Contribution guidelines

