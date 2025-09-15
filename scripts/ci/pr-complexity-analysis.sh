#!/bin/bash

# PR Complexity Analysis Script
# Analyzes PR complexity based on changed files and lines

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_BRANCH="${BASE_BRANCH:-origin/main}"

# Required environment variables for PR commenting
GITHUB_TOKEN="${GITHUB_TOKEN}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY}"
PR_NUMBER="${PR_NUMBER}"

echo -e "${CYAN}📊 Estimating PR complexity...${NC}"

# Count changed files and lines
CHANGED_FILES=$(git diff --name-only $BASE_BRANCH...HEAD | wc -l)
ADDED_LINES=$(git diff --numstat $BASE_BRANCH...HEAD | awk '{sum += $1} END {print sum}')
DELETED_LINES=$(git diff --numstat $BASE_BRANCH...HEAD | awk '{sum += $2} END {print sum}')

echo -e "${BLUE}Changed files: $CHANGED_FILES${NC}"
echo -e "${BLUE}Added lines: $ADDED_LINES${NC}"
echo -e "${BLUE}Deleted lines: $DELETED_LINES${NC}"

# Generate file type breakdown
FILE_BREAKDOWN=$(git diff --name-only $BASE_BRANCH...HEAD | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -10)

# Build the complexity comment message
COMMENT_BODY="## 📊 PR Complexity Analysis

### 📈 Statistics
- **Changed files:** $CHANGED_FILES
- **Added lines:** $ADDED_LINES
- **Deleted lines:** $DELETED_LINES
- **Net change:** $((ADDED_LINES - DELETED_LINES)) lines

"

# Determine complexity level and add assessment
if [[ $CHANGED_FILES -gt 20 ]] || [[ $ADDED_LINES -gt 500 ]]; then
  echo -e "${YELLOW}⚠️ Large PR detected - consider breaking into smaller PRs${NC}"
  COMMENT_BODY+="### ⚠️ Large PR Detected

This is a **large PR** that may be challenging to review effectively.

**Recommendations:**
- Split into logical, smaller changes
- Consider feature flags for incremental rollout
- Ensure comprehensive testing
- Add detailed description of changes

"
elif [[ $CHANGED_FILES -gt 10 ]] || [[ $ADDED_LINES -gt 200 ]]; then
  echo -e "${BLUE}📏 Medium-sized PR - ensure good test coverage${NC}"
  COMMENT_BODY+="### 📏 Medium-sized PR

This PR has a **moderate complexity** level.

**Recommendations:**
- Add comprehensive tests for new functionality
- Consider adding integration tests
- Ensure good documentation for new features

"
else
  echo -e "${GREEN}✅ Small PR - good size for review${NC}"
  COMMENT_BODY+="### ✅ Small PR

This PR has an **optimal size** for code review and testing.

**Benefits:**
- Easy to review and understand
- Lower risk of introducing bugs
- Faster feedback cycle

"
fi

# Add file type breakdown
COMMENT_BODY+="### 📋 File Type Breakdown

\`\`\`
$FILE_BREAKDOWN
\`\`\`

---
*This analysis was automatically generated based on the changes in this PR.*"

# Post the comment if we have the required environment variables
if [[ -n "$GITHUB_TOKEN" && -n "$GITHUB_REPOSITORY" && -n "$PR_NUMBER" ]]; then
    echo -e "${CYAN}💬 Posting complexity analysis to PR...${NC}"

    # Get the script directory to find pr-comment.sh
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    # Call pr-comment.sh with the complexity analysis
    COMMENT_ID="pr-complexity-analysis"
    bash "$SCRIPT_DIR/pr-comment.sh" "$COMMENT_ID" "$COMMENT_BODY"
else
    echo -e "${YELLOW}⚠️ Missing environment variables for PR commenting. Skipping comment posting.${NC}"
    echo -e "${BLUE}Generated comment content:${NC}"
    echo "$COMMENT_BODY"
fi
