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

if [ -z "$BASE_SHA" ] || [ -z "$HEAD_SHA" ]; then
  echo -e "${RED}❌ Base SHA and Head SHA must be provided${NC}"
  echo "Usage: $0 <base_sha> <head_sha>"
  exit 1
fi

echo -e "${CYAN}🔍 Validating PR commits with commitlint...${NC}"
echo -e "${BLUE}Base SHA: $BASE_SHA${NC}"
echo -e "${BLUE}Head SHA: $HEAD_SHA${NC}"

# Validate commits with commitlint
if npx commitlint --config="$COMMITLINT_CONFIG" --from "$BASE_SHA" --to "$HEAD_SHA" --verbose; then
  echo -e "${GREEN}✅ All commits are valid.${NC}"
else
  echo -e "${RED}❌ One or more commits do not conform to conventional commit standards.${NC}"
  echo ""
  echo -e "${YELLOW}💡 Commit messages should follow the format: type(scope): description${NC}"
  echo "Examples:"
  echo "  feat(auth): add OAuth2 integration"
  echo "  fix: resolve memory leak in data processing"
  echo "  docs(api): update endpoint documentation"
  echo ""
  echo "Run 'npm run commit-help' for more examples."
  exit 1
fi
