#!/bin/bash

# Commit Validation Script
# Validates all commits in a PR using commitlint

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_SHA="$1"
HEAD_SHA="$2"
COMMITLINT_CONFIG="${COMMITLINT_CONFIG:-./scripts/commitlint.config.js}"
COMMENT_KEY="commit-validation"
PR_COMMENT_SCRIPT="$(dirname "$0")/pr-comment.sh"

if [ -z "$BASE_SHA" ] || [ -z "$HEAD_SHA" ]; then
  echo -e "${RED}❌ Base SHA and Head SHA must be provided${NC}"
  echo "Usage: $0 <base_sha> <head_sha>"
  exit 1
fi

echo -e "${CYAN}🔍 Validating PR commits with commitlint...${NC}"
echo -e "${BLUE}Base SHA: $BASE_SHA${NC}"
echo -e "${BLUE}Head SHA: $HEAD_SHA${NC}"

# Validate commits with commitlint (run from scripts directory to access dependencies)
if (cd "$(dirname "$0")/.." && npx commitlint --config="./commitlint.config.js" --from "$BASE_SHA" --to "$HEAD_SHA" --verbose); then
  echo -e "${GREEN}✅ All commits are valid.${NC}"

  # Remove any existing commit validation comment by posting empty comment
  if [ -f "$PR_COMMENT_SCRIPT" ] && [ -n "$PR_NUMBER" ]; then
    echo -e "${BLUE}Removing commit validation comment...${NC}"
    "$PR_COMMENT_SCRIPT" "$COMMENT_KEY" "" 2>/dev/null || true
  fi
else
  echo -e "${RED}❌ One or more commits do not conform to conventional commit standards.${NC}"

  # Create failure comment body
  FAILURE_COMMENT="## ❌ Commit Validation Failed

One or more commits do not conform to conventional commit standards.

### 💡 How to fix this:

Commit messages should follow the format: \`type(scope): description\`

**Examples:**
- \`feat(auth): add OAuth2 integration\`
- \`fix: resolve memory leak in data processing\`
- \`docs(api): update endpoint documentation\`

Run \`npm run commit-help\` for more examples.

---
*This comment will be automatically removed when all commits pass validation.*"

  # Post failure comment to PR
  if [ -f "$PR_COMMENT_SCRIPT" ] && [ -n "$PR_NUMBER" ]; then
    echo -e "${BLUE}Adding commit validation failure comment to PR...${NC}"
    "$PR_COMMENT_SCRIPT" "$COMMENT_KEY" "$FAILURE_COMMENT" || echo -e "${YELLOW}⚠️ Failed to post PR comment${NC}"
  fi

  exit 1
fi
