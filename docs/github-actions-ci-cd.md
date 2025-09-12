# GitHub Actions CI/CD Documentation

This directory contains GitHub Actions workflows for automated testing, validation, and deployment of the Cypress Dashboard project.

## 🚀 Workflows Overview

### 1. Pull Request Validation (`pr-validation.yml`)
**Triggers:** Pull requests to `main` or `develop` branches (when ready for review)

**Purpose:** Comprehensive validation of pull requests before merge

**Jobs:**
- **Setup and Basic Validation**: Detects changes and validates PR structure
- **Client Validation**: Lints, type-checks, builds, and tests the React frontend
- **Server Validation**: Tests, builds, and validates the Node.js backend
- **Cron Validation**: Validates the cron job service
- **Scripts Validation**: Validates utility scripts
- **Security Scan**: Performs security and compliance checks
- **Performance Check**: Runs performance and accessibility audits
- **Validation Summary**: Provides overall validation results

### 2. Additional PR Checks (`pr-checks.yml`)
**Triggers:** All pull requests to `main` or `develop` branches

**Purpose:** Additional informational checks that don't block PR merge

**Jobs:**
- **Documentation Check**: Validates documentation updates
- **Database Check**: Tests database migrations and schema changes
- **API Compatibility**: Checks for breaking API changes
- **Environment Check**: Validates configuration files
- **Code Standards**: Enforces coding standards and conventions
- **Performance Regression**: Detects performance regressions
- **Accessibility Check**: Validates accessibility compliance

### 3. Draft PR Feedback (`draft-pr-feedback.yml`)
**Triggers:** Draft pull requests

**Purpose:** Provides early feedback for work-in-progress PRs

**Jobs:**
- **Draft PR Feedback**: Quick syntax checks and improvement suggestions
- **Quick Build Check**: Fast compilation checks for each component
- **Quick Security Scan**: Basic security issue detection
- **Draft Summary**: Provides guidance for completing the PR

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
