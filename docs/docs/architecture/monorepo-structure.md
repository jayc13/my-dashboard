# Monorepo Structure

My Dashboard uses a monorepo architecture managed by **pnpm workspaces**, allowing multiple related packages to be developed and maintained in a single repository.

## Workspace Organization

```
my-dashboard/
├── client/                 # React frontend application
├── server/                 # Express backend API
├── cron/                   # Scheduled background jobs
├── mock-server/            # API mocking server
├── packages/               # Shared packages
│   ├── sdk/                # TypeScript SDK
│   └── types/              # Shared type definitions
├── tests/                  # Test suites
│   ├── e2e-tests/          # End-to-end tests (Playwright)
│   └── integration-tests/  # Integration tests
├── scripts/                # Build and deployment scripts
├── docs/                   # Documentation site (Docusaurus)
├── data/                   # Data storage
├── package.json            # Root package configuration
├── pnpm-workspace.yaml     # Workspace configuration
└── pnpm-lock.yaml          # Dependency lock file
```

## Workspace Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - 'server'
  - 'client'
  - 'cron'
  - 'scripts'
  - 'mock-server'
  - 'tests/e2e-tests'
  - 'tests/integration-tests'
  - 'packages/sdk'
  - 'packages/types'
```

## Workspace Details

### 1. Client (`/client`)

**Purpose**: React-based frontend application

**Key Technologies**:
- React 19
- Vite (build tool)
- TypeScript
- Material-UI (MUI)
- React Router DOM

**Structure**:
```
client/
├── src/
│   ├── components/      # Reusable UI components
│   ├── sections/        # Page sections
│   ├── pages/           # Route pages
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   └── App.tsx          # Main app component
├── public/              # Static assets
├── test/                # Unit tests
├── dist/                # Build output
└── package.json
```

**Scripts**:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run lint         # Lint code
```

### 2. Server (`/server`)

**Purpose**: Express.js backend API

**Key Technologies**:
- Express.js
- TypeScript
- MySQL2
- Custom validation utilities

**Structure**:
```
server/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── db/              # Database connection
│   ├── utils/           # Utility functions
│   ├── errors/          # Custom error classes
│   └── index.ts         # Server entry point
├── migrations/          # Database migrations
├── docs/                # API documentation
├── tests/               # Unit tests
├── dist/                # Build output
└── package.json
```

**Scripts**:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run database migrations
npm test             # Run tests
npm run lint         # Lint code
```

### 3. Cron (`/cron`)

**Purpose**: Scheduled background jobs

**Key Technologies**:
- Node.js
- TypeScript
- node-cron

**Structure**:
```
cron/
├── src/
│   ├── jobs/            # Cron job definitions
│   ├── config/          # Configuration
│   └── index.ts         # Cron entry point
├── dist/                # Build output
└── package.json
```

**Scripts**:
```bash
npm run dev          # Start development mode
npm run build        # Build for production
npm start            # Start production mode
```

### 4. Mock Server (`/mock-server`)

**Purpose**: Mock external APIs for development and testing

**Key Technologies**:
- Express.js
- TypeScript

**Structure**:
```
mock-server/
├── src/
│   ├── services/        # Mock service implementations
│   └── index.ts         # Server entry point
├── dist/                # Build output
└── package.json
```

### 5. Packages

#### SDK (`/packages/sdk`)

**Purpose**: TypeScript SDK for API interaction

**Key Features**:
- Type-safe API client
- Service-based architecture
- Retry logic
- Error handling

**Structure**:
```
packages/sdk/
├── src/
│   ├── services/        # API service classes
│   ├── client.ts        # Main client class
│   ├── base-client.ts   # Base client with common logic
│   └── index.ts         # Public exports
└── package.json
```

**Usage**:
```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY!
});

