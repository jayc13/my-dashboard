#!/bin/bash

# Bundle Size Analysis Script
# Analyzes bundle size and compares with main branch

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
BUILD_COMMAND=${BUILD_COMMAND:-"npm run build"}

echo -e "${CYAN}📦 Starting Bundle Size Analysis...${NC}"

# Install bundle analyzer
echo -e "${BLUE}Installing bundle analyzer...${NC}"
npm install --save-dev rollup-plugin-visualizer

# Build with bundle analysis
echo -e "${BLUE}Building project...${NC}"
eval "$BUILD_COMMAND"

# Generate bundle stats
echo -e "${BLUE}📊 Generating bundle statistics...${NC}"

# Get current bundle sizes
CURRENT_JS_SIZE=$(find dist/assets -name "*.js" -type f -exec wc -c {} + | tail -1 | awk '{print $1}')
CURRENT_CSS_SIZE=$(find dist/assets -name "*.css" -type f -exec wc -c {} + | tail -1 | awk '{print $1}' || echo "0")
CURRENT_TOTAL_SIZE=$((CURRENT_JS_SIZE + CURRENT_CSS_SIZE))

echo -e "${GREEN}Current bundle sizes:${NC}"
echo "  JavaScript: $(numfmt --to=iec-i --suffix=B $CURRENT_JS_SIZE)"
echo "  CSS: $(numfmt --to=iec-i --suffix=B $CURRENT_CSS_SIZE)"
echo "  Total: $(numfmt --to=iec-i --suffix=B $CURRENT_TOTAL_SIZE)"

# Store current sizes for comparison
echo "$CURRENT_TOTAL_SIZE" > current-bundle-size.txt
echo "$CURRENT_JS_SIZE" > current-js-size.txt
echo "$CURRENT_CSS_SIZE" > current-css-size.txt

# Create detailed bundle report
echo -e "${BLUE}📋 Bundle composition:${NC}"
find dist/assets -type f \( -name "*.js" -o -name "*.css" \) -exec ls -lh {} \; | \
  awk '{print "  " $9 ": " $5}'

echo -e "${GREEN}✅ Bundle analysis complete!${NC}"
