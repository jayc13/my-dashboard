#!/bin/bash

# Start build process
echo "==========   S T A R T I N G   R A I L W A Y   B U I L D   =========="

pnpm --filter=@my-dashboard/types run build || { echo -e "\033[1;31mBuild Types failed.\033[0m"; exit 1; }
pnpm --filter=cron run build || { echo -e "\033[1;31mBuild Cron failed.\033[0m"; exit 1; }

# Deploy completed
echo "✅  Build completed successfully!"