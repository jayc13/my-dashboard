#!/bin/bash

# E2E Test Runner Script
# This script sets up and runs the complete e2e test suite locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
CLIENT_PORT=5173
SERVER_PORT=3000
HEADLESS=true
TIMEOUT=60

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --headed)
      HEADLESS=false
      shift
      ;;
    --debug)
      HEADLESS=false
      DEBUG=true
      shift
      ;;
    --client-port)
      CLIENT_PORT="$2"
      shift 2
      ;;
    --server-port)
      SERVER_PORT="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --headed          Run tests in headed mode (visible browser)"
      echo "  --debug           Run tests in debug mode"
      echo "  --client-port     Client port (default: 5173)"
      echo "  --server-port     Server port (default: 3000)"
      echo "  --timeout         Startup timeout in seconds (default: 60)"
      echo "  --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 Starting E2E Test Suite${NC}"
echo -e "${BLUE}================================${NC}"

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Function to cleanup processes
cleanup() {
  echo -e "\n${YELLOW}🧹 Cleaning up processes...${NC}"
  
  # Kill background processes
  if [ -f server.pid ]; then
    kill $(cat server.pid) 2>/dev/null || true
    rm server.pid
  fi
  
  if [ -f client.pid ]; then
    kill $(cat client.pid) 2>/dev/null || true
    rm client.pid
  fi
  
  # Kill any processes on the ports
  lsof -ti:$SERVER_PORT | xargs -r kill -9 2>/dev/null || true
  lsof -ti:$CLIENT_PORT | xargs -r kill -9 2>/dev/null || true
  
  echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set up cleanup trap
trap cleanup EXIT

# Check if required directories exist
if [ ! -d "server" ] || [ ! -d "client" ] || [ ! -d "tests/e2e-tests" ]; then
  echo -e "${RED}❌ Error: Required directories not found. Make sure you're in the project root.${NC}"
  exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install server dependencies
echo -e "${YELLOW}Installing server dependencies...${NC}"
cd server && npm ci && cd ..

# Install client dependencies
echo -e "${YELLOW}Installing client dependencies...${NC}"
cd client && npm ci && cd ..

# Install e2e test dependencies
echo -e "${YELLOW}Installing e2e test dependencies...${NC}"
cd tests/e2e-tests && npm ci && cd ../..

# Install Playwright browsers
echo -e "${YELLOW}Installing Playwright browsers...${NC}"
cd tests/e2e-tests && npx playwright install && cd ../..

echo -e "${BLUE}🏗️  Building applications...${NC}"

# Build client
echo -e "${YELLOW}Building client...${NC}"
cd client && npm run build && cd ..

# Build server
echo -e "${YELLOW}Building server...${NC}"
cd server && npm run build && cd ..

echo -e "${BLUE}🚀 Starting services...${NC}"

# Start server
echo -e "${YELLOW}Starting server on port $SERVER_PORT...${NC}"
cd server

# Create server .env for testing
cat > .env << EOF
NODE_ENV=test
PORT=$SERVER_PORT
API_SECURITY_KEY=${API_SECURITY_KEY:-test-api-key-for-e2e}
MYSQL_HOST=${MYSQL_HOST:-localhost}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=${MYSQL_USER:-root}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-}
MYSQL_DATABASE=${MYSQL_DATABASE:-cypress_dashboard_test}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-}
FIREBASE_PRIVATE_KEY="${FIREBASE_PRIVATE_KEY:-}"
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL:-}
EOF

npm start &
SERVER_PID=$!
echo $SERVER_PID > ../server.pid
cd ..

# Wait for server to be ready
echo -e "${YELLOW}Waiting for server to be ready...${NC}"
timeout $TIMEOUT bash -c "until curl -f http://localhost:$SERVER_PORT/health >/dev/null 2>&1; do sleep 2; done" || {
  echo -e "${RED}❌ Server failed to start within $TIMEOUT seconds${NC}"
  exit 1
}
echo -e "${GREEN}✅ Server is ready${NC}"

# Start client
echo -e "${YELLOW}Starting client on port $CLIENT_PORT...${NC}"
cd client

# Create client .env for testing
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:$SERVER_PORT
VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY:-}
VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN:-}
VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID:-}
VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET:-}
VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID:-}
VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID:-}
EOF

npm run dev &
CLIENT_PID=$!
echo $CLIENT_PID > ../client.pid
cd ..

# Wait for client to be ready
echo -e "${YELLOW}Waiting for client to be ready...${NC}"
timeout $TIMEOUT bash -c "until curl -f http://localhost:$CLIENT_PORT >/dev/null 2>&1; do sleep 2; done" || {
  echo -e "${RED}❌ Client failed to start within $TIMEOUT seconds${NC}"
  exit 1
}
echo -e "${GREEN}✅ Client is ready${NC}"

echo -e "${BLUE}🧪 Running E2E tests...${NC}"

# Run e2e tests
cd tests/e2e-tests

# Create e2e test .env
cat > .env << EOF
BASE_URL=http://localhost:$CLIENT_PORT
API_URL=http://localhost:$SERVER_PORT
API_SECURITY_KEY=test-api-key-for-e2e
EOF

# Run tests based on mode
if [ "$DEBUG" = true ]; then
  echo -e "${YELLOW}Running tests in debug mode...${NC}"
  npm run test:debug
elif [ "$HEADLESS" = false ]; then
  echo -e "${YELLOW}Running tests in headed mode...${NC}"
  npm run test:headed
else
  echo -e "${YELLOW}Running tests in headless mode...${NC}"
  npm test
fi

cd ../..

echo -e "${GREEN}🎉 E2E tests completed successfully!${NC}"
