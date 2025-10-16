# Troubleshooting

This document provides solutions to common issues encountered during development and deployment of the My Dashboard project.

## Development Environment

### Installation Issues

#### pnpm install fails

**Problem:** `pnpm install` fails with registry errors

**Solution:**
```bash
# Use the correct registry
pnpm install --registry=https://registry.npmjs.org/

# Clear pnpm cache if needed
pnpm store prune

# Try again
pnpm install --registry=https://registry.npmjs.org/
```

#### Node version mismatch

**Problem:** Wrong Node.js version installed

**Solution:**
```bash
# Check current version
node --version

# Install correct version (v22.20.0)
nvm install 22.20.0
nvm use 22.20.0

# Set as default
nvm alias default 22.20.0
```

#### Git hooks not working

**Problem:** Pre-commit or pre-push hooks don't run

**Solution:**
```bash
# Reinstall husky
pnpm install

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push

# Verify hooks are installed
ls -la .husky
```

### Build Issues

#### TypeScript compilation errors

**Problem:** `tsc` fails with type errors

**Solution:**
```bash
# Clean build artifacts
rm -rf dist/
rm -rf .tsbuildinfo

# Rebuild dependencies
pnpm --filter=@my-dashboard/types run build
pnpm --filter=@my-dashboard/sdk run build

# Try building again
pnpm run build
```

#### Circular dependency errors

**Problem:** Module import circular dependency

**Solution:**
```typescript
// ❌ Bad - circular dependency
// file1.ts
import { B } from './file2';
export class A { }

// file2.ts
import { A } from './file1';
export class B { }

// ✅ Good - extract shared types
// types.ts
export interface IShared { }

// file1.ts
import type { IShared } from './types';
export class A implements IShared { }

// file2.ts
import type { IShared } from './types';
export class B implements IShared { }
```

#### Vite build fails

**Problem:** Client build fails with Vite errors

**Solution:**
```bash
# Clear Vite cache
rm -rf client/node_modules/.vite

# Clear dist
rm -rf client/dist

# Rebuild
cd client
npm run build
```

### Runtime Issues

#### Client won't start

**Problem:** `npm run dev` fails in client

**Solution:**
```bash
# Check port availability
lsof -i :5173
# Kill process if needed
kill -9 <PID>

# Check environment variables
cat client/.env
# Ensure all required variables are set

# Clear cache and restart
rm -rf client/node_modules/.vite
cd client
npm run dev
```

#### Server won't start

**Problem:** `npm run dev` fails in server

**Solution:**
```bash
# Check port availability
lsof -i :3000
kill -9 <PID>

# Check database connection
mysql -h localhost -u root -p
# Verify database exists

# Check environment variables
cat server/.env
# Ensure all required variables are set

# Run migrations
cd server
npm run migrate

# Start server
npm run dev
```

#### Database connection fails

**Problem:** Cannot connect to MySQL

**Solution:**
```bash
# Check MySQL is running
mysql.server status
# or
brew services list | grep mysql

# Start MySQL if needed
mysql.server start
# or
brew services start mysql

# Test connection
mysql -h localhost -u root -p

# Check credentials in .env
cat server/.env | grep MYSQL
```

#### Redis connection fails

**Problem:** Cannot connect to Redis

**Solution:**
```bash
# Check Redis is running
redis-cli ping
# Should return PONG

# Start Redis if needed
redis-server
# or
brew services start redis

# Check Redis URL in .env
cat server/.env | grep REDIS_URL
```

## Testing Issues

### Unit Tests

#### Tests fail locally

**Problem:** Tests pass in CI but fail locally

**Solution:**
```bash
# Clear test cache
rm -rf .coverage-report
rm -rf node_modules/.cache

# Ensure dependencies are up to date
pnpm install

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- path/to/test.test.ts
```

#### Mock not working

**Problem:** Mock functions not being called

**Solution:**
```typescript
// ✅ Good - mock before import
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  fetchUser: vi.fn(),
}));

import { fetchUser } from '../services/api';

// Now use the mock
it('should call fetchUser', async () => {
  await fetchUser(1);
  expect(fetchUser).toHaveBeenCalledWith(1);
});
```

#### Async test timeout

**Problem:** Test times out waiting for async operation

**Solution:**
```typescript
// ✅ Good - increase timeout for specific test
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
}, 10000); // 10 second timeout

// Or configure globally in jest.config.js
module.exports = {
  testTimeout: 10000,
};
```

### Integration Tests

#### Server not ready

**Problem:** Integration tests fail because server isn't ready

**Solution:**
```typescript
// ✅ Good - wait for server
beforeAll(async () => {
  testHelpers = new TestHelpers();
  await testHelpers.waitForServer(); // Wait for server to be ready
});
```

#### Database state issues

**Problem:** Tests fail due to database state from previous tests

**Solution:**
```typescript
// ✅ Good - clean database between tests
beforeEach(async () => {
  await db.query('TRUNCATE TABLE users');
  await db.query('TRUNCATE TABLE applications');
});

afterAll(async () => {
  await db.end();
});
```

### E2E Tests

#### Browser not found

**Problem:** Playwright can't find browser

**Solution:**
```bash
# Install browsers
cd tests/e2e-tests
npx playwright install

# Install system dependencies
npx playwright install-deps
```

#### Element not found

**Problem:** Test can't find element on page

