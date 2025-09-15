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

echo -e "${CYAN}📊 Estimating PR complexity...${NC}"

# Count changed files and lines
CHANGED_FILES=$(git diff --name-only $BASE_BRANCH...HEAD | wc -l)
ADDED_LINES=$(git diff --numstat $BASE_BRANCH...HEAD | awk '{sum += $1} END {print sum}')
DELETED_LINES=$(git diff --numstat $BASE_BRANCH...HEAD | awk '{sum += $2} END {print sum}')

echo -e "${BLUE}Changed files: $CHANGED_FILES${NC}"
echo -e "${BLUE}Added lines: $ADDED_LINES${NC}"
echo -e "${BLUE}Deleted lines: $DELETED_LINES${NC}"

# Provide complexity assessment
if [[ $CHANGED_FILES -gt 20 ]] || [[ $ADDED_LINES -gt 500 ]]; then
  echo -e "${YELLOW}⚠️ Large PR detected - consider breaking into smaller PRs${NC}"
  echo "Recommendations:"
  echo "  • Split into logical, smaller changes"
  echo "  • Consider feature flags for incremental rollout"
  echo "  • Ensure comprehensive testing"
elif [[ $CHANGED_FILES -gt 10 ]] || [[ $ADDED_LINES -gt 200 ]]; then
  echo -e "${BLUE}📏 Medium-sized PR - ensure good test coverage${NC}"
  echo "Recommendations:"
  echo "  • Add comprehensive tests for new functionality"
  echo "  • Consider adding integration tests"
else
  echo -e "${GREEN}✅ Small PR - good size for review${NC}"
  echo "This PR size is optimal for code review and testing."
fi

# Additional analysis
echo ""
echo -e "${BLUE}📋 File type breakdown:${NC}"
git diff --name-only $BASE_BRANCH...HEAD | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -10
