#!/bin/bash

# Bundle Size Comparison Script
# Compares current bundle size with main branch

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
WORKING_DIR=${WORKING_DIR:-"./client"}

echo -e "${CYAN}🔍 Comparing bundle size with main branch...${NC}"

# Fetch main branch for comparison
git fetch origin main:main

cd ../

# Check if client directory exists in main branch
if git ls-tree --name-only main | grep -q '^client$'; then
  echo -e "${GREEN}client directory found in main branch. Proceeding with extraction.${NC}"
  mkdir -p $GITHUB_WORKSPACE/tmp/main-build
  echo "Attempting to archive and extract client directory from main branch..."
  git archive main | tar -x -C $GITHUB_WORKSPACE/tmp/main-build
  echo "Archive and extraction successful."
  cd $GITHUB_WORKSPACE/tmp/main-build
  npm ci --silent
  npm run build --workspace=packages/types --silent
  npm run build --workspace=client --silent
  MAIN_JS_SIZE=$(find dist/assets -name "*.js" -type f -exec wc -c {} + | tail -1 | awk '{print $1}')
  MAIN_CSS_SIZE=$(find dist/assets -name "*.css" -type f -exec wc -c {} + | tail -1 | awk '{print $1}' || echo "0")
  MAIN_TOTAL_SIZE=$((MAIN_JS_SIZE + MAIN_CSS_SIZE))
else
  echo -e "${YELLOW}client directory not found in main branch. Skipping main branch bundle size comparison.${NC}"
  MAIN_JS_SIZE=0
  MAIN_CSS_SIZE=0
  MAIN_TOTAL_SIZE=0
fi

# Return to PR branch directory
cd $GITHUB_WORKSPACE/$WORKING_DIR

# Read current sizes
CURRENT_TOTAL_SIZE=$(cat current-bundle-size.txt)
CURRENT_JS_SIZE=$(cat current-js-size.txt)
CURRENT_CSS_SIZE=$(cat current-css-size.txt)

# Calculate differences
TOTAL_DIFF=$((CURRENT_TOTAL_SIZE - MAIN_TOTAL_SIZE))
JS_DIFF=$((CURRENT_JS_SIZE - MAIN_JS_SIZE))
CSS_DIFF=$((CURRENT_CSS_SIZE - MAIN_CSS_SIZE))

# Calculate percentage changes
if [ $MAIN_TOTAL_SIZE -gt 0 ]; then
TOTAL_PERCENT=$(echo "scale=2; $TOTAL_DIFF * 100 / $MAIN_TOTAL_SIZE" | bc -l)
else
TOTAL_PERCENT="N/A"
fi

echo -e "${BLUE}📊 Bundle size comparison with main branch:${NC}"
if [ $MAIN_TOTAL_SIZE -eq 0 ]; then
echo "Main branch sizes: No client build found (new feature)"
else
echo "Main branch sizes:"
echo "  JavaScript: $(numfmt --to=iec-i --suffix=B $MAIN_JS_SIZE)"
echo "  CSS: $(numfmt --to=iec-i --suffix=B $MAIN_CSS_SIZE)"
echo "  Total: $(numfmt --to=iec-i --suffix=B $MAIN_TOTAL_SIZE)"
fi
echo ""
echo "Current PR sizes:"
echo "  JavaScript: $(numfmt --to=iec-i --suffix=B $CURRENT_JS_SIZE)"
echo "  CSS: $(numfmt --to=iec-i --suffix=B $CURRENT_CSS_SIZE)"
echo "  Total: $(numfmt --to=iec-i --suffix=B $CURRENT_TOTAL_SIZE)"
echo ""
echo "Size changes:"
if [ $TOTAL_DIFF -gt 0 ]; then
echo "  Total: +$(numfmt --to=iec-i --suffix=B $TOTAL_DIFF) (+${TOTAL_PERCENT}%)"
elif [ $TOTAL_DIFF -lt 0 ]; then
echo "  Total: $(numfmt --to=iec-i --suffix=B $TOTAL_DIFF) (${TOTAL_PERCENT}%)"
else
echo "  Total: No change"
fi

if [ $JS_DIFF -gt 0 ]; then
echo "  JavaScript: +$(numfmt --to=iec-i --suffix=B $JS_DIFF)"
elif [ $JS_DIFF -lt 0 ]; then
echo "  JavaScript: $(numfmt --to=iec-i --suffix=B $JS_DIFF)"
else
echo "  JavaScript: No change"
fi

if [ $CSS_DIFF -gt 0 ]; then
echo "  CSS: +$(numfmt --to=iec-i --suffix=B $CSS_DIFF)"
elif [ $CSS_DIFF -lt 0 ]; then
echo "  CSS: $(numfmt --to=iec-i --suffix=B $CSS_DIFF)"
else
echo "  CSS: No change"
fi

# Store comparison results for validation
echo "$TOTAL_DIFF" > bundle-size-diff.txt
echo "$TOTAL_PERCENT" > bundle-size-percent.txt

echo -e "${GREEN}✅ Bundle comparison complete!${NC}"
