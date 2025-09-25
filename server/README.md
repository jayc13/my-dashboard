# Server - Node.js Backend API

The server application is a robust Node.js backend built with Express.js and TypeScript, providing RESTful APIs for the Cypress Dashboard. It handles authentication, data management, integrations with external services, and real-time notifications.

## 🚀 Technology Stack

### Core Technologies
- **Node.js v22.19.0** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **TypeScript 5.3.3** - Type-safe JavaScript development
- **MySQL2 3.14.5** - Database connectivity and ORM

### Key Libraries
- **Firebase Admin 13.5.0** - Authentication and push notifications
- **Helmet 8.1.0** - Security middleware
- **CORS 2.8.5** - Cross-origin resource sharing
- **Express Rate Limit 8.1.0** - API rate limiting
- **Octokit 7.0.3** - GitHub API integration
- **Dotenv 17.2.2** - Environment variable management

### Development Tools
- **Jest 30.1.3** - Testing framework
- **ESLint 9.35.0** - Code linting
- **ts-node-dev 2.0.0** - Development server with hot reload

## 📁 Project Structure

```
server/
├── src/
│   ├── config/            # Configuration files
│   │   └── firebase-config.ts
│   ├── controllers/       # Request handlers
│   │   ├── app.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── e2e_report_controller.ts
│   │   ├── fcm.controller.ts
│   │   ├── jira_controller.ts
│   │   ├── notification.controller.ts
│   │   ├── pull_request.controller.ts
│   │   └── to_do_list.controller.ts
│   ├── db/                # Database configuration
│   │   ├── database.ts    # Database connection
│   │   ├── migrate.ts     # Migration scripts
│   │   └── mysql.ts       # MySQL utilities
│   ├── middleware/        # Express middleware
│   │   ├── api_key_validator.ts
│   │   ├── bruteForceProtection.ts
│   │   └── error_handler.ts
│   ├── routes/            # API route definitions
│   │   ├── apps.ts
│   │   ├── auth.ts
│   │   ├── e2e_report.ts
│   │   ├── fcm.ts
│   │   ├── jira.ts
│   │   ├── notifications.ts
│   │   ├── pull_requests.ts
│   │   └── to_do_list.ts
│   ├── services/          # Business logic
│   │   ├── app.service.ts
│   │   ├── circle_ci.service.ts
│   │   ├── cypress.service.ts
│   │   ├── e2e_report.service.ts
│   │   ├── fcm.service.ts
│   │   ├── github.service.ts
│   │   ├── jira.service.ts
│   │   ├── notification.service.ts
│   │   └── pull_request.service.ts
│   ├── tests/             # Test files
│   │   ├── setup.ts
│   │   └── *.test.ts
│   ├── types/             # TypeScript definitions
│   └── index.ts           # Application entry point
├── dist/                  # Compiled JavaScript (generated)
├── data/                  # Data storage directory
├── migrations/            # Database migration files
├── docs/                  # API documentation
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
├── eslint.config.js       # ESLint configuration
└── railway.toml           # Railway deployment config
```

## 🛠️ Development Setup

### Prerequisites
- Node.js v22.19.0 (specified in engines)
- MySQL database server
- Firebase project with Admin SDK
- GitHub personal access token (for integrations)

### Installation
```bash
cd server
npm install
```

### Environment Variables
Create a `.env` file in the server directory:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=cypress_dashboard

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com

# External API Keys
GITHUB_TOKEN=your_github_token
JIRA_API_TOKEN=your_jira_token
JIRA_BASE_URL=https://your-domain.atlassian.net
CIRCLE_CI_TOKEN=your_circle_ci_token

# Security
API_KEY=your_internal_api_key
JWT_SECRET=your_jwt_secret

# Notification Settings
FCM_SERVER_KEY=your_fcm_server_key
```

### Database Setup
```bash
# Run database migrations
npm run migrate

