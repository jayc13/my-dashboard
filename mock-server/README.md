# Third-Party Services Mock Server

A comprehensive mock server for third-party services used by My Dashboard, including GitHub, CircleCI, Cypress Dashboard, and Jira APIs. This server automatically registers and logs all API calls for testing and development purposes.

## 🎯 Purpose

This mock server is designed to:
- **Mock external APIs** for GitHub, CircleCI, Cypress Dashboard, and Jira
- **Register all API calls** automatically with detailed logging
- **Provide realistic responses** with configurable delays
- **Enable offline development** without depending on external services
- **Support testing scenarios** with predictable mock data

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Build the project
npm run build

# Start the server
npm start
```

### Development Mode

```bash
# Run in development mode with auto-reload
npm run dev

# Or with file watching
npm run watch
```

## 📋 Available Services

### GitHub API (`/github`)
- `GET /github/repos/{owner}/{repo}/pulls/{pull_number}` - Get pull request details
- `GET /github/repos/{owner}/{repo}/pulls` - List pull requests
- `GET /github/user` - Get authenticated user info
- `GET /github/repos/{owner}/{repo}` - Get repository info

### CircleCI API (`/circleci`)
- `GET /circleci/v2/project/{project-slug}/pipeline` - List pipelines
- `GET /circleci/v2/pipeline/{pipeline-id}` - Get pipeline details
- `POST /circleci/v2/project/{project-slug}/pipeline` - Trigger pipeline
- `GET /circleci/v2/me` - Get current user

### Cypress Dashboard (`/cypress`)
- `GET /cypress/projects/{projectId}/runs` - List test runs
- `GET /cypress/projects/{projectId}/runs/{runId}` - Get run details
- `POST /cypress/projects/{projectId}/runs` - Create new run
- `GET /cypress/projects/{projectId}` - Get project info

### Jira API (`/jira`)
- `GET /jira/rest/api/2/search` - Search issues with JQL
- `GET /jira/rest/api/2/issue/{issueIdOrKey}` - Get issue details
- `POST /jira/rest/api/2/issue` - Create new issue
- `PUT /jira/rest/api/2/issue/{issueIdOrKey}` - Update issue

## 📊 API Call Registry

All API calls are automatically registered and can be viewed through the registry endpoints:

### Registry Endpoints

- `GET /registry/calls` - Get all registered calls (with filtering)
- `GET /registry/calls/{service}` - Get calls for specific service
- `GET /registry/summary` - Get summary statistics
- `GET /registry/stats` - Get registry statistics
- `GET /registry/export` - Export calls as JSON
- `DELETE /registry/calls` - Clear all registered calls
- `GET /registry/calls/search?q={query}` - Search calls by content

### Example Usage

```bash
# Get all GitHub API calls
curl http://localhost:3001/registry/calls/github

# Get summary statistics
curl http://localhost:3001/registry/summary

# Search for calls containing "pull"
curl "http://localhost:3001/registry/calls/search?q=pull"

# Export all calls
curl http://localhost:3001/registry/export > api-calls.json
```

## ⚙️ Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Third-Party Service Ports (for future use)
GITHUB_MOCK_PORT=3002
CIRCLECI_MOCK_PORT=3003
CYPRESS_MOCK_PORT=3004
JIRA_MOCK_PORT=3005

# API Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_API_CALLS=true

# Registry Configuration
MAX_REGISTRY_SIZE=10000
CLEAR_REGISTRY_ON_START=false

# Mock Data Configuration
ENABLE_REALISTIC_DELAYS=true
DEFAULT_DELAY_MS=100
```

## 🔧 Usage Examples

### Testing GitHub Integration

```bash
# Mock a GitHub PR fetch
curl http://localhost:3001/github/repos/jayc13/my-dashboard/pulls/123

# Check if the call was registered
curl http://localhost:3001/registry/calls/github
```

### Testing CircleCI Integration

```bash
# Mock pipeline listing
curl http://localhost:3001/circleci/v2/project/gh/jayc13/my-dashboard/pipeline

# Trigger a new pipeline
curl -X POST http://localhost:3001/circleci/v2/project/gh/jayc13/my-dashboard/pipeline \
  -H "Content-Type: application/json" \
  -d '{"branch": "main"}'
```

### Testing Cypress Dashboard

```bash
# Get test runs
curl http://localhost:3001/cypress/projects/proj-12345/runs

# Create a new run
curl -X POST http://localhost:3001/cypress/projects/proj-12345/runs \
  -H "Content-Type: application/json" \
  -d '{"branch": "main", "commit": {"sha": "abc123"}}'
```

### Testing Jira Integration

```bash
# Search for issues
curl "http://localhost:3001/jira/rest/api/2/search?jql=project=DASH"

# Get specific issue
curl http://localhost:3001/jira/rest/api/2/issue/DASH-123
```

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

### Registry Health

```bash
curl http://localhost:3001/registry/health
```

## 🛠️ Development

### Project Structure

```
mock-server/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── registry/        # API call registry system
│   ├── middleware/      # Express middleware
│   ├── services/        # Mock service implementations
│   ├── routes/          # Registry management routes
│   └── index.ts         # Main server file
├── dist/                # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start in development mode
- `npm run watch` - Start with file watching
- `npm run clean` - Clean build directory
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🔍 Features

- **Automatic API Call Registration** - Every request is logged with full details
- **Realistic Mock Responses** - Based on actual API documentation
- **Configurable Delays** - Simulate network latency
- **Search and Filter** - Find specific calls easily
- **Export Functionality** - Download call logs for analysis
- **Health Monitoring** - Track server and registry status
- **CORS Support** - Works with frontend applications
- **Security Headers** - Helmet.js for basic security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
