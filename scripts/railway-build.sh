#!/bin/bash

# Start build process
echo "==========   S T A R T I N G   R A I L W A Y   B U I L D   =========="
ls -al
cd packages/types
pwd
ls -al
npm install --registry=https://registry.npmjs.org/ &>/dev/null
npm run build &>/dev/null || { echo -e "\033[1;31mBuild failed.\033[0m"; exit 1; }
cd ../../server || exit
npm install --registry=https://registry.npmjs.org/ &>/dev/null
npm run build &>/dev/null || { echo -e "\033[1;31mBuild failed.\033[0m"; exit 1; }

# Deploy completed
echo "\033[1;35m✅  Build completed successfully!\033[0m"