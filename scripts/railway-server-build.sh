#!/bin/bash

# Start build process
echo "==========   S T A R T I N G   R A I L W A Y   B U I L D   =========="

npx pnpm --filter=@my-dashboard/types run build || { echo -e "\033[1;31mBuild Types failed.\033[0m"; exit 1; }
npx pnpm --filter=@my-dashboard/sdk run build || { echo -e "\033[1;31mBuild SDK failed.\033[0m"; exit 1; }

npx pnpm --filter=server run build || { echo -e "\033[1;31mBuild Server failed.\033[0m"; exit 1; }

# Deploy completed
echo "✅  Build completed successfully!"