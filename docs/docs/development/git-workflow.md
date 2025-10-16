# Git Workflow

This document describes the Git workflow, branching strategy, and commit conventions used in the My Dashboard project.

## Branching Strategy

### Main Branches

- **`main`** - Production-ready code
  - Always deployable
  - Protected branch (requires PR and reviews)
  - All commits must pass CI/CD checks

### Feature Branches

Create feature branches from `main` for all new work:

```bash
git checkout main
git pull origin main
git checkout -b <type>/<description>
```

### Branch Naming Convention

```
<type>/<short-description>
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes
- `build` - Build system changes

**Examples:**
```bash
feat/user-authentication
fix/memory-leak-in-dashboard
docs/api-documentation
refactor/error-handling
test/integration-tests
chore/update-dependencies
```

**Rules:**
- Use lowercase
- Use hyphens to separate words
- Keep it short but descriptive
- No special characters except hyphens

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent, semantic commit messages.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type

Must be one of the following:

- **feat** - A new feature
- **fix** - A bug fix
- **docs** - Documentation only changes
- **style** - Changes that don't affect code meaning (formatting, whitespace)
- **refactor** - Code change that neither fixes a bug nor adds a feature
- **perf** - Code change that improves performance
- **test** - Adding missing tests or correcting existing tests
- **build** - Changes affecting the build system or external dependencies
- **ci** - Changes to CI configuration files and scripts
- **chore** - Other changes that don't modify src or test files
- **revert** - Reverts a previous commit

### Scope (Optional)

The scope provides additional context about what part of the codebase is affected:

- `client` - Client application
- `server` - Server application
- `cron` - Cron jobs
- `sdk` - SDK package
- `types` - Types package
- `docs` - Documentation
- `api` - API endpoints
- `db` - Database changes

### Description

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize the first letter
- No period (.) at the end
- Maximum 72 characters

### Body (Optional)

- Provide additional context about the change
- Explain the motivation for the change
- Contrast with previous behavior
- Wrap at 72 characters

### Footer (Optional)

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

### Examples

**Simple commit:**
```bash
git commit -m "feat: add user authentication"
```

**With scope:**
```bash
git commit -m "fix(client): resolve login button styling issue"
```

**With body:**
```bash
git commit -m "feat(server): implement rate limiting middleware

Add rate limiting to prevent API abuse. Uses express-rate-limit
with Redis store for distributed rate limiting across instances.

Closes #234"
```

**Breaking change:**
```bash
git commit -m "feat(api): change authentication endpoint

BREAKING CHANGE: /auth/login now requires email instead of username"
```

**Multiple changes:**
```bash
git commit -m "refactor(client): restructure authentication flow

- Move auth logic to separate context
- Add token refresh mechanism
- Improve error handling

Closes #345"
```

## Git Hooks

The project uses [Husky](https://typicode.github.io/husky/) to enforce quality standards through Git hooks.

### Pre-Commit Hook

Runs before each commit:

1. **Install dependencies** - Ensures all packages are up to date
2. **Lint** - Runs ESLint across all workspaces
3. **Type check** - Runs TypeScript type checking
4. **Build** - Builds all workspaces

```bash
# Automatically runs on git commit
git commit -m "feat: add new feature"
```

**What it does:**
```bash
pnpm install
pnpm -r --if-present run lint
pnpm -r --if-present run typecheck
pnpm -r --if-present run build
```

### Commit-Msg Hook

Validates commit message format:

```bash
# Automatically runs on git commit
git commit -m "invalid message"  # ❌ Will fail
git commit -m "feat: valid message"  # ✅ Will pass
```

**Validation rules:**
- Must follow Conventional Commits format
- Type must be valid (feat, fix, docs, etc.)
- Description is required
- Maximum line length enforced

### Pre-Push Hook

Runs tests before pushing:

```bash
# Automatically runs on git push
git push origin feat/my-feature
```

**What it does:**
```bash
pnpm -r --filter '!./tests/e2e-tests' --filter '!./tests/integration-tests' --if-present run test
```

### Bypassing Hooks (Not Recommended)

In exceptional cases, you can bypass hooks:

```bash
# Skip all hooks
git commit --no-verify -m "emergency fix"
git push --no-verify
```

**⚠️ Warning:** Only use this in emergencies. Hooks exist to maintain code quality.

## Development Workflow

### 1. Start New Work

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/my-new-feature
```