# Or manually create database
mysql -u root -p
CREATE DATABASE cypress_dashboard;
```

### Available Scripts

#### Development
```bash
# Start development server with hot reload
npm run dev

# Development server runs on http://localhost:3000
```

#### Production
```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

#### Database
```bash
# Run database migrations
npm run migrate
```

#### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

#### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint-fix
```

## 🏗️ API Architecture

### RESTful API Design
The server follows REST principles with consistent endpoint patterns:

```
GET    /api/resource      # List all resources
GET    /api/resource/:id  # Get specific resource
POST   /api/resource      # Create new resource
PUT    /api/resource/:id  # Update resource
DELETE /api/resource/:id  # Delete resource
```

### Authentication & Authorization
- **Firebase Authentication** for user verification
- **API Key validation** for internal service communication
- **JWT tokens** for session management
- **Role-based access control** for different user types

### Rate Limiting & Security
- **Express Rate Limit** prevents API abuse
- **Helmet.js** adds security headers
- **CORS** configured for cross-origin requests
- **Brute force protection** for authentication endpoints

## 📊 API Endpoints

### Authentication (`/api/auth`)
```typescript
POST   /api/auth/login           # User authentication
POST   /api/auth/logout          # User logout
GET    /api/auth/verify          # Token verification
POST   /api/auth/refresh         # Token refresh
```

### E2E Test Reports (`/api/e2e-reports`)
```typescript
GET    /api/e2e-reports          # List test reports
POST   /api/e2e-reports          # Create test report
GET    /api/e2e-reports/:id      # Get specific report
PUT    /api/e2e-reports/:id      # Update report
DELETE /api/e2e-reports/:id      # Delete report
```

### Pull Requests (`/api/pull-requests`)
```typescript
GET    /api/pull-requests        # List pull requests
POST   /api/pull-requests/sync   # Sync with GitHub
GET    /api/pull-requests/:id    # Get PR details
PUT    /api/pull-requests/:id    # Update PR status
```

### Tasks & To-Do Lists (`/api/tasks`)
```typescript
GET    /api/tasks                # List tasks
POST   /api/tasks                # Create task
PUT    /api/tasks/:id            # Update task
DELETE /api/tasks/:id            # Delete task
GET    /api/tasks/jira           # Sync with Jira
```

### Notifications (`/api/notifications`)
```typescript
GET    /api/notifications        # List notifications
POST   /api/notifications        # Create notification
PUT    /api/notifications/:id    # Mark as read
DELETE /api/notifications/:id    # Delete notification
```

### Firebase Cloud Messaging (`/api/fcm`)
```typescript
POST   /api/fcm/subscribe        # Subscribe to notifications
POST   /api/fcm/send             # Send push notification
DELETE /api/fcm/unsubscribe      # Unsubscribe from notifications
```

### Applications (`/api/apps`)
```typescript
GET    /api/apps                 # List applications
GET    /api/apps/:id/health      # Application health check
GET    /api/apps/:id/metrics     # Application metrics
```

## 🔧 Key Features

### External Service Integrations

#### GitHub Integration
- **Pull Request Monitoring**: Automatic PR status tracking
- **Repository Management**: Multi-repository support
- **Webhook Support**: Real-time updates from GitHub
- **Branch Protection**: Automated branch protection rules

#### Jira Integration
- **Ticket Synchronization**: Bi-directional sync with Jira
- **Status Updates**: Automatic status updates based on PR status
- **Sprint Management**: Sprint planning and tracking
- **Custom Fields**: Support for custom Jira fields

#### CircleCI Integration
- **Build Status Monitoring**: Real-time build status tracking
- **Pipeline Management**: CI/CD pipeline monitoring
- **Artifact Management**: Build artifact storage and retrieval
- **Performance Metrics**: Build time and success rate tracking

#### Cypress Integration
- **Test Result Processing**: Automated test result parsing
- **Report Generation**: Comprehensive test reports
- **Historical Data**: Test trend analysis and reporting
- **Failure Analysis**: Automated failure categorization

### Real-time Features
- **Push Notifications**: Firebase Cloud Messaging
- **WebSocket Support**: Real-time data updates
- **Event-driven Architecture**: Pub/sub pattern for notifications
- **Live Dashboard Updates**: Real-time metrics and status updates

### Data Management
- **MySQL Database**: Relational data storage
- **Migration System**: Database schema versioning
- **Data Validation**: Input validation and sanitization
- **Backup Integration**: Automated database backups

## 🔐 Security Features

### Authentication Security
- **Firebase Admin SDK**: Secure token verification
- **JWT Implementation**: Stateless authentication
- **Session Management**: Secure session handling
- **Password Security**: Bcrypt hashing for local accounts

### API Security
- **Rate Limiting**: Prevents API abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

### Infrastructure Security
- **Environment Variables**: Secure configuration management
- **HTTPS Enforcement**: SSL/TLS encryption
- **CORS Configuration**: Controlled cross-origin access
- **Security Headers**: Helmet.js security middleware

## 🧪 Testing Strategy

### Current Testing Setup
- **Jest**: Unit and integration testing framework
- **Supertest**: HTTP assertion testing
- **Test Database**: Isolated test environment
- **Mocking**: External service mocking for reliable tests

### Test Categories
```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# API Tests
npm run test:api

