# HNVM pnpm Configuration

This document explains how to resolve the "No HNVM_PNPM version set" error when using HNVM (Homebrew Node Version Manager) with pnpm.

## The Error

```bash
ERROR: No HNVM_PNPM version set. Please set a pnpm version.
```

This error occurs when HNVM intercepts pnpm commands but doesn't know which pnpm version to use.

## Solutions

### Option 1: Use Project Configuration (Recommended)

The project includes a `.hnvmrc` file that specifies the pnpm version:

```bash
# .hnvmrc content
pnpm=10.17.1
```

HNVM should automatically detect and use this version. If it doesn't work immediately, try:

```bash
# Reload your shell or source your profile
source ~/.zshrc  # or ~/.bashrc
```

### Option 2: Set Environment Variable

Set the HNVM_PNPM environment variable in your shell profile:

```bash
# Add to ~/.zshrc, ~/.bashrc, or ~/.profile
export HNVM_PNPM=10.17.1

# Then reload your shell
source ~/.zshrc  # or ~/.bashrc
```

### Option 3: Use npx pnpm (Bypass HNVM)

Use `npx pnpm` instead of `pnpm` to bypass HNVM entirely:

```bash
# Instead of: pnpm install
npx pnpm install

# Instead of: pnpm run dev
npx pnpm run dev

# Instead of: pnpm run build
npx pnpm run build
```

### Option 4: Temporary Session Variable

Set the variable for the current session only:

```bash
export HNVM_PNPM=10.17.1
# Now pnpm commands will work in this session
```

## Verification

Check that pnpm is working correctly:

```bash
# Check pnpm version
pnpm --version
# Should output: 10.17.1

# Or with npx
npx pnpm --version
# Should output: 10.17.1
```

## Project Scripts Updated

All project scripts have been updated to use `npx pnpm` with correct workspace syntax to avoid HNVM issues:

- ✅ `.husky/pre-commit` - Uses `npx pnpm -r --if-present run <script>`
- ✅ `.husky/pre-push` - Uses `npx pnpm --filter=<workspace> --if-present run <script>`
- ✅ `.husky/commit-msg` - Uses `npx pnpm exec commitlint`
- ✅ `scripts/local_deploy.sh` - Uses `npx pnpm --filter=<workspace> run <script>`
- ✅ `scripts/railway-server-build.sh` - Uses `npx pnpm --filter=<workspace> run <script>`
- ✅ `scripts/railway-cron-build.sh` - Uses `npx pnpm --filter=<workspace> run <script>`
- ✅ `scripts/run-e2e-tests.sh` - Uses `npx pnpm --filter=<workspace> run <script>`

## Important: Correct pnpm Workspace Syntax

When using pnpm with workspaces, the correct syntax is:

```bash
# ✅ Correct
npx pnpm --filter=<workspace> run <script>

# ❌ Incorrect (runs script from current workspace with filter as argument)
npx pnpm run <script> --filter=<workspace>
```

Examples:
```bash
# ✅ Build packages/types
npx pnpm --filter=@my-dashboard/types run build

# ✅ Run tests in server workspace
npx pnpm --filter=server run test

# ✅ Run script across all workspaces
npx pnpm -r run build
```

## Troubleshooting

If you're still having issues:

1. **Check HNVM installation**:
   ```bash
   which pnpm
   # Should show HNVM path if HNVM is managing pnpm
   ```

2. **Check environment variables**:
   ```bash
   env | grep HNVM
   # Should show HNVM_PNPM=10.17.1
   ```

3. **Use npx as fallback**:
   ```bash
   # This always works regardless of HNVM
   npx pnpm --version
   ```

4. **Restart your terminal** after making configuration changes.

## Why This Approach?

Using `npx pnpm` is the most reliable approach because:
- ✅ Works regardless of HNVM configuration
- ✅ Uses the project's specified pnpm version
- ✅ Consistent across different development environments
- ✅ No additional setup required for new team members
