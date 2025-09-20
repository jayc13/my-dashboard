# Pull Request Guide

This guide outlines the standards and best practices for creating, reviewing, and merging pull requests in My Dashboard, ensuring high code quality and smooth collaboration.

## Pull Request Workflow

### 1. Before Creating a PR

#### Branch Naming Convention
Use descriptive branch names that follow this pattern:
```
<type>/<short-description>
```

Examples:
```bash
feat/user-authentication
fix/memory-leak-dashboard
docs/api-documentation
refactor/error-handling
chore/dependency-updates
```

#### Pre-PR Checklist
- [ ] Code follows project conventions and style guide
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated (if applicable)
- [ ] No merge conflicts with target branch
- [ ] Commit messages follow conventional commit format
- [ ] No hardcoded secrets or credentials
- [ ] Performance impact considered

### 2. Creating a Pull Request

#### PR Title Format
Follow conventional commit format for PR titles:
```
<type>[optional scope]: <description>
```

Examples:
```
feat(client): add user profile dashboard
fix(server): resolve database connection timeout
docs: update API documentation
refactor(cron): simplify job scheduling logic
```

#### PR Description
Use the provided PR template to ensure all necessary information is included:
- Clear description of changes
- Related issues linked
- Type of change specified
- Components affected listed
- Testing information provided
- Deployment considerations noted

### 3. PR Size Guidelines

#### Ideal PR Size
- **Small PRs** (< 200 lines): Preferred for faster review and reduced risk
- **Medium PRs** (200-500 lines): Acceptable with good documentation
- **Large PRs** (> 500 lines): Should be avoided; consider breaking into smaller PRs

#### When Large PRs Are Acceptable
- Major refactoring that can't be easily split
- New feature implementation that requires multiple related changes
- Migration or upgrade tasks
- Initial project setup

### 4. Code Review Process

#### For Authors

##### Preparing for Review
- Self-review your code before requesting review
- Ensure CI checks pass
- Add clear commit messages
- Update documentation
- Add or update tests

##### Responding to Feedback
- Address all reviewer comments
- Ask for clarification if feedback is unclear
- Mark conversations as resolved after addressing
- Re-request review after making changes

#### For Reviewers

##### Review Checklist
- [ ] **Functionality**: Does the code do what it's supposed to do?
- [ ] **Logic**: Is the logic correct and efficient?
- [ ] **Style**: Does the code follow project conventions?
- [ ] **Tests**: Are there adequate tests for the changes?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Performance**: Will this impact performance negatively?
- [ ] **Documentation**: Is the code well-documented?
- [ ] **Maintainability**: Is the code easy to understand and maintain?

##### Review Guidelines
- Be constructive and specific in feedback
- Explain the "why" behind suggestions
- Distinguish between blocking issues and suggestions
- Approve when ready, even if minor suggestions remain
- Use GitHub's review features (approve, request changes, comment)

### 5. Merge Requirements

#### Automated Checks
All PRs must pass:
- [ ] CI/CD pipeline tests
- [ ] Code quality checks (linting, formatting)
- [ ] Security scans
- [ ] Build verification

#### Manual Requirements
- [ ] At least one approval from a code owner
- [ ] All conversations resolved
- [ ] No merge conflicts
- [ ] Branch is up to date with target branch

### 6. Merge Strategies

#### Squash and Merge (Preferred)
- Combines all commits into a single commit
- Keeps main branch history clean
- Use when PR contains multiple small commits

#### Merge Commit
- Preserves individual commit history
- Use for significant features or when commit history is important
- Creates a merge commit in the target branch

#### Rebase and Merge
- Replays commits on top of target branch
- No merge commit created
- Use when maintaining linear history is important

### 7. Component-Specific Guidelines

#### Client (React Frontend)
- Include screenshots for UI changes
- Test across different browsers/devices
- Verify accessibility standards
- Check bundle size impact
- Ensure responsive design

#### Server (Node.js Backend)
- Include API documentation updates
- Verify database migration scripts
- Test error handling scenarios
- Check security implications
- Validate input/output schemas

#### Database Changes
- Include migration scripts
- Test rollback procedures
- Document schema changes
- Consider performance impact on large datasets
- Verify foreign key constraints

#### CI/CD Changes
- Test workflow changes in feature branch
- Document new environment variables
- Verify deployment procedures
- Check security implications

### 8. Common PR Patterns

#### Feature Development
```
feat(client): implement user dashboard

- Add dashboard component with analytics
- Integrate with user preferences API
- Add responsive design for mobile
- Include unit and integration tests

Closes #123
```

#### Bug Fixes
```
fix(server): resolve memory leak in user sessions

The session cleanup job was not properly disposing of expired sessions,
causing memory usage to grow over time.

- Fix session cleanup logic
- Add monitoring for session count
- Include regression test

Fixes #456
```

#### Refactoring
```
refactor(client): extract common utility functions

- Move shared functions to utils directory
- Add comprehensive unit tests
- Update imports across components
- Improve code reusability

No functional changes.
```

### 9. Troubleshooting

#### Common Issues

**Merge Conflicts**
```bash
git checkout main
git pull origin main
git checkout your-branch
git rebase main
# Resolve conflicts
git rebase --continue
git push --force-with-lease
```

**Failed CI Checks**
- Check the CI logs for specific errors
- Run tests locally to reproduce issues
- Fix issues and push new commits
- CI will automatically re-run

**Large PR Feedback**
- Consider breaking into smaller PRs
- Create a tracking issue for the overall feature
- Submit incremental changes
- Use feature flags for incomplete features

### 10. Best Practices

#### Do ✅
- Keep PRs focused on a single concern
- Write clear, descriptive PR titles and descriptions
- Include tests for new functionality
- Update documentation when needed
- Respond promptly to review feedback
- Use draft PRs for work-in-progress

#### Don't ❌
- Don't include unrelated changes
- Don't merge without proper review
- Don't ignore CI failures
- Don't force push after review has started (unless necessary)
- Don't take review feedback personally
- Don't merge your own PRs (unless emergency)

### 11. Emergency Procedures

#### Hotfix Process
1. Create hotfix branch from main
2. Make minimal necessary changes
3. Create PR with `hotfix:` prefix
4. Get expedited review
5. Merge immediately after approval
6. Follow up with proper testing

#### Rollback Process
1. Identify the problematic PR/commit
2. Create revert PR
3. Test the revert thoroughly
4. Get approval and merge
5. Investigate root cause
6. Plan proper fix

### 12. Metrics and Monitoring

Track these PR metrics:
- Time to first review
- Time to merge
- Number of review cycles
- PR size distribution
- Defect rate by PR size

Use these metrics to improve the development process and identify bottlenecks.
