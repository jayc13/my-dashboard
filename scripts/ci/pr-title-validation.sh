#!/bin/bash

# PR Title Validation Script
# Validates PR title format using commitlint

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PR_TITLE="$1"
COMMENT_KEY="pr-title-validation"
PR_COMMENT_SCRIPT="$(dirname "$0")/pr-comment.sh"

if [ -z "$PR_TITLE" ]; then
  echo -e "${RED}❌ PR title not provided${NC}"
  exit 1
fi

echo -e "${CYAN}🔍 Validating PR title format...${NC}"
echo -e "${BLUE}PR Title: ${PR_TITLE}${NC}"

# Validate PR title with commitlint (run from scripts directory to access dependencies)
if echo "$PR_TITLE" | (cd "$(dirname "$0")/.." && npx commitlint --config="./commitlint.config.js" --verbose); then
  echo -e "${GREEN}✅ PR title is valid.${NC}"

  # Remove any existing PR title validation comment by posting empty comment
  if [ -f "$PR_COMMENT_SCRIPT" ] && [ -n "$PR_NUMBER" ]; then
    echo -e "${BLUE}Removing PR title validation comment...${NC}"
    "$PR_COMMENT_SCRIPT" "$COMMENT_KEY" "" 2>/dev/null || true
  fi
else
  echo -e "${RED}❌ PR title does not conform to conventional commit standards.${NC}"

  # Create failure comment body
  FAILURE_COMMENT="## ❌ PR Title Validation Failed

The PR title does not conform to conventional commit standards.

**Current PR Title:** \`${PR_TITLE}\`

### 💡 How to fix this:

PR title should follow the format: \`type(scope): description\`

**Examples:**
- \`feat(client): add user authentication\`
- \`fix(server): resolve memory leak issue\`
- \`docs: update API documentation\`

Run \`npm run commit-help\` for more examples.

---
*This comment will be automatically removed when the PR title passes validation.*"

  # Post failure comment to PR
  if [ -f "$PR_COMMENT_SCRIPT" ] && [ -n "$PR_NUMBER" ]; then
    echo -e "${BLUE}Adding PR title validation failure comment to PR...${NC}"
    "$PR_COMMENT_SCRIPT" "$COMMENT_KEY" "$FAILURE_COMMENT" || echo -e "${YELLOW}⚠️ Failed to post PR comment${NC}"
  fi

  exit 1
fi
