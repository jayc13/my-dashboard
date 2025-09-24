#!/bin/bash

# Start build process
echo "==========   S T A R T I N G   R A I L W A Y   B U I L D   =========="

npm install --registry=https://registry.npmjs.org/ &>/dev/null

npm run build --workspace=packages/types &>/dev/null || { echo -e "\033[1;31mBuild Types failed.\033[0m"; exit 1; }
npm run build --workspace=packages/sdk &>/dev/null || { echo -e "\033[1;31mBuild SDK failed.\033[0m"; exit 1; }

npm run build --workspace=server &>/dev/null || { echo -e "\033[1;31mBuild Server failed.\033[0m"; exit 1; }

# Deploy completed
echo "✅  Build completed successfully!"