### 2. Make Changes

```bash
# Edit files
# ...

# Check status
git status

# Review changes
git diff
```

### 3. Stage Changes

```bash
# Stage specific files
git add src/components/NewComponent.tsx

# Stage all changes
git add .

# Stage interactively
git add -p
```

### 4. Commit Changes

```bash
# Commit with message
git commit -m "feat(client): add new component"

# Commit with editor (for longer messages)
git commit
```

**Pre-commit hook will run automatically:**
- ✅ Linting
- ✅ Type checking
- ✅ Build

### 5. Push Changes

```bash
# Push to remote
git push origin feat/my-new-feature

# First push (set upstream)
git push -u origin feat/my-new-feature
```

**Pre-push hook will run automatically:**
- ✅ Unit tests

### 6. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template
5. Request reviews
6. Wait for CI/CD checks

### 7. Address Review Feedback

```bash
# Make changes based on feedback
# ...

# Commit changes
git commit -m "fix: address review feedback"

# Push updates
git push origin feat/my-new-feature
```

### 8. Merge Pull Request

Once approved and all checks pass:

1. Squash and merge (preferred)
2. Delete branch after merge

## Common Git Commands

### Viewing History

```bash
# View commit history
git log

# View compact history
git log --oneline

# View history with graph
git log --graph --oneline --all

# View changes in a commit
git show <commit-hash>
```

### Undoing Changes

```bash
# Discard unstaged changes
git checkout -- <file>

# Unstage file
git reset HEAD <file>

# Amend last commit
git commit --amend

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Stashing Changes

```bash
# Stash changes
git stash

# Stash with message
git stash save "work in progress"

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Drop stash
git stash drop stash@{0}
```

### Rebasing

```bash
# Rebase on main
git checkout feat/my-feature
git rebase main

# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# Continue after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort
```

### Cherry-Picking

```bash
# Apply specific commit to current branch
git cherry-pick <commit-hash>

# Cherry-pick without committing
git cherry-pick -n <commit-hash>
```

## Best Practices

### Commit Frequency

- **Commit often** - Small, focused commits are easier to review
- **One logical change per commit** - Don't mix unrelated changes
- **Commit working code** - Each commit should leave the code in a working state

### Commit Messages

- **Be descriptive** - Explain what and why, not how
- **Use imperative mood** - "add feature" not "added feature"
- **Reference issues** - Link to relevant issues or tickets
- **Keep it concise** - First line under 72 characters

### Branch Management

- **Keep branches short-lived** - Merge within a few days
- **Delete merged branches** - Clean up after merging
- **Sync with main regularly** - Rebase or merge main frequently
- **One feature per branch** - Don't mix multiple features

### Pull Requests

- **Small PRs** - Easier to review and merge
- **Clear description** - Explain what, why, and how
- **Self-review first** - Review your own changes before requesting review
- **Respond to feedback** - Address comments promptly
- **Keep updated** - Rebase on main if needed

## Troubleshooting

### Merge Conflicts

```bash
# When conflicts occur during merge/rebase
git status  # See conflicted files

# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving
git add <resolved-files>
git commit  # For merge
git rebase --continue  # For rebase
```

### Accidentally Committed to Wrong Branch

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch

# Commit changes
git commit -m "feat: correct commit"
```

### Need to Update Commit Message

```bash
# Last commit
git commit --amend

# Older commit (interactive rebase)
git rebase -i HEAD~3
# Change 'pick' to 'reword' for commits to update
```

### Pushed Sensitive Data

```bash
# Remove file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ dangerous)
git push origin --force --all
```

**⚠️ Better approach:** Rotate credentials immediately and contact team.

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Husky Documentation](https://typicode.github.io/husky/)

## Next Steps

- [Coding Standards](./coding-standards.md) - Code style and conventions
- [Testing](./testing.md) - Testing guidelines
- [CI/CD](./ci-cd.md) - Continuous integration and deployment

