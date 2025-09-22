#!/bin/bash

# Start build process
echo "\033[1;35m\033[1m\033[48;5;230m==========   S T A R T I N G   R A I L W A Y   B U I L D   ==========\033[0m"

cd ../packages/types || exit
npm install --registry=https://registry.npmjs.org/ &>/dev/null
npm run build &>/dev/null || { echo -e "\033[1;31mBuild failed.\033[0m"; exit 1; }
cd ../server || exit
npm install --registry=https://registry.npmjs.org/ &>/dev/null
npm run build &>/dev/null || { echo -e "\033[1;31mBuild failed.\033[0m"; exit 1; }

# Deploy completed
echo "\033[1;35m✅  Build completed successfully!\033[0m"