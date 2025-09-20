# Conventional Commits Guide

This document outlines the conventional commit format used in this project to maintain consistent and meaningful commit messages.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

### Primary Types
- **feat**: A new feature for the user
- **fix**: A bug fix for the user
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Breaking Changes
Add `!` after the type/scope to indicate a breaking change:
```
feat!: remove deprecated API endpoint
```

## Scopes

Use these scopes to indicate which part of the codebase is affected:

- **client**: React frontend application
- **server**: Node.js backend API
- **cron**: Scheduled job services
- **scripts**: Utility and deployment scripts
- **db**: Database schema or migrations
- **ci**: CI/CD workflows and configurations
- **docs**: Documentation changes
- **deps**: Dependency updates

## Examples

### Feature Examples
```bash
feat(client): add user profile dashboard
feat(server): implement JWT authentication
feat(cron): add daily report generation job
feat!: migrate to new authentication system
```

### Fix Examples
```bash
fix(client): resolve memory leak in dashboard component
fix(server): handle null values in user validation
fix(db): correct foreign key constraint in users table
```

### Documentation Examples
```bash
docs: add API endpoint documentation
docs(server): update deployment guide
docs: fix typos in README
```

### Refactoring Examples
```bash
refactor(client): extract common utility functions
refactor(server): simplify error handling middleware
refactor: reorganize project structure
```

### Build/CI Examples
```bash
build(deps): update React to v18
ci: add automated security scanning
build: optimize Docker image size
```

### Test Examples
```bash
test(client): add unit tests for user service
test(server): improve API endpoint coverage
test: add integration tests for authentication flow
```

## Commit Message Body

Use the body to explain **what** and **why** vs. **how**:

```
feat(server): implement rate limiting middleware

Add rate limiting to prevent API abuse and improve service stability.
The middleware uses Redis for distributed rate limiting across instances.

- Configurable limits per endpoint
- Different limits for authenticated vs anonymous users
- Graceful degradation when Redis is unavailable

Closes #123
```

## Footer Conventions

### Issue References
- `Fixes #123` - Closes an issue
- `Closes #123` - Closes an issue
- `Resolves #123` - Closes an issue
- `Relates to #123` - References an issue without closing

### Breaking Changes
```
BREAKING CHANGE: The `getUserById` function now returns a Promise instead of synchronous data.

Migration guide:
- Replace `const user = getUserById(id)` 
- With `const user = await getUserById(id)`
```

### Co-authored commits
```
Co-authored-by: Jane Doe <jane@example.com>
Co-authored-by: John Smith <john@example.com>
```

## Best Practices

### Do ✅
- Use imperative mood ("add" not "added" or "adds")
- Keep the first line under 50 characters
- Capitalize the first letter of the description
- Don't end the description with a period
- Use the body to explain complex changes
- Reference issues and PRs when relevant

### Don't ❌
- Don't use vague descriptions like "fix stuff" or "update code"
- Don't include implementation details in the subject line
- Don't use past tense ("added", "fixed")
- Don't exceed 72 characters per line in the body

## Tools and Automation

### Commitizen
Install commitizen for interactive commit creation:
```bash
npm install -g commitizen cz-conventional-changelog
```

Usage:
```bash
git add .
git cz
```

### Commit Linting
The project uses commitlint to enforce conventional commit format:
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### Git Hooks
Pre-commit hooks validate commit messages:
```bash
npm install --save-dev husky
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
```

## Examples by Component

### Client (React Frontend)
```bash
feat(client): add responsive navigation menu
fix(client): resolve hydration mismatch in SSR
style(client): update button component styling
refactor(client): migrate class components to hooks
test(client): add unit tests for form validation
```

### Server (Node.js Backend)
```bash
feat(server): implement user authentication endpoints
fix(server): handle database connection timeouts
perf(server): optimize database queries with indexing
refactor(server): extract validation middleware
test(server): add integration tests for user API
```

### Database
```bash
feat(db): add user preferences table
fix(db): correct foreign key relationships
refactor(db): normalize user data structure
```

### CI/CD
```bash
ci: add automated testing workflow
build: update Node.js version in Docker
ci: implement security vulnerability scanning
```

## Changelog Generation

Conventional commits enable automatic changelog generation:
- `feat` commits appear under "Features"
- `fix` commits appear under "Bug Fixes"
- `BREAKING CHANGE` commits appear under "Breaking Changes"
- Other types can be configured as needed

## Integration with Pull Requests

Ensure your PR title follows conventional commit format:
```
feat(client): add user dashboard with analytics
```

This helps maintain consistency between commits and PR titles, making project history more readable and searchable.
