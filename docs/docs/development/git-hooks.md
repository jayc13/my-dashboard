# Git Hooks

My Dashboard uses [Husky](https://typicode.github.io/husky/) to manage Git hooks that automatically enforce code quality and consistency standards throughout the development workflow.

## Installed Hooks

### 1. Pre-commit Hook
**Triggers:** Before each commit
**Purpose:** Ensures code quality by running linting and formatting

**What it does:**
- Runs ESLint across all workspaces (`npm run lint`)
- If linting passes, automatically fixes issues (`npm run lint:fix`)
- Prevents commit if linting fails

### 2. Commit Message Hook
**Triggers:** When creating a commit message
**Purpose:** Validates commit message format using conventional commits

**What it does:**
- Validates commit messages against conventional commit format
- Ensures consistent commit history
- Provides helpful error messages with examples

**Valid commit format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Valid types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Examples:**
```bash
feat: add user authentication
fix(client): resolve login button styling
docs: update API documentation
test(server): add unit tests for auth middleware
```

### 3. Pre-push Hook
**Triggers:** Before pushing to remote repository
**Purpose:** Ensures all tests pass and code builds successfully

**What it does:**
- Runs all tests across workspaces (`npm run test`)
- Runs build process to ensure compilation succeeds (`npm run build`)
- Prevents push if tests fail or build fails

## Configuration Files

- **`commitlint.config.js`**: Configuration for commit message validation
- **`.husky/`**: Directory containing all git hook scripts
- **`package.json`**: Contains the `prepare` script that installs Husky

## Bypassing Hooks (Use with Caution)

In rare cases where you need to bypass hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "your message"

# Skip pre-push hook
git push --no-verify
```

**Note:** Only bypass hooks when absolutely necessary and ensure you run the checks manually.

## Troubleshooting

### Hook not running
1. Ensure Husky is installed: `npm install`
2. Check if hooks are executable: `ls -la .husky/`
3. Reinstall Husky: `npx husky install`

### Commit message validation failing
1. Check your commit message format
2. Ensure you're using valid commit types
3. Keep subject line under 100 characters

### Tests failing in pre-push
1. Run tests locally: `npm run test`
2. Fix failing tests before pushing
3. Ensure all workspaces have passing tests

## Benefits

- **Consistent Code Quality**: Automatic linting and formatting
- **Standardized Commit Messages**: Better project history and changelog generation
- **Prevent Broken Code**: Tests must pass before pushing
- **Team Collaboration**: Everyone follows the same standards
- **CI/CD Integration**: Reduces failed builds in CI pipeline