# All Tests
npm test
```

### Test Structure
```typescript
// Example test structure
describe('E2E Report Controller', () => {
  beforeEach(() => {
    // Setup test database and mocks
  });

  it('should create new test report', async () => {
    // Test implementation
  });

  afterEach(() => {
    // Cleanup
  });
});
```

## 🚀 Deployment

### Production Build
```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Environment Configuration
- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Optimized build with monitoring

### Railway Deployment
The server includes Railway configuration (`railway.toml`):
```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

### Health Checks
```typescript
GET /health              # Basic health check
GET /health/detailed     # Detailed system status
GET /health/database     # Database connectivity
GET /health/external     # External service status
```

## 📊 Monitoring & Logging

### Application Monitoring
- **Health Check Endpoints**: System status monitoring
- **Performance Metrics**: Response time and throughput
- **Error Tracking**: Comprehensive error logging
- **Database Monitoring**: Query performance and connection health

### Logging Strategy
- **Structured Logging**: JSON-formatted logs
- **Log Levels**: Debug, info, warn, error
- **Request Logging**: HTTP request/response logging
- **Error Logging**: Detailed error stack traces

## 🐛 Troubleshooting

### Common Issues

**Database Connection:**
```bash
# Check MySQL connection
mysql -h localhost -u root -p

# Verify environment variables
echo $MYSQL_HOST $MYSQL_USER $MYSQL_DATABASE
```

**Firebase Authentication:**
```bash
# Verify Firebase configuration
node -e "console.log(JSON.parse(process.env.FIREBASE_PRIVATE_KEY))"

# Test Firebase connection
npm run test:firebase
```

**External API Issues:**
```bash
# Test GitHub API
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Test Jira API
curl -u email:$JIRA_API_TOKEN $JIRA_BASE_URL/rest/api/2/myself
```

### Development Debugging
```bash
# Start with debug logging
DEBUG=* npm run dev

# Run specific test file
npm test -- --testPathPattern=controller.test.ts

# Check TypeScript compilation
npx tsc --noEmit
```

## 🔄 Development Workflow

### Feature Development
1. Create feature branch from main
2. Set up development environment
3. Implement controllers, services, and routes
4. Write comprehensive tests
5. Update API documentation
6. Run linting and type checking
7. Create pull request with proper documentation

### Code Standards
- Follow RESTful API design principles
- Use TypeScript for all new code
- Implement proper error handling
- Write meaningful variable and function names
- Add comprehensive logging and monitoring
- Follow security best practices

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v2/)