# SDK Installation

This guide covers how to install and set up the My Dashboard SDK (`@my-dashboard/sdk`) in your project.

## Prerequisites

- **Node.js** v18.0.0 or higher
- **npm**, **pnpm**, or **yarn** package manager
- **TypeScript** 5.0+ (recommended for type safety)

## Installation Methods

### Using pnpm (Recommended)

```bash
pnpm add @my-dashboard/sdk --registry=https://registry.npmjs.org/
```

### Using npm

```bash
npm install @my-dashboard/sdk --registry=https://registry.npmjs.org/
```

### Using yarn

```bash
yarn add @my-dashboard/sdk --registry=https://registry.npmjs.org/
```

## Verify Installation

After installation, verify the SDK is installed correctly:

```bash
# Check package version
npm list @my-dashboard/sdk

# Or with pnpm
pnpm list @my-dashboard/sdk
```

## TypeScript Configuration

The SDK is written in TypeScript and includes type definitions. Ensure your `tsconfig.json` is configured properly:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

## Environment Setup

### Environment Variables

Create a `.env` file in your project root:

```env
# Required
MY_DASHBOARD_API_KEY=your-api-key-here
MY_DASHBOARD_BASE_URL=http://localhost:3000

# Optional
MY_DASHBOARD_TIMEOUT=30000
MY_DASHBOARD_RETRIES=3
```

### Loading Environment Variables

**Node.js:**
```bash
npm install dotenv
```

```typescript
import 'dotenv/config';
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});
```

**Vite (Client-side):**
```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: import.meta.env.VITE_MY_DASHBOARD_BASE_URL,
  apiKey: import.meta.env.VITE_MY_DASHBOARD_API_KEY,
});
```

## Basic Initialization

### Simple Setup

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
});

// Test the connection
const health = await api.health.getHealthStatus();
console.log('API Status:', health.status);
```

### With Configuration Options

```typescript
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: 'https://api.mydashboard.com',
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
  retries: 5,              // Number of retry attempts
  timeout: 60000,          // Request timeout in ms
  userAgent: 'MyApp/1.0.0' // Custom user agent
});
```

## Framework-Specific Setup

### React

**Create SDK Context:**

```typescript
// contexts/SDKContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { MyDashboardAPI } from '@my-dashboard/sdk';

interface SDKContextType {
  api: MyDashboardAPI | null;
  isReady: boolean;
}

const SDKContext = createContext<SDKContextType>({
  api: null,
  isReady: false,
});

export const SDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = useMemo(() => {
    return new MyDashboardAPI({
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      apiKey: import.meta.env.VITE_API_KEY,
      retries: 3,
    });
  }, []);

  return (
    <SDKContext.Provider value={{ api, isReady: true }}>
      {children}
    </SDKContext.Provider>
  );
};

export const useSDK = () => useContext(SDKContext);
```

**Use in Components:**

```typescript
import { useSDK } from './contexts/SDKContext';

function MyComponent() {
  const { api, isReady } = useSDK();

  useEffect(() => {
    if (!isReady) return;

    const fetchData = async () => {
      const apps = await api.getApplications();
      console.log(apps);
    };

    fetchData();
  }, [api, isReady]);

  return <div>...</div>;
}
```

### Next.js

**API Route:**

```typescript
// pages/api/dashboard.ts
import { MyDashboardAPI } from '@my-dashboard/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const apps = await api.getApplications();
    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
}
```

**Server Component:**

```typescript
// app/dashboard/page.tsx
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});

export default async function DashboardPage() {
  const apps = await api.getApplications();

  return (
    <div>
      <h1>Applications</h1>
      <ul>
        {apps.map(app => (
          <li key={app.id}>{app.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Express.js

```typescript
import express from 'express';
import { MyDashboardAPI } from '@my-dashboard/sdk';

const app = express();
const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
  apiKey: process.env.MY_DASHBOARD_API_KEY!,
});

app.get('/api/applications', async (req, res) => {
  try {
    const apps = await api.getApplications();
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Cypress Tests

```typescript
// cypress/support/commands.ts
import { MyDashboardAPI } from '@my-dashboard/sdk';

const api = new MyDashboardAPI({
  baseUrl: Cypress.env('MY_DASHBOARD_BASE_URL'),
  apiKey: Cypress.env('MY_DASHBOARD_API_KEY'),
});

Cypress.Commands.add('createE2EReport', (data) => {
  return api.createE2EReport(data);
});

// cypress/e2e/dashboard.cy.ts
describe('Dashboard', () => {
  it('should display applications', () => {
    cy.createE2EReport({
      projectName: 'test-project',
      totalRuns: 10,
      passedRuns: 8,
      failedRuns: 2,
    });

    cy.visit('/dashboard');
    cy.contains('test-project').should('be.visible');
  });
});
```

## Validation

### Test Your Setup

Create a test file to verify the SDK is working:

```typescript
// test-sdk.ts
import { MyDashboardAPI } from '@my-dashboard/sdk';

async function testSDK() {
  const api = new MyDashboardAPI({
    baseUrl: process.env.MY_DASHBOARD_BASE_URL!,
    apiKey: process.env.MY_DASHBOARD_API_KEY!,
  });

  try {
    // Test health endpoint
    const health = await api.health.getHealthStatus();
    console.log('✅ Health check:', health.status);

    // Test API key validation
    const auth = await api.validateCurrentApiKey();
    console.log('✅ API key valid:', auth.valid);

    // Test fetching data
    const apps = await api.getApplications();
    console.log('✅ Found applications:', apps.length);

    console.log('\n🎉 SDK setup successful!');
  } catch (error) {
    console.error('❌ SDK test failed:', error);
    process.exit(1);
  }
}

testSDK();
```

Run the test:

```bash
npx tsx test-sdk.ts
# or
node --loader ts-node/esm test-sdk.ts
```

## Troubleshooting

### Module Not Found

**Error:** `Cannot find module '@my-dashboard/sdk'`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or with pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type Errors

**Error:** TypeScript can't find type definitions

**Solution:**
```bash
# Ensure TypeScript is installed
npm install -D typescript

# Check tsconfig.json includes node_modules
{
  "compilerOptions": {
    "moduleResolution": "node",
    "skipLibCheck": true
  }
}
```

### Configuration Errors

**Error:** `ConfigurationError: baseUrl is required`

**Solution:**
```typescript
// Ensure all required config is provided
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000', // Required
  apiKey: 'your-api-key',           // Required
});
```

### Network Errors

**Error:** `NetworkError: Failed to fetch`

**Solution:**
```typescript
// Check baseUrl is correct and server is running
// Verify API key is valid
// Check network connectivity

// Enable debug logging
const api = new MyDashboardAPI({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
  timeout: 60000, // Increase timeout
  retries: 5,     // Increase retries
});
```

## Next Steps

- [Authentication](./authentication.md) - Learn about API key authentication
- [Usage Examples](./usage-examples.md) - See practical examples
- [API Reference](../api/overview.md) - Explore available endpoints

## Additional Resources

- [SDK Source Code](https://github.com/jayc13/my-dashboard/tree/main/packages/sdk)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [API Documentation](../api/overview.md)

