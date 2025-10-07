#!/bin/bash

# Bundle Size Validation Script
# Validates bundle size changes against thresholds

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
MAX_SIZE_INCREASE=${MAX_SIZE_INCREASE:-524288}  # 512KB in bytes
MAX_PERCENT_INCREASE=${MAX_PERCENT_INCREASE:-10}  # 10% increase

echo -e "${CYAN}⚖️ Validating bundle size changes...${NC}"

TOTAL_DIFF=$(cat bundle-size-diff.txt)
TOTAL_PERCENT=$(cat bundle-size-percent.txt)
CURRENT_TOTAL_SIZE=$(cat current-bundle-size.txt)

# Check if bundle size increased significantly
SHOULD_FAIL=false

if [ $TOTAL_DIFF -gt $MAX_SIZE_INCREASE ]; then
  echo -e "${RED}❌ Bundle size increased by more than $(numfmt --to=iec-i --suffix=B $MAX_SIZE_INCREASE)${NC}"
  SHOULD_FAIL=true
fi

# Check percentage increase (only if we have a valid percentage)
if [ "$TOTAL_PERCENT" != "N/A" ] && [ -n "$TOTAL_PERCENT" ]; then
  PERCENT_INT=$(echo "$TOTAL_PERCENT" | cut -d'.' -f1)
  # Only compare if PERCENT_INT is not empty and is a valid number
  if [ -n "$PERCENT_INT" ] && [ "$PERCENT_INT" -gt $MAX_PERCENT_INCREASE ] 2>/dev/null; then
    echo -e "${RED}❌ Bundle size increased by more than ${MAX_PERCENT_INCREASE}% (${TOTAL_PERCENT}%)${NC}"
    SHOULD_FAIL=true
  fi
fi

if [ "$SHOULD_FAIL" = true ]; then
  echo ""
  echo -e "${RED}🚨 Bundle size increase is too large!${NC}"
  echo "Please consider:"
  echo "  • Code splitting to reduce initial bundle size"
  echo "  • Lazy loading of components and routes"
  echo "  • Tree shaking to remove unused code"
  echo "  • Analyzing dependencies with 'npm run build -- --analyze'"
  echo "  • Using dynamic imports for large libraries"
  echo ""
  exit 1
elif [ "$TOTAL_PERCENT" = "N/A" ]; then
  echo -e "${BLUE}ℹ️ No main branch comparison available (new client feature)${NC}"
  echo "Current bundle size: $(numfmt --to=iec-i --suffix=B $CURRENT_TOTAL_SIZE)"
  echo "Consider monitoring bundle size in future PRs"
elif [ $TOTAL_DIFF -gt 0 ]; then
  echo -e "${YELLOW}⚠️ Bundle size increased but within acceptable limits${NC}"
  echo "Consider monitoring this change and optimizing if possible"
elif [ $TOTAL_DIFF -lt 0 ]; then
  echo -e "${GREEN}✅ Bundle size decreased - great optimization!${NC}"
else
  echo -e "${GREEN}✅ Bundle size unchanged${NC}"
fi

# Clean up temporary files
rm -f current-bundle-size.txt current-js-size.txt current-css-size.txt
rm -f bundle-size-diff.txt bundle-size-percent.txt

echo -e "${GREEN}✅ Bundle validation complete!${NC}"
