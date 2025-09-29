#!/bin/bash

# E2E Test Runner Script
# This script sets up and runs the complete e2e test suite locally

set -e

export HNVM_PNPM=10.17.1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
CLIENT_PORT=5173
SERVER_PORT=3000
MOCK_SERVER_PORT=3001
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
  if [ -f ./server.pid ]; then
    kill $(cat ./server.pid) || true
  fi
  if [ -f ./mock-server.pid ]; then
    kill $(cat ./mock-server.pid) || true
  fi
  if [ -f ./client.pid ]; then
    kill $(cat ./client.pid) || true
  fi
  
  # Kill any processes on the ports
  lsof -ti:$MOCK_SERVER_PORT | xargs -r kill -9 2>/dev/null || true
  lsof -ti:$SERVER_PORT | xargs -r kill -9 2>/dev/null || true
  lsof -ti:$CLIENT_PORT | xargs -r kill -9 2>/dev/null || true
  
  echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set up cleanup trap
trap cleanup EXIT


cd "$(git rev-parse --show-toplevel)" || exit 1

cleanup

echo -e "${BLUE}📦 Installing dependencies...${NC}"

pnpm install --registry=https://registry.npmjs.org/ --silent

echo -e "${BLUE}🏗️  Building applications...${NC}"
pnpm -r --if-present run build

echo -e "${BLUE}🚀 Starting services...${NC}"

# Start server
echo -e "${YELLOW}Starting mock-server on port $MOCK_SERVER_PORT...${NC}"
cd mock-server

npm start &
SERVER_PID=$!
echo $SERVER_PID > ../mock-server.pid
cd ..

# Start server
echo -e "${YELLOW}Starting server on port $SERVER_PORT...${NC}"
cd server

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
