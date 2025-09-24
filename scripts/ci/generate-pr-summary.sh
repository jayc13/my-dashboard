#!/bin/bash

# PR Summary Generation Script
# Generates a formatted summary message for PR validation results
# Usage: generate-pr-summary.sh <basic> <packages-types> <packages-sdk> <client> <server> <cron> <scripts> <tests-integration> <tests-e2e> <docs> <integration> <e2e> [test-results]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Validation results (passed as arguments)
BASIC_VALIDATION="${1:-skipped}"
PACKAGES_TYPES_VALIDATION="${2:-skipped}"
PACKAGES_SDK_VALIDATION="${3:-skipped}"
CLIENT_VALIDATION="${4:-skipped}"
SERVER_VALIDATION="${5:-skipped}"
CRON_VALIDATION="${6:-skipped}"
SCRIPTS_VALIDATION="${7:-skipped}"
TESTS_INTEGRATION_VALIDATION="${8:-skipped}"
TESTS_E2E_VALIDATION="${9:-skipped}"
DOCS_VALIDATION="${10:-skipped}"
INTEGRATION_TESTING="${11:-skipped}"
E2E_TESTING="${12:-skipped}"

# Test results (optional 13th argument)
TEST_RESULTS="${13:-}"

# Required environment variables for links
GITHUB_SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY}"
GITHUB_RUN_ID="${GITHUB_RUN_ID}"
PR_NUMBER="${PR_NUMBER}"

# Function to get status emoji and text
get_status_display() {
    local status="$1"
    case "$status" in
        "success")
            echo "✅ Passed"
            ;;
        "failure")
            echo "❌ Failed"
            ;;
        "cancelled")
            echo "⏹️ Cancelled"
            ;;
        "skipped")
            echo "⏭️ Skipped"
            ;;
        *)
            echo "❓ Unknown"
            ;;
    esac
}

# Function to get overall status
get_overall_status() {
    local statuses=("$@")
    local has_failure=false
    local has_success=false
    
    for status in "${statuses[@]}"; do
        if [[ "$status" == "failure" ]]; then
            has_failure=true
        elif [[ "$status" == "success" ]]; then
            has_success=true
        fi
    done
    
    if [[ "$has_failure" == true ]]; then
        echo "failure"
    elif [[ "$has_success" == true ]]; then
        echo "success"
    else
        echo "skipped"
    fi
}

# Get overall status
OVERALL_STATUS=$(get_overall_status "$BASIC_VALIDATION" "$PACKAGES_TYPES_VALIDATION" "$PACKAGES_SDK_VALIDATION" "$CLIENT_VALIDATION" "$SERVER_VALIDATION" "$CRON_VALIDATION" "$SCRIPTS_VALIDATION" "$TESTS_INTEGRATION_VALIDATION" "$TESTS_E2E_VALIDATION" "$DOCS_VALIDATION" "$INTEGRATION_TESTING" "$E2E_TESTING")

# Build comment body
COMMENT_BODY="## 🔍 Pull Request Validation Results

"

# Add overall status header
if [[ "$OVERALL_STATUS" == "success" ]]; then
    COMMENT_BODY+="### ✅ All validations passed!

"
elif [[ "$OVERALL_STATUS" == "failure" ]]; then
    COMMENT_BODY+="### ❌ Some validations failed

"
else
    COMMENT_BODY+="### ⏭️ Validations skipped or incomplete

"
fi

# Add detailed results
COMMENT_BODY+="| Validation | Status |
|------------|--------|
| **Basic Validation** | $(get_status_display "$BASIC_VALIDATION") |
| **Packages Types** | $(get_status_display "$PACKAGES_TYPES_VALIDATION") |
| **Packages SDK** | $(get_status_display "$PACKAGES_SDK_VALIDATION") |
| **Client Validation** | $(get_status_display "$CLIENT_VALIDATION") |
| **Server Validation** | $(get_status_display "$SERVER_VALIDATION") |
| **Cron Validation** | $(get_status_display "$CRON_VALIDATION") |
| **Scripts Validation** | $(get_status_display "$SCRIPTS_VALIDATION") |
| **Tests Integration** | $(get_status_display "$TESTS_INTEGRATION_VALIDATION") |
| **Tests E2E** | $(get_status_display "$TESTS_E2E_VALIDATION") |
| **Documentation Validation** | $(get_status_display "$DOCS_VALIDATION") |
| **Integration Testing** | $(get_status_display "$INTEGRATION_TESTING") |
| **E2E Testing** | $(get_status_display "$E2E_TESTING") |

"

# Add test results section if provided
if [[ -n "$TEST_RESULTS" ]]; then
    COMMENT_BODY+="### 🧪 Test Results

\`\`\`
$TEST_RESULTS
\`\`\`

"
fi

# Add links to failed checks
COMMENT_BODY+="### 🔗 Useful Links

- [View workflow run](${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID})
- [View all checks](${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/pull/${PR_NUMBER}/checks)

"

# Add suggestions for failed validations
if [[ "$OVERALL_STATUS" == "failure" ]]; then
    COMMENT_BODY+="### 💡 Suggestions

"
    
    if [[ "$BASIC_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Basic Validation Failed**: Check PR title format, commit messages, and TODO/FIXME comments
"
    fi

    if [[ "$PACKAGES_TYPES_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Packages Types Failed**: Review TypeScript types, build process, and type definitions
"
    fi

    if [[ "$PACKAGES_SDK_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Packages SDK Failed**: Review SDK code, dependencies on types package, and exports
"
    fi

    if [[ "$CLIENT_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Client Validation Failed**: Review client-side code, tests, and build process
"
    fi
    
    if [[ "$SERVER_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Server Validation Failed**: Review server-side code, tests, and API endpoints
"
    fi
    
    if [[ "$CRON_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Cron Validation Failed**: Review scheduled job configurations and scripts
"
    fi
    
    if [[ "$SCRIPTS_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Scripts Validation Failed**: Review utility scripts and their tests
"
    fi

    if [[ "$TESTS_INTEGRATION_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Tests Integration Failed**: Review integration test structure, dependencies, and configuration
"
    fi

    if [[ "$TESTS_E2E_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Tests E2E Failed**: Review E2E test structure, Playwright configuration, and test syntax
"
    fi

    if [[ "$DOCS_VALIDATION" == "failure" ]]; then
        COMMENT_BODY+="- **Documentation Validation Failed**: Review markdown files, OpenAPI specs, and documentation structure
"
    fi

    if [[ "$INTEGRATION_TESTING" == "failure" ]]; then
        COMMENT_BODY+="- **Integration Testing Failed**: Review integration test setup and dependencies
"
    fi
    
    if [[ "$E2E_TESTING" == "failure" ]]; then
        COMMENT_BODY+="- **E2E Testing Failed**: Review end-to-end test scenarios and environment setup
"
    fi
    
    COMMENT_BODY+="
Please address the failed validations and push new commits to re-trigger the checks.
"
fi

COMMENT_BODY+="
---
*This comment was automatically generated by the PR validation workflow.*"

# Output the generated comment body
echo "$COMMENT_BODY"

echo -e "${GREEN}✅ PR summary generated successfully!${NC}" >&2
