# CI Scripts

This directory contains external scripts used by GitHub Actions workflows for validation and analysis tasks.

## 📜 Scripts Overview

### Bundle Analysis Scripts

#### `bundle-analysis.sh`
Analyzes the current bundle size and composition.

**Features:**
- Installs bundle analyzer dependencies
- Builds the project with analysis
- Generates detailed size statistics
- Creates bundle composition report
- Stores results for comparison

**Usage:**
```bash
cd client
../scripts/ci/bundle-analysis.sh
```

**Environment Variables:**
- `BUILD_COMMAND`: Build command to run (default: `npm run build`)

#### `bundle-comparison.sh`
Compares current bundle size with the main branch.

**Features:**
- Fetches and builds main branch version
- Calculates size differences
- Computes percentage changes
- Handles cases where main branch has no client build
- Stores comparison results

**Usage:**
```bash
cd client
../scripts/ci/bundle-comparison.sh
```

**Environment Variables:**
- `WORKING_DIR`: Working directory (default: `./client`)
- `BUILD_COMMAND`: Build command to run (default: `npm run build`)

#### `bundle-validation.sh`
Validates bundle size changes against configured thresholds.

**Features:**
- Checks absolute size increase limits
- Validates percentage increase limits
- Provides actionable recommendations
- Fails CI if thresholds exceeded
- Cleans up temporary files

**Usage:**
```bash
cd client
../scripts/ci/bundle-validation.sh
```

**Environment Variables:**
- `MAX_SIZE_INCREASE`: Maximum size increase in bytes (default: 524288 = 512KB)
- `MAX_PERCENT_INCREASE`: Maximum percentage increase (default: 10)

### PR Validation Scripts

#### `pr-title-validation.sh`
Validates PR title format using commitlint.

**Features:**
- Uses conventional commit format validation
- Provides helpful error messages
- Shows examples of correct formats
- References commit help documentation

**Usage:**
```bash
./scripts/ci/pr-title-validation.sh "feat(client): add new feature"
```

**Arguments:**
1. PR title to validate

**Environment Variables:**
- `COMMITLINT_CONFIG`: Path to commitlint config (default: `./scripts/commitlint.config.js`)

#### `pr-complexity-analysis.sh`
Analyzes PR complexity based on changed files and lines.

**Features:**
- Counts changed files and lines
- Provides complexity assessment
- Gives recommendations based on size
- Shows file type breakdown
- Helps identify large PRs that should be split

**Usage:**
```bash
./scripts/ci/pr-complexity-analysis.sh
```

**Environment Variables:**
- `BASE_BRANCH`: Base branch for comparison (default: `origin/main`)

#### `commit-validation.sh`
Validates all commit messages in a PR using commitlint.

**Features:**
- Validates all commits in PR range
- Uses conventional commit standards
- Provides detailed error messages
- Shows examples and help references

**Usage:**
```bash
./scripts/ci/commit-validation.sh <base_sha> <head_sha>
```

**Arguments:**
1. Base commit SHA
2. Head commit SHA

**Environment Variables:**
- `COMMITLINT_CONFIG`: Path to commitlint config (default: `./scripts/commitlint.config.js`)

## 🎨 Output Formatting

All scripts use consistent color-coded output:
- 🔴 **Red**: Errors and failures
- 🟢 **Green**: Success messages
- 🟡 **Yellow**: Warnings and recommendations
- 🔵 **Blue**: Information and progress
- 🟣 **Purple**: Special highlights
- 🔵 **Cyan**: Section headers

## 🔧 Error Handling

All scripts follow consistent error handling patterns:
- Exit with code 1 on validation failures
- Exit with code 0 on success
- Provide clear error messages with actionable advice
- Clean up temporary files on exit
- Use `set -e` for fail-fast behavior

## 🧪 Testing

These scripts can be tested independently:

```bash
# Test bundle analysis (requires built client)
cd client && npm run build
../scripts/ci/bundle-analysis.sh

# Test PR title validation
./scripts/ci/pr-title-validation.sh "feat: add new feature"
./scripts/ci/pr-title-validation.sh "invalid title"  # Should fail

# Test commit validation (requires git history)
./scripts/ci/commit-validation.sh HEAD~3 HEAD

# Test complexity analysis (requires git history)
./scripts/ci/pr-complexity-analysis.sh
```

## 📝 Adding New Scripts

When adding new CI scripts:

1. Place them in `scripts/ci/`
2. Make them executable: `chmod +x script-name.sh`
3. Use consistent error handling and output formatting
4. Add environment variable configuration
5. Include usage documentation
6. Add to this README
7. Test independently before integrating

## 🔗 Integration

These scripts are called by:
- Composite actions in `.github/actions/`
- Reusable workflows in `.github/workflows/`
- Main PR validation workflow

See `.github/workflows/README.md` for the complete architecture overview.
