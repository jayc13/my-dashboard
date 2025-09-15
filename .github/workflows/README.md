# GitHub Actions Workflows

This directory contains modular GitHub Actions workflows for the Cypress Dashboard project. The workflows have been refactored for better maintainability, reusability, and testing.

## 🏗️ Architecture Overview

The PR validation system is now built using a modular architecture:

```
.github/
├── actions/                    # Reusable composite actions
│   ├── setup-node/            # Node.js setup with caching
│   ├── setup-validation/      # Basic validation environment
│   └── bundle-analysis/       # Bundle size analysis
├── workflows/                 # Workflow definitions
│   ├── pr-validation.yml      # Main orchestrator workflow
│   ├── basic-validation.yml   # Basic PR validation
│   ├── validate-client.yml    # Client-specific validation
│   ├── validate-server.yml    # Server-specific validation
│   ├── validate-cron.yml      # Cron job validation
│   └── validate-scripts.yml   # Scripts validation
└── scripts/ci/                # External validation scripts
    ├── bundle-analysis.sh     # Bundle size analysis
    ├── bundle-comparison.sh   # Bundle size comparison
    ├── bundle-validation.sh   # Bundle size validation
    ├── pr-title-validation.sh # PR title validation
    ├── pr-complexity-analysis.sh # PR complexity analysis
    └── commit-validation.sh   # Commit message validation
```

## 🚀 Main Workflow: pr-validation.yml

The main workflow orchestrates all validation jobs:

1. **Basic Validation** - Validates commits, PR title, detects changes
2. **Client Validation** - Runs when client files change
3. **Server Validation** - Runs when server files change  
4. **Cron Validation** - Runs when cron files change
5. **Scripts Validation** - Runs when script files change
6. **Validation Summary** - Aggregates results and provides summary

### Triggers
- Pull requests to `main` or `develop` branches
- Types: `opened`, `synchronize`, `reopened`, `ready_for_review`
- Only runs for non-draft PRs

## 🔧 Reusable Workflows

### basic-validation.yml
Handles fundamental PR validation:
- Commit message validation using commitlint
- PR title validation
- Change detection (which components changed)
- TODO/FIXME comment analysis
- PR complexity analysis

**Inputs:**
- `pr-title`: PR title to validate
- `base-sha`: Base commit SHA
- `head-sha`: Head commit SHA

**Outputs:**
- `client-changed`: Boolean indicating client changes
- `server-changed`: Boolean indicating server changes
- `cron-changed`: Boolean indicating cron changes
- `scripts-changed`: Boolean indicating scripts changes
- `github-changed`: Boolean indicating GitHub workflow changes

### validate-client.yml
Validates the React frontend:
- ESLint linting
- TypeScript type checking
- Build verification
- Unit tests
- Bundle size analysis and validation

**Inputs:**
- `working-directory`: Client directory (default: `./client`)
- `node-version`: Node.js version (default: `v22.16.0`)
- `run-bundle-analysis`: Enable bundle analysis (default: `true`)

### validate-server.yml
Validates the Node.js backend:
- TypeScript type checking
- ESLint linting
- Build verification
- Database migration testing
- Unit tests with MySQL service

**Inputs:**
- `working-directory`: Server directory (default: `./server`)
- `node-version`: Node.js version (default: `v22.16.0`)

### validate-cron.yml
Validates cron job services:
- TypeScript type checking
- ESLint linting
- Build verification
- Cron configuration validation

**Inputs:**
- `working-directory`: Cron directory (default: `./cron`)
- `node-version`: Node.js version (default: `v22.16.0`)

### validate-scripts.yml
Validates utility scripts:
- Script syntax validation
- Shellcheck for shell scripts
- Node.js script validation

**Inputs:**
- `working-directory`: Scripts directory (default: `./scripts`)
- `node-version`: Node.js version (default: `v22.16.0`)

## 🎭 Composite Actions

### setup-node
Standardized Node.js setup with caching:
- Sets up specified Node.js version
- Configures npm cache
- Optionally installs dependencies
- Supports custom registry

### setup-validation
Basic validation environment setup:
- Sets up Node.js for validation tools (v22.16.0)
- Installs commitlint and conventional commit tools
- Configurable commitlint installation

### bundle-analysis
Comprehensive bundle size analysis:
- Installs bundle analyzer
- Runs build with analysis
- Generates size reports
- Calls external analysis scripts

## 📜 External Scripts

All complex bash logic has been moved to external scripts in `scripts/ci/`:

- **bundle-analysis.sh**: Analyzes current bundle size
- **bundle-comparison.sh**: Compares with main branch
- **bundle-validation.sh**: Validates against thresholds
- **pr-title-validation.sh**: Validates PR title format
- **pr-complexity-analysis.sh**: Analyzes PR complexity
- **commit-validation.sh**: Validates commit messages

## 🔄 Benefits of Refactoring

1. **Maintainability**: Logic is separated into focused, single-purpose files
2. **Reusability**: Composite actions and workflows can be reused
3. **Testability**: External scripts can be tested independently
4. **Readability**: Main workflow is now 90 lines vs 502 lines
5. **Modularity**: Easy to add/remove/modify individual validation steps
6. **Debugging**: Easier to identify and fix issues in specific components

## 🚦 Usage Examples

### Using reusable workflows in other repositories:
```yaml
jobs:
  validate-client:
    uses: ./.github/workflows/validate-client.yml
    with:
      working-directory: './frontend'
      node-version: 'v22.16.0'
      run-bundle-analysis: false
```

### Using composite actions:
```yaml
steps:
  - name: Setup Node.js
    uses: ./.github/actions/setup-node
    with:
      node-version: 'v22.16.0'
      working-directory: './my-app'
```

## 🔧 Configuration

### Bundle Size Thresholds
Configure in composite action or environment variables:
- `MAX_SIZE_INCREASE`: Maximum size increase in bytes (default: 512KB)
- `MAX_PERCENT_INCREASE`: Maximum percentage increase (default: 10%)

### Commitlint Configuration
Located at `scripts/commitlint.config.js`

## 📝 Future Enhancements

- Add PR commenting with detailed results
- Implement security scanning
- Add performance testing
- Create deployment workflows
- Add notification integrations
