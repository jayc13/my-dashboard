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
COMMITLINT_CONFIG="${COMMITLINT_CONFIG:-./scripts/commitlint.config.js}"

if [ -z "$PR_TITLE" ]; then
  echo -e "${RED}❌ PR title not provided${NC}"
  exit 1
fi

echo -e "${CYAN}🔍 Validating PR title format...${NC}"
echo -e "${BLUE}PR Title: ${PR_TITLE}${NC}"

# Validate PR title with commitlint
if echo "$PR_TITLE" | npx commitlint --config="$COMMITLINT_CONFIG" --verbose; then
  echo -e "${GREEN}✅ PR title is valid.${NC}"
else
  echo -e "${RED}❌ PR title does not conform to conventional commit standards.${NC}"
  echo ""
  echo -e "${YELLOW}💡 PR title should follow the format: type(scope): description${NC}"
  echo "Examples:"
  echo "  feat(client): add user authentication"
  echo "  fix(server): resolve memory leak issue"
  echo "  docs: update API documentation"
  echo ""
  echo "Run 'npm run commit-help' for more examples."
  exit 1
fi
