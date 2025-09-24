# Mock Server Usage Guide

## Quick Start

1. **Start the server:**
   ```bash
   cd mock-server
   npm run dev
   ```

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Make some test API calls:**
   ```bash
   # Test GitHub API
   curl http://localhost:3001/github/repos/jayc13/my-dashboard/pulls/123
   
   # Test Jira API
   curl "http://localhost:3001/jira/rest/api/2/search?jql=project=DASH"
   
   # Test Cypress Dashboard
   curl http://localhost:3001/cypress/projects/proj-12345/runs
   
   # Test CircleCI API
   curl http://localhost:3001/circleci/v2/project/gh/jayc13/my-dashboard/pipeline
   ```

4. **View registered API calls:**
   ```bash
   # Get summary statistics
   curl http://localhost:3001/registry/summary
   
   # Get all calls
   curl http://localhost:3001/registry/calls
   
   # Get calls for specific service
   curl http://localhost:3001/registry/calls/github
   ```

## Integration with Main Dashboard

To use this mock server with your main dashboard application:

1. **Update environment variables** in your main server to point to the mock server:
   ```bash
   # In your main server .env file
   GITHUB_URL=http://localhost:3001/github
   CIRCLECI_BASE_URL=http://localhost:3001/circleci
   CYPRESS_DASHBOARD_URL=http://localhost:3001/cypress
   JIRA_BASE_URL=http://localhost:3001/jira
   ```

2. **Start both servers:**
   ```bash
   # Terminal 1: Start mock server
   cd mock-server && npm run dev
   
   # Terminal 2: Start main server
   cd server && npm run dev
   ```

3. **All third-party API calls will now be:**
   - Intercepted by the mock server
   - Automatically registered and logged
   - Responded to with realistic mock data

## Registry Features

### View All Calls
```bash
curl http://localhost:3001/registry/calls
```

### Filter by Service
```bash
curl http://localhost:3001/registry/calls/github
curl http://localhost:3001/registry/calls/jira
curl http://localhost:3001/registry/calls/cypress
curl http://localhost:3001/registry/calls/circleci
```

### Search Calls
```bash
# Search for calls containing "pull"
curl "http://localhost:3001/registry/calls/search?q=pull"

# Search within specific service
curl "http://localhost:3001/registry/calls/search?q=issue&service=jira"
```

### Export Data
```bash
# Export all calls as JSON
curl http://localhost:3001/registry/export > api-calls.json
```

### Clear Registry
```bash
curl -X DELETE http://localhost:3001/registry/calls
```

## Mock Data Customization

The mock server provides realistic responses based on the actual API documentation. You can customize the mock data by editing the service files:

- `src/services/github-mock.ts` - GitHub API responses
- `src/services/circleci-mock.ts` - CircleCI API responses  
- `src/services/cypress-mock.ts` - Cypress Dashboard responses
- `src/services/jira-mock.ts` - Jira API responses

## Configuration

Edit `.env` file to customize:

```bash
# Server port
PORT=3001

# Enable/disable API call logging
LOG_API_CALLS=true

# Registry size limit
MAX_REGISTRY_SIZE=10000

# Response delays (milliseconds)
DEFAULT_DELAY_MS=100
ENABLE_REALISTIC_DELAYS=true
```

## Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Registry Health
```bash
curl http://localhost:3001/registry/health
```

### Statistics
```bash
curl http://localhost:3001/registry/stats
```

## Development

### Adding New Endpoints

1. Edit the appropriate service file (e.g., `src/services/github-mock.ts`)
2. Add your new route with the registry middleware
3. Restart the server

Example:
```typescript
router.get('/new-endpoint', (req, res) => {
  console.log('[GITHUB] New endpoint called');
  res.json({ message: 'New endpoint response' });
});
```

### Testing

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
npm start
```

This mock server will help you develop and test your dashboard application without depending on external third-party services!
