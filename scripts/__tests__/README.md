# Scripts Testing

This directory contains tests for the scripts workspace, particularly for commit message validation.

## Test Structure

- `commit-msg.test.js` - Tests for commit message validation using commitlint
- `../test-commit-msg.js` - Utility script for testing commit messages

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Test commit messages interactively
pnpm test-commit-msg
```

## Test Categories

### Valid Commit Messages
Tests that verify properly formatted commit messages are accepted:
- All conventional commit types (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
- Messages with scopes
- Breaking change indicators
- Real-world examples

### Invalid Commit Messages
Tests that verify improperly formatted commit messages are rejected:
- Missing type
- Invalid type
- Missing colon
- Missing description
- Incorrect capitalization
- Trailing periods
- Empty messages

### Scope Validation
Tests for commit message scopes:
- Valid scopes (client, server, api, ui, auth, db)
- Empty scopes

## Commit Message Format

The tests validate against the conventional commit format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance tasks
- `revert` - Reverting changes

### Rules
- Type is required
- Description is required
- Description should be lowercase
- Description should not end with a period
- Breaking changes can be indicated with `!` after type/scope

## Examples

**Valid:**
```
feat: add user authentication
fix(client): resolve login button styling
docs: update API documentation
feat!: breaking change in API
```

**Invalid:**
```
Add user authentication          # Missing type
invalid: add feature            # Invalid type
feat add feature               # Missing colon
feat:                         # Missing description
feat: Add feature             # Uppercase description
feat: add feature.            # Trailing period
```
