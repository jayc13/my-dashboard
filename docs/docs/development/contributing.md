# Contributing

Thank you for your interest in contributing to My Dashboard! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- **Be respectful** - Treat everyone with respect and kindness
- **Be collaborative** - Work together to improve the project
- **Be constructive** - Provide helpful feedback
- **Be patient** - Remember that everyone is learning

## Getting Started

### Prerequisites

- **Node.js** v22.19.0 or higher
- **pnpm** 10.17.1 or higher
- **Git** 2.0 or higher
- **MySQL** 8.0 (for local development)
- **Redis** (optional, for pub/sub features)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone git@github.com:YOUR_USERNAME/my-dashboard.git
   cd my-dashboard
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream git@github.com:jayc13/my-dashboard.git
   ```

4. **Install dependencies**
   ```bash
   pnpm install --registry=https://registry.npmjs.org/
   ```

5. **Setup environment variables**
   ```bash
   # Copy example env files
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   cp cron/.env.example cron/.env
   ```

6. **Start development servers**
   ```bash
   # Terminal 1 - Client
   cd client
   npm run dev

   # Terminal 2 - Server
   cd server
   npm run dev

   # Terminal 3 - Cron (optional)
   cd cron
   npm run dev
   ```

## Contribution Workflow

### 1. Find or Create an Issue

**Before starting work:**
- Check existing issues for duplicates
- Comment on the issue to claim it
- Discuss your approach if it's a significant change

**Create a new issue:**
- Use the appropriate issue template
- Provide clear description and context
- Add relevant labels

### 2. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feat/your-feature-name
```

**Branch naming:**
- `feat/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/topic` - Documentation
- `refactor/component-name` - Refactoring
- `test/test-name` - Tests

### 3. Make Your Changes

**Follow coding standards:**
- See [Coding Standards](./coding-standards.md)
- Run linter: `pnpm run lint`
- Run type checker: `pnpm run typecheck`

**Write tests:**
- Unit tests for new functionality
- Integration tests for API changes
- E2E tests for user workflows

**Update documentation:**
- Update relevant docs
- Add JSDoc comments
- Update README if needed

### 4. Commit Your Changes

**Follow commit conventions:**
- See [Git Workflow](./git-workflow.md)
- Use conventional commits format
- Write clear commit messages

```bash
# Stage changes
git add .

# Commit with conventional format
git commit -m "feat(client): add user profile page"
```

**Pre-commit hooks will run:**
- Linting
- Type checking
- Build

### 5. Push Your Changes

```bash
# Push to your fork
git push origin feat/your-feature-name
```

**Pre-push hooks will run:**
- Unit tests

### 6. Create a Pull Request

**On GitHub:**
1. Go to your fork
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template
5. Link related issues
6. Request reviews

**PR Title Format:**
```
<type>(<scope>): <description>

Examples:
feat(client): add user profile page
fix(server): resolve database connection timeout
docs: update contributing guidelines
```

**PR Description:**
- What does this PR do?
- Why is this change needed?
- How was it tested?
- Screenshots (if UI changes)
- Breaking changes (if any)

### 7. Code Review Process

**What to expect:**
- Reviewers will provide feedback
- CI/CD checks must pass
- At least one approval required
- Address feedback promptly

**Responding to feedback:**
```bash
# Make requested changes
# ...

# Commit changes
git commit -m "fix: address review feedback"

# Push updates
git push origin feat/your-feature-name
```

### 8. Merge

**After approval:**
- Squash and merge (preferred)
- Delete branch after merge
- Close related issues

## Types of Contributions

### Bug Fixes

1. **Reproduce the bug** - Verify the issue exists
2. **Write a failing test** - Demonstrate the bug
3. **Fix the bug** - Make the test pass
4. **Verify the fix** - Run all tests

**Example:**
```typescript
// 1. Write failing test
it('should handle empty user list', () => {
  const result = processUsers([]);
  expect(result).toEqual([]);
});

// 2. Fix the bug
function processUsers(users: User[]) {
  if (!users || users.length === 0) {
    return [];
  }
  // ... rest of logic
}
```

