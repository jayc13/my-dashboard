# Cypress Dashboard

A comprehensive dashboard for Cypress test results with automated git hooks for code quality.

## 🏗️ Project Structure

This is a monorepo containing:

- **`client/`** - React frontend application
- **`server/`** - Node.js/Express backend API
- **`cron/`** - Scheduled tasks and background jobs
- **`scripts/`** - Utility scripts and tools

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm (package manager)

### Installation
```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

## 🎯 Git Hooks & Code Quality

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality standards:

### Automated Hooks

- **Pre-commit**: Runs linting and formatting before each commit
- **Commit-msg**: Validates commit messages using conventional commits
- **Pre-push**: Runs tests and build before pushing to remote

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**
```bash
feat: add user authentication
fix(client): resolve login button styling
docs: update API documentation
test(server): add unit tests for auth middleware
```

**Get help with commit format:**
```bash
pnpm run commit-help
```

### Valid Commit Types
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI configuration changes
- `chore` - Maintenance tasks
- `revert` - Revert previous commits

## 📚 Documentation

- [Git Hooks Setup](docs/git-hooks.md) - Detailed information about git hooks
- [Conventional Commits Guide](docs/conventional-commits.md) - Commit message standards
- [Pull Request Guide](docs/pull-request-guide.md) - PR guidelines
- [GitHub Actions CI/CD](docs/github-actions-ci-cd.md) - CI/CD pipeline information

## 🔧 Development Workflow

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd cypress-dashboard
   pnpm install
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make Changes**
   - Write code following project standards
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   *Note: Pre-commit hooks will run linting and formatting*

5. **Push Changes**
   ```bash
   git push origin feat/your-feature-name
   ```
   *Note: Pre-push hooks will run tests and build*

6. **Create Pull Request**
   - Follow the PR template
   - Ensure all CI checks pass
   - Request code review

## 🧪 Testing

### Unit & Integration Tests
```bash
# Run all tests
pnpm run test

# Run tests for specific workspace
pnpm run test --filter=server
pnpm run test --filter=client
```

### End-to-End (E2E) Tests
The project includes comprehensive E2E tests using Playwright that test the full application stack.

```bash
# Run E2E tests (requires both client and server to be running)
./scripts/run-e2e-tests.sh

# Run E2E tests in headed mode (visible browser)
./scripts/run-e2e-tests.sh --headed

# Run E2E tests in debug mode
./scripts/run-e2e-tests.sh --debug

# Manual setup for E2E tests
cd tests/e2e-tests
pnpm install
npx playwright install
pnpm test
```

**E2E Test Features:**
- ✅ Authentication flow testing
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Mobile browser testing
- ✅ Network failure simulation
- ✅ Session persistence testing
- ✅ Automatic screenshots on failure
- ✅ Video recording on failure

**CI/CD Integration:**
E2E tests run automatically in GitHub Actions on every pull request, testing the complete application stack including:
- Server startup and health checks
- Client build and development server
- Database setup and migrations
- Full user journey testing

## 🏗️ Building

```bash
# Build all workspaces
pnpm run build

# Build specific workspace
pnpm run build --filter=client
pnpm run build --filter=server
```

## 🤝 Contributing

1. Follow the conventional commit format
2. Ensure all tests pass
3. Update documentation for new features
4. Follow the existing code style
5. Create meaningful pull requests

## 📄 License

[Add your license information here]

## 🆘 Troubleshooting

### Git Hooks Not Working
```bash
# Reinstall Husky
npx husky install
```

### Commit Message Validation Failing
```bash
# Get help with commit format
pnpm run commit-help
```

### Tests Failing
```bash
# Run tests to see specific failures
pnpm run test
```

For more detailed troubleshooting, see [docs/git-hooks.md](docs/git-hooks.md).

## Setup

1. Install [pnpm](https://pnpm.io/installation) if you haven't already:
   ```sh
   npm install -g pnpm
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

3. Start the development server:
   ```sh
   pnpm run dev
   ```
