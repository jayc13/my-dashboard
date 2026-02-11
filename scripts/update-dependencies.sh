#!/bin/bash

# Script to update all dependencies across the monorepo
# This script updates dependencies for all workspaces in the project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${YELLOW}Updating all dependencies in the monorepo...${NC}"
echo "Root directory: $ROOT_DIR"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed. Please install pnpm first.${NC}"
    exit 1
fi

cd "$ROOT_DIR"

# Update dependencies in root
echo -e "${YELLOW}Updating root dependencies...${NC}"
pnpm update --recursive --registry=https://registry.npmjs.org/

echo -e "${GREEN}Successfully updated all dependencies!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the changes in package.json files"
echo "2. Test your application thoroughly"
echo "3. Run 'pnpm install' to install the updated dependencies"
echo "4. Commit the changes if everything works correctly"