**Solution:**
```typescript
// ❌ Bad - no wait
await page.click('button');

// ✅ Good - wait for element
await page.waitForSelector('button');
await page.click('button');

// ✅ Better - use built-in waiting
await page.locator('button').click();
```

#### Flaky tests

**Problem:** Tests pass sometimes, fail other times

**Solution:**
```typescript
// ✅ Good - wait for network idle
import { waitForNetworkIdle } from '../utils/test-helpers';

await page.goto('/dashboard');
await waitForNetworkIdle(page);

// ✅ Good - wait for specific condition
await page.waitForFunction(() => {
  return document.querySelector('.loading') === null;
});
```

## Git Issues

### Commit Message Rejected

**Problem:** Commit rejected by commit-msg hook

**Solution:**
```bash
# ❌ Bad commit message
git commit -m "fixed bug"

# ✅ Good commit message
git commit -m "fix(client): resolve login button styling issue"

# Format: <type>(<scope>): <description>
# Types: feat, fix, docs, style, refactor, test, chore
```

### Pre-commit Hook Fails

**Problem:** Pre-commit hook fails with linting errors

**Solution:**
```bash
# Fix linting errors
pnpm run lint

# Auto-fix if possible
pnpm run lint --fix

# Commit again
git commit -m "feat: add new feature"
```

### Merge Conflicts

**Problem:** Merge conflicts when rebasing or merging

**Solution:**
```bash
# Update your branch
git fetch upstream
git rebase upstream/main

# Conflicts will be marked in files
# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving
git add <resolved-files>
git rebase --continue

# If you want to abort
git rebase --abort
```

### Push Rejected

**Problem:** Push rejected due to diverged branches

**Solution:**
```bash
# If you haven't pushed yet
git pull --rebase upstream main
git push origin feat/your-feature

# If you've already pushed (use with caution)
git push origin feat/your-feature --force-with-lease
```

## CI/CD Issues

### Workflow Fails

#### Linting fails in CI

**Problem:** Linting passes locally but fails in CI

**Solution:**
```bash
# Ensure you're using the same Node version
nvm use 22.20.0

# Run linting exactly as CI does
pnpm -r --if-present run lint

# Check for uncommitted changes
git status
```

#### Tests fail in CI

**Problem:** Tests pass locally but fail in CI

**Solution:**
```bash
# Run tests in CI mode
CI=true npm test

# Check for environment-specific issues
# - Timezone differences
# - File path differences (case sensitivity)
# - Network timeouts
```

#### Build fails in CI

**Problem:** Build succeeds locally but fails in CI

**Solution:**
```bash
# Clean install dependencies
rm -rf node_modules
pnpm install --frozen-lockfile

# Build in production mode
NODE_ENV=production npm run build

# Check for missing dependencies
pnpm list
```

### Deployment Issues

#### Railway deployment fails

**Problem:** Deployment fails on Railway

**Solution:**
1. Check Railway logs
2. Verify environment variables
3. Check build command
4. Verify start command
5. Check resource limits

```bash
# View Railway logs
railway logs

# Check service status
railway status
```

#### Database migration fails

**Problem:** Migration fails during deployment

**Solution:**
```bash
# Test migration locally
cd server
npm run migrate

# Check migration files
ls -la src/migrations

# Rollback if needed
npm run migrate:rollback

# Fix migration and try again
npm run migrate
```

#### Health check fails

**Problem:** Railway health check fails

**Solution:**
```typescript
// Ensure health endpoint exists
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Check Railway health check configuration
// Path: /health
// Interval: 30s
// Timeout: 10s
```

## Performance Issues

### Slow Build Times

**Problem:** Build takes too long

**Solution:**
```bash
# Enable caching
# Already configured in vite.config.ts

# Use incremental builds
# Already configured in tsconfig.json

# Parallelize builds
pnpm -r --parallel run build

# Exclude unnecessary files
# Check .gitignore and tsconfig.json exclude
```

### Slow Tests

**Problem:** Tests take too long to run

**Solution:**
```bash
# Run tests in parallel
npm test -- --maxWorkers=4

# Run only changed tests
npm test -- --onlyChanged

# Skip slow tests during development
npm test -- --testPathIgnorePatterns=e2e
```

### Memory Issues

**Problem:** Out of memory errors

**Solution:**
```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or in package.json
"scripts": {
  "build": "node --max-old-space-size=4096 node_modules/vite/bin/vite.js build"
}
```

## Common Error Messages

### "Cannot find module"

**Solution:**
```bash
# Install missing dependency
pnpm add <package-name> --registry=https://registry.npmjs.org/

# Or rebuild dependencies
rm -rf node_modules
pnpm install
```

### "Port already in use"

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### "Permission denied"

**Solution:**
```bash
# Fix file permissions
chmod +x <file>

# Fix directory permissions
chmod -R 755 <directory>
```

### "ENOSPC: System limit for number of file watchers reached"

**Solution:**
```bash
# Increase file watcher limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Getting Help

If you can't find a solution here:

1. **Search existing issues** - Someone may have had the same problem
2. **Check documentation** - Review relevant docs
3. **Ask in discussions** - Post in GitHub Discussions
4. **Create an issue** - If it's a bug, create a bug report

When asking for help, include:
- Error message (full stack trace)
- Steps to reproduce
- Environment details (OS, Node version, etc.)
- What you've tried
- Relevant code snippets

## Next Steps

- [Setup Guide](./setup.md) - Development environment setup
- [Contributing](./contributing.md) - Contribution guidelines
- [Testing](./testing.md) - Testing guidelines

