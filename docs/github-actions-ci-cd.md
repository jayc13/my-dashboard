# GitHub Actions CI/CD Documentation

This directory contains GitHub Actions workflows for automated testing, validation, and deployment of the Cypress Dashboard project. The workflows have been refactored into a modular architecture for better maintainability and reusability.

## 🏗️ Architecture Overview

The CI/CD system now uses a modular approach with:
- **Reusable Workflows**: Separate workflow files for each validation type
- **Composite Actions**: Reusable action components for common tasks
- **External Scripts**: Complex logic moved to testable shell scripts

## 🚀 Workflows Overview

### 1. Pull Request Validation (`pr-validation.yml`)
**Triggers:** Pull requests to `main` or `develop` branches (when ready for review)

**Purpose:** Main orchestrator workflow that coordinates all validation jobs

**Architecture:** Now uses reusable workflows and composite actions:
- **Basic Validation** (`jobs/basic-validation.yml`): Validates commits, PR title, detects changes
- **Client Validation** (`jobs/validate-client.yml`): React frontend validation with bundle analysis
- **Server Validation** (`jobs/validate-server.yml`): Node.js backend validation with database tests
- **Cron Validation** (`jobs/validate-cron.yml`): Cron job service validation
- **Scripts Validation** (`jobs/validate-scripts.yml`): Utility scripts validation
- **Validation Summary**: Aggregates all results and provides final status

**Key Improvements:**
- Reduced from 502 lines to 90 lines
- Modular, reusable components
- External scripts for complex logic
- Better error handling and reporting

### 2. Reusable Workflows
Each validation type is now a separate, reusable workflow located in `.github/workflows/`:

#### `jobs/basic-validation.yml`
- Commit message validation using commitlint
- PR title format validation
- Change detection for conditional job execution
- TODO/FIXME comment analysis
- PR complexity analysis

#### `jobs/validate-client.yml`
- ESLint linting and TypeScript type checking
- Build verification and unit tests
- Comprehensive bundle size analysis
- Bundle size comparison with main branch
- Bundle size validation against thresholds

#### `jobs/validate-server.yml`
- TypeScript type checking and ESLint linting
- Build verification with MySQL service
- Database migration testing
- Unit tests with test database

#### `jobs/validate-cron.yml` & `jobs/validate-scripts.yml`
- Component-specific validation
- Build and test verification
- Configuration validation

### 3. Composite Actions
Reusable action components in `.github/actions/`:

#### `setup-node/`
- Standardized Node.js setup with caching
- Configurable version and registry
- Optional dependency installation

#### `setup-validation/`
- Basic validation environment setup
- Commitlint installation
- Git configuration

#### `bundle-analysis/`
- Bundle size analysis orchestration
- Calls external analysis scripts
- Configurable thresholds

### 4. External Scripts
Complex validation logic moved to `scripts/ci/` for better testability:

#### Bundle Analysis Scripts
- `bundle-analysis.sh`: Analyzes current bundle size and composition
- `bundle-comparison.sh`: Compares bundle size with main branch
- `bundle-validation.sh`: Validates size changes against thresholds

#### PR Validation Scripts
- `pr-title-validation.sh`: Validates PR title format using commitlint
- `pr-complexity-analysis.sh`: Analyzes PR complexity (files, lines changed)
- `commit-validation.sh`: Validates all commit messages in PR

**Benefits:**
- Scripts can be tested independently
- Logic is version controlled and reviewable
- Easier debugging and maintenance
- Consistent error handling and output formatting

## 🔄 Migration Benefits

The refactoring provides several key improvements:

1. **Maintainability**: Logic separated into focused, single-purpose files
2. **Reusability**: Workflows and actions can be reused across projects
3. **Testability**: External scripts can be unit tested
4. **Readability**: Main workflow reduced from 502 to 90 lines
5. **Modularity**: Easy to add/remove/modify validation steps
6. **Performance**: Conditional execution based on file changes
7. **Debugging**: Easier to identify and fix issues in specific components

