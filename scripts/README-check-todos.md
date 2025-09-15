# TODO/FIXME Comment Detection Script

## Overview

The `check-todos.sh` script is a comprehensive tool for detecting and analyzing TODO and FIXME comments in your codebase. It's designed to help maintain code quality by tracking technical debt and ensuring important tasks don't get forgotten.

## Features

### 🔍 Smart Comment Detection
- **Language-aware parsing**: Recognizes comment syntax for different file types
- **False positive filtering**: Avoids matching variable names or class names
- **Multiple comment styles**: Supports `//`, `#`, `/* */`, and `<!-- -->` comments

### 📊 Comprehensive Analysis
- **Total comment count**: Shows overall TODO/FIXME comments in codebase
- **PR-specific detection**: Identifies new comments added in current PR
- **Complex TODO identification**: Flags TODOs that might warrant GitHub issues
- **Detailed reporting**: Shows file locations and line numbers

### 🎯 Supported File Types
- **JavaScript/TypeScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **Python**: `.py`
- **Shell scripts**: `.sh`
- **YAML**: `.yml`, `.yaml`
- **Markdown**: `.md`
- **JSON**: `.json`
- **And more**: Extensible pattern matching

## Usage

### Local Development
```bash
# Run from project root
./scripts/check-todos.sh
```

### GitHub Actions
The script is automatically integrated into the PR validation workflow:
```yaml
- name: Check for TODO and FIXME comments
  run: |
    ./scripts/check-todos.sh
```

## Configuration

### Scan Directories
The script scans these directories by default:
- `client/src`
- `server/src`
- `cron/src`
- `scripts`
- `.github`
- `docs`

### File Extensions
Supported extensions:
- `ts`, `tsx`, `js`, `jsx`
- `sh`, `yml`, `yaml`
- `md`, `json`

### Excluded Patterns
The script automatically excludes:
- **Directories**: `node_modules`, `dist`, `build`, `coverage`, `data`, `.git`
- **Specific Files**: See ignore list below

### Ignored Files
The script ignores specific files that may contain TODO/FIXME as part of their functionality:
- `scripts/check-todos.sh` - The script itself
- `scripts/README-check-todos.md` - Documentation
- `.github/workflows/pr-validation.yml` - Main workflow file
- `.github/workflows/*.yml` - Workflow template files
- Lock files: `package-lock.json`, `yarn.lock`, `composer.lock`, etc.
- Log and temporary files: `*.log`, `*.tmp`, `*.temp`
- Test files with TODO examples: `**/test-todos.*`, `**/todo-test.*`

## Output Examples

### TODO Comments
```
📋 TODO Comments:
==================
Found TODO comments in server/src/service.ts:
  Line 15: // TODO: Implement caching for better performance
  Line 23: /* TODO: Add input validation */
```

### FIXME Comments
```
🔧 FIXME Comments:
===================
Found FIXME comments in client/src/component.tsx:
  Line 42: // FIXME: Memory leak in useEffect cleanup
    ↳ NEW in this PR
```

### Complex TODOs
```
💡 Complex TODOs that might warrant GitHub issues:
==================================================
📄 server/src/auth.ts:
  Line 67: // TODO: Implement OAuth2 integration
  Line 89: // TODO: Add security audit logging
```

### Summary Report
```
📊 Summary Report:
==================
Total TODO comments found: 23
Total FIXME comments found: 5
New TODO comments in this PR: 3
New FIXME comments in this PR: 1
Complex TODOs (consider creating issues): 8
```

## Recommendations

### 🚨 FIXME Comments
- **High Priority**: Address FIXME comments before merging
- **New FIXMEs**: Consider if they can be resolved immediately
- **Threshold**: More than 10 FIXMEs suggests technical debt issues

### 📝 TODO Comments
- **Moderate Priority**: Plan TODO items in upcoming sprints
- **Complex TODOs**: Create GitHub issues for substantial work
- **Threshold**: More than 50 TODOs suggests need for cleanup

### 💡 Best Practices
1. **Be Specific**: Write clear, actionable TODO comments
2. **Add Context**: Include why the TODO is needed
3. **Set Priorities**: Use FIXME for urgent issues, TODO for future work
4. **Create Issues**: Convert complex TODOs to GitHub issues
5. **Regular Cleanup**: Schedule periodic TODO review sessions

## Integration with Development Workflow

### Pre-commit Hooks
Add to your pre-commit workflow:
```bash
# In .husky/pre-commit
./scripts/check-todos.sh
```

### IDE Integration
Most IDEs highlight TODO/FIXME comments automatically. This script complements IDE features by providing:
- Project-wide analysis
- PR-specific tracking
- Automated reporting
- CI/CD integration

## Troubleshooting

### Common Issues

**Script not executable**:
```bash
chmod +x ./scripts/check-todos.sh
```

**Git repository not found**:
- The script works without git but won't detect PR-specific changes
- Ensure you're running from the project root

**No comments found**:
- Check that scan directories exist
- Verify file extensions are supported
- Ensure comments use proper syntax

### Customization

**Modify scan directories:**
```bash
SCAN_DIRS=("client/src" "server/src" "your-custom-dir")
```

**Add file extensions:**
```bash
EXTENSIONS=("ts" "tsx" "js" "jsx" "your-extension")
```

**Customize ignored files:**
```bash
IGNORE_FILES=(
    "scripts/check-todos.sh"
    "your-custom-file.js"
    "docs/todo-examples.md"
    "*.generated.ts"
)
```

**Ignore patterns support:**
- Exact file paths: `"scripts/check-todos.sh"`
- Glob patterns: `"*.log"`, `"**/test-*.js"`
- Relative paths from project root

## Contributing

When adding new features to the script:
1. Test with various comment styles
2. Ensure false positive filtering works
3. Update documentation
4. Add appropriate error handling
5. Maintain backward compatibility