### New Features

1. **Discuss the feature** - Create an issue first
2. **Design the solution** - Plan the implementation
3. **Implement incrementally** - Small, focused commits
4. **Write tests** - Comprehensive test coverage
5. **Update documentation** - Keep docs in sync

**Checklist:**
- [ ] Feature discussed in issue
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Backward compatible

### Documentation

**Types of documentation:**
- Code comments (JSDoc)
- README files
- API documentation
- Architecture docs
- User guides

**Documentation standards:**
- Clear and concise
- Include examples
- Keep up to date
- Use proper formatting

### Tests

**Test coverage goals:**
- Overall: 80% minimum
- Critical paths: 100%
- New features: 90%+

**Writing good tests:**
- Test behavior, not implementation
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent

## Pull Request Guidelines

### PR Size

**Keep PRs small:**
- < 400 lines changed (ideal)
- < 800 lines changed (acceptable)
- \> 800 lines (split into multiple PRs)

**Benefits of small PRs:**
- Faster reviews
- Easier to understand
- Less likely to introduce bugs
- Easier to revert if needed

### PR Checklist

Before submitting:
- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] All tests pass locally
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] No hardcoded secrets
- [ ] Commit messages follow conventions
- [ ] PR description is clear

### PR Template

```markdown
## 🎯 What does this PR do?
Brief description of changes

## 🧩 Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## 🧪 Testing
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

## 📋 Additional Notes
Any deployment notes or breaking changes
```

## Review Guidelines

### For Reviewers

**What to look for:**
- Code quality and style
- Test coverage
- Performance implications
- Security concerns
- Documentation completeness

**How to provide feedback:**
- Be constructive and specific
- Explain the "why" behind suggestions
- Distinguish between required and optional changes
- Approve when ready

**Review checklist:**
- [ ] Code is readable and maintainable
- [ ] Tests are comprehensive
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Documentation is updated

### For Contributors

**Responding to reviews:**
- Address all comments
- Ask questions if unclear
- Make requested changes
- Mark conversations as resolved
- Thank reviewers

## Common Scenarios

### Syncing with Upstream

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main
git checkout main
git merge upstream/main

# Update your fork
git push origin main

# Rebase your feature branch
git checkout feat/your-feature
git rebase main
```

### Resolving Conflicts

```bash
# Update your branch
git fetch upstream
git rebase upstream/main

# Resolve conflicts
# Edit conflicted files
git add <resolved-files>
git rebase --continue

# Force push (if already pushed)
git push origin feat/your-feature --force-with-lease
```

### Updating a PR

```bash
# Make changes
# ...

# Commit
git commit -m "fix: address review feedback"

# Push
git push origin feat/your-feature
```

### Squashing Commits

```bash
# Interactive rebase
git rebase -i HEAD~3

# Change 'pick' to 'squash' for commits to combine
# Save and exit

# Force push
git push origin feat/your-feature --force-with-lease
```

## Getting Help

### Resources

- **Documentation** - Check the docs first
- **Issues** - Search existing issues
- **Discussions** - Ask questions in discussions
- **Code** - Read the codebase

### Asking Questions

**Good questions include:**
- What you're trying to do
- What you've tried
- Error messages or logs
- Relevant code snippets
- Environment details

**Example:**
```
I'm trying to add a new API endpoint for user preferences.
I've created the route and controller, but I'm getting a 
TypeScript error about the request type.

Error: Property 'preferences' does not exist on type 'Request'

Code:
```typescript
app.post('/api/preferences', (req, res) => {
  const prefs = req.body.preferences; // Error here
});
```

How should I properly type the request body?
```

## Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project README

Thank you for contributing! 🎉

## Next Steps

- [Coding Standards](./coding-standards.md) - Code style and conventions
- [Git Workflow](./git-workflow.md) - Branching and commits
- [Testing](./testing.md) - Testing guidelines
- [Setup Guide](./setup.md) - Development environment setup