const apps = await api.getApplications();
```

#### Types (`/packages/types`)

**Purpose**: Shared TypeScript type definitions

**Structure**:
```
packages/types/
├── src/
│   ├── api.ts           # API types
│   ├── database.ts      # Database model types
│   ├── config.ts        # Configuration types
│   └── index.ts         # Public exports
└── package.json
```

**Usage**:
```typescript
import { Application, E2EReport } from '@my-dashboard/types';
```

### 6. Tests

#### E2E Tests (`/tests/e2e-tests`)

**Purpose**: End-to-end testing with Playwright

**Structure**:
```
tests/e2e-tests/
├── tests/               # Test files
├── pages/               # Page object models
├── utils/               # Test utilities
└── package.json
```

**Scripts**:
```bash
npm test             # Run all tests
npm run test:headed  # Run with browser UI
npm run test:debug   # Debug mode
```

#### Integration Tests (`/tests/integration-tests`)

**Purpose**: Integration testing

**Structure**:
```
tests/integration-tests/
├── tests/               # Test files
└── package.json
```

### 7. Scripts (`/scripts`)

**Purpose**: Build, deployment, and utility scripts

**Structure**:
```
scripts/
├── deployment/          # Deployment scripts
├── ci/                  # CI/CD scripts
├── check-todos.sh       # TODO checker
├── mysql-backup.sh      # Database backup
└── package.json
```

### 8. Documentation (`/docs`)

**Purpose**: Docusaurus documentation site

**Structure**:
```
docs/
├── docs/                # Documentation content
├── static/              # Static assets
├── docusaurus.config.ts # Docusaurus configuration
├── sidebars.ts          # Sidebar configuration
└── package.json
```

**Scripts**:
```bash
npm start            # Start dev server
npm run build        # Build static site
npm run deploy       # Deploy to GitHub Pages
```

## Dependency Management

### Workspace Dependencies

Packages can depend on each other using workspace protocol:

```json
{
  "dependencies": {
    "@my-dashboard/types": "workspace:*",
    "@my-dashboard/sdk": "workspace:*"
  }
}
```

### Installing Dependencies

**Root level** (affects all workspaces):
```bash
pnpm add -w <package> --registry=https://registry.npmjs.org/
```

**Specific workspace**:
```bash
pnpm add <package> --filter server --registry=https://registry.npmjs.org/
pnpm add <package> --filter client --registry=https://registry.npmjs.org/
```

### Running Scripts

**Specific workspace**:
```bash
pnpm --filter server dev
pnpm --filter client build
```

**All workspaces**:
```bash
pnpm -r test          # Run tests in all workspaces
pnpm -r build         # Build all workspaces
```

## Benefits of Monorepo

### 1. Code Sharing
- Shared types across client and server
- Reusable SDK for API interaction
- Common utilities and configurations

### 2. Atomic Changes
- Single commit can update multiple packages
- Ensures consistency across services
- Easier to track related changes

### 3. Simplified Dependency Management
- Single lock file for all packages
- Consistent versions across workspaces
- Reduced disk space usage

### 4. Unified Tooling
- Shared ESLint, Prettier, TypeScript configs
- Consistent build and test processes
- Single CI/CD pipeline

### 5. Better Developer Experience
- Easy to navigate related code
- Simplified local development
- Faster onboarding for new developers

## Best Practices

### 1. Keep Workspaces Focused
- Each workspace should have a single responsibility
- Avoid circular dependencies
- Use shared packages for common code

### 2. Version Management
- Use workspace protocol for internal dependencies
- Keep external dependencies in sync where possible
- Regular dependency updates

### 3. Build Order
- Build shared packages first (`types`, `sdk`)
- Then build services (`server`, `client`, `cron`)
- Finally build tests and documentation

### 4. Testing Strategy
- Unit tests in each workspace
- Integration tests in dedicated workspace
- E2E tests cover full application flow

## Common Commands

```bash
# Install all dependencies
pnpm install --registry=https://registry.npmjs.org/

# Add dependency to specific workspace
pnpm add <package> --filter <workspace> --registry=https://registry.npmjs.org/

# Run script in specific workspace
pnpm --filter <workspace> <script>

# Run script in all workspaces
pnpm -r <script>

# Build all workspaces
pnpm -r build

# Test all workspaces
pnpm -r test

# Clean all node_modules
pnpm -r clean
```

## Next Steps

- [Client Architecture](./client-architecture.md) - Frontend details
- [Server Architecture](./server-architecture.md) - Backend details
- [Development Setup](../development/setup.md) - Local development guide

