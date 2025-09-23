#!/bin/bash

# Default constants
DEFAULT_WWW_DIR="/opt/homebrew/var/www"
DASHBOARD_URL="https://localhost"

# Parse command line arguments
WWW_DIR="$DEFAULT_WWW_DIR"
for arg in "$@"; do
    case $arg in
        --deploy-dir=*)
            WWW_DIR="${arg#*=}"
            shift
            ;;
        *)
            # Unknown option
            ;;
    esac
done

clear
echo "\033[1;35m\033[1m\033[48;5;230m==========   S T A R T I N G   L O C A L   D E P L O Y   ==========\033[0m"
echo "\033[1;36mDeployment directory: ${WWW_DIR}\033[0m"

echo "\033[1;34m🔹 Step 0: Checking if the script is run from the project root...\033[0m"
cd "$(git rev-parse --show-toplevel)" || exit

echo "\033[1;34m🔹 Step 1: Installing dependencies...\033[0m"
npm install --registry=https://registry.npmjs.org/ &>/dev/null

echo "\033[1;33m🔸 Step 2: Running linter...\033[0m"
npm run lint --workspace=client &>/dev/null || { echo -e "\033[1;31mLint failed.\033[0m"; exit 1; }

echo "\033[1;32m🛠️Step 3: Building client...\033[0m"
npm run build --workspace=client &>/dev/null || { echo -e "\033[1;31mBuild failed.\033[0m"; exit 1; }
cd scripts || exit
npm run replace-env &>/dev/null || { echo -e "\033[1;31mEnvironment variable replacement failed.\033[0m"; exit 1; }

echo "\033[1;31m🗑️Step 4: Removing old dashboard version...\033[0m"
rm -rf ${WWW_DIR}/* &>/dev/null

echo "\033[1;36m🚀 Step 5: Copying the new version...\033[0m"
cp -r ../client/dist/* ${WWW_DIR}/ &>/dev/null

echo "\033[1;35m✅  Deployment completed successfully!\033[0m"

# Send system notification with full features
if command -v terminal-notifier &> /dev/null; then
    terminal-notifier \
        -title "🚀 My Dashboard" \
        -subtitle "Local Deploy" \
        -message "Deployed completed successfully!" \
        -sound Hero \
        -appIcon "https://localhost/logo.png" \
        -open "${DASHBOARD_URL}" \
        -contentImage "https://localhost/logo.png" \
        -activate "com.google.Chrome" \
        -remove "ALL" &>/dev/null
else
    echo "\033[1;33m🔔 Install terminal-notifier for system notifications: brew install terminal-notifier\033[0m"
fi

echo "\033[1;35m\033[1m\033[48;5;230m==========   L O C A L   D E P L O Y   C O M P L E T E D   ==========\033[0m"
echo "\033[1;33mYou can now access the dashboard at ${DASHBOARD_URL}\033[0m"