## 🔧 Configuration

### Required Secrets
The following secrets should be configured in your GitHub repository:

```
# Database (for testing)
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME

# API Keys (if needed for testing)
CYPRESS_RECORD_KEY
FIREBASE_CONFIG

# Security scanning
SNYK_TOKEN (optional)
SONAR_TOKEN (optional)
```

### Environment Variables
Each workflow uses appropriate environment variables for testing:
- `NODE_ENV=test` for test environments
- Database connection strings for integration tests
- API endpoints for E2E testing

## 📋 Validation Checklist

### Before Creating a PR
- [ ] Code compiles without errors
- [ ] All existing tests pass
- [ ] New functionality has tests
- [ ] Code follows project conventions
- [ ] Documentation is updated
- [ ] No hardcoded secrets or credentials

### PR Requirements
- [ ] Descriptive title following conventional commits
- [ ] Clear description of changes
- [ ] Breaking changes are documented
- [ ] Tests cover new functionality
- [ ] No security vulnerabilities introduced

## 🛠️ Local Development

### Running Checks Locally

**Client:**
```bash
cd client
npm ci
npm run lint
npm run build
# TODO: npm test (when tests are implemented)
```

**Server:**
```bash
cd server
npm ci
npm test
npm run build
```

**Cron:**
```bash
cd cron
npm ci
npm run build
# TODO: npm test (when tests are implemented)
```

### Pre-commit Hooks
Consider setting up pre-commit hooks to run basic checks:

```bash
# TODO: Implement pre-commit hooks
# - ESLint for code quality
# - Prettier for formatting
# - TypeScript compilation
# - Basic tests
```

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Verify TypeScript configuration

**Test Failures:**
- Check database connection for server tests
- Verify test environment setup
- Review test data and mocks

**Security Scan Issues:**
- Update vulnerable dependencies
- Remove hardcoded secrets
- Review security best practices

### Getting Help
1. Check the workflow logs in GitHub Actions tab
2. Review the specific job that failed
3. Look for error messages and stack traces
4. Consult the project documentation
5. Ask for help in team channels

## 📈 Metrics and Reporting

### Coverage Reports
- **Server**: Jest generates coverage reports in `server/coverage/`
- **Client**: TODO - Implement coverage reporting
- **Overall**: TODO - Implement combined coverage reporting

### Performance Metrics
- **Bundle Size**: Tracked for client builds
- **API Response Times**: Measured during testing
- **Database Query Performance**: Monitored in integration tests

### Security Reports
- **Dependency Vulnerabilities**: Reported by npm audit
- **Secret Scanning**: TODO - Implement comprehensive scanning
- **Code Quality**: TODO - Implement SonarQube integration

## 🔄 Continuous Improvement

### TODO Items for Implementation
The workflows contain many TODO items for future implementation:

**High Priority:**
- [ ] Implement comprehensive test suites
- [ ] Add E2E testing with Cypress
- [ ] Set up code coverage reporting
- [ ] Implement security scanning tools
- [ ] Add performance benchmarking

**Medium Priority:**
- [ ] Set up SonarQube for code quality
- [ ] Implement API documentation generation
- [ ] Add bundle size analysis
- [ ] Set up Lighthouse CI for performance

**Low Priority:**
- [ ] Add accessibility testing automation
- [ ] Implement license compliance checking
- [ ] Set up automated dependency updates
- [ ] Add deployment automation

### Contributing to CI/CD
When adding new workflows or modifying existing ones:

1. Test changes in a fork first
2. Use meaningful job and step names
3. Add appropriate error handling
4. Include helpful log messages
5. Update this documentation
6. Consider the impact on build times

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides)
- [Marketplace Actions](https://github.com/marketplace?type=actions)

---

*This documentation is maintained by the development team. Please keep it updated as workflows evolve.*
