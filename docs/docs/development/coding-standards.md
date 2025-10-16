# Coding Standards

This document outlines the coding standards and conventions used in the My Dashboard project. Following these standards ensures code consistency, maintainability, and quality across the codebase.

## General Principles

1. **Consistency** - Follow existing patterns in the codebase
2. **Readability** - Write code that is easy to understand
3. **Simplicity** - Prefer simple solutions over complex ones
4. **Type Safety** - Leverage TypeScript's type system
5. **Documentation** - Document complex logic and public APIs

## TypeScript Configuration

### Strict Mode

All packages use TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true
  }
}
```

### Module System

- **Client**: ESNext modules with bundler resolution
- **Server**: NodeNext modules
- **Packages**: ESNext modules
- **Cron**: CommonJS modules

## Code Formatting

### ESLint Configuration

All code must pass ESLint checks before committing.

**Key Rules:**

```javascript
{
  // TypeScript
  '@typescript-eslint/no-unused-vars': ['error', { 
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    ignoreRestSiblings: true,
  }],
  '@typescript-eslint/no-explicit-any': 'warn',
  
  // General
  'no-console': 'warn', // Error in production
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': ['error', 'always'],
  'curly': ['error', 'all'],
  
  // Formatting
  'indent': ['error', 2],
  'quotes': ['error', 'single'],
  'semi': ['error', 'always'],
  'comma-dangle': ['error', 'always-multiline'],
  'object-curly-spacing': ['error', 'always'],
  'array-bracket-spacing': ['error', 'never'],
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "bracketSpacing": true
}
```

### Indentation

- **2 spaces** for all files
- No tabs
- Consistent indentation in switch cases, objects, arrays

### Quotes

- **Single quotes** for strings
- Template literals for string interpolation
- Avoid escaping quotes when possible

### Semicolons

- **Always** use semicolons
- No ASI (Automatic Semicolon Insertion) reliance

### Spacing

```typescript
// ✅ Good
const obj = { key: 'value' };
const arr = [1, 2, 3];
if (condition) {
  doSomething();
}

// ❌ Bad
const obj={key:'value'};
const arr=[ 1,2,3 ];
if(condition){
  doSomething();
}
```

## Naming Conventions

### Files and Directories

**Files:**
- React components: `PascalCase.tsx` (e.g., `Header.tsx`)
- Utilities: `camelCase.ts` (e.g., `validation.ts`)
- Types: `camelCase.ts` or `PascalCase.ts` (e.g., `types.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Configuration: `kebab-case.js` (e.g., `eslint.config.js`)

**Directories:**
- `kebab-case` for all directories (e.g., `api-documentation`)
- Exceptions: React component directories may use `PascalCase`

### Variables and Functions

```typescript
// ✅ Good - camelCase for variables and functions
const userName = 'John';
function getUserData() { }
const handleClick = () => { };

// ✅ Good - PascalCase for classes and components
class UserService { }
const UserProfile = () => { };

// ✅ Good - UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRIES = 3;

// ❌ Bad
const UserName = 'John'; // Should be camelCase
function GetUserData() { } // Should be camelCase
const api_base_url = 'https://api.example.com'; // Should be UPPER_SNAKE_CASE
```

### TypeScript Types and Interfaces

```typescript
// ✅ Good - PascalCase for types and interfaces
interface UserData {
  id: number;
  name: string;
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// ✅ Good - Prefix interfaces with 'I' only when necessary
interface IUserService {
  getUser(id: number): Promise<User>;
}

// ❌ Bad
interface userData { } // Should be PascalCase
type api_response = { }; // Should be PascalCase
```

### React Components

```typescript
// ✅ Good - PascalCase for components
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return <div>{user.name}</div>;
};

// ✅ Good - Props interface named after component
interface UserProfileProps {
  user: User;
  onUpdate?: (user: User) => void;
}

// ❌ Bad
const userProfile = () => { }; // Should be PascalCase
interface Props { } // Should be specific
```

## Code Organization

### File Structure

```typescript
// 1. Imports - grouped and ordered
import { useState, useEffect } from 'react'; // External
import { Box, Typography } from '@mui/material'; // External UI
import { useAuth } from '@/contexts/useAuth'; // Internal contexts
import { UserService } from '@/services/user.service'; // Internal services
import type { User } from '@/types'; // Types

// 2. Type definitions
interface ComponentProps {
  user: User;
}

// 3. Constants
const MAX_ITEMS = 10;

// 4. Component or function
export const Component: React.FC<ComponentProps> = ({ user }) => {
  // 4a. Hooks
  const [state, setState] = useState();
  const { auth } = useAuth();
  
  // 4b. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 4c. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 4d. Render
  return <div>...</div>;
};
```

### Import Order

1. External dependencies (React, libraries)
2. Internal modules (contexts, services, utils)
3. Types and interfaces
4. Styles (if applicable)

```typescript
// ✅ Good
import React from 'react';
import { Box } from '@mui/material';
import { useAuth } from '@/contexts/useAuth';
import type { User } from '@/types';
import './styles.css';

// ❌ Bad - mixed order
import type { User } from '@/types';
import React from 'react';
import './styles.css';
import { useAuth } from '@/contexts/useAuth';
```

## TypeScript Best Practices

### Type Annotations

```typescript
// ✅ Good - explicit return types for functions
function getUser(id: number): Promise<User> {
  return api.get(`/users/${id}`);
}

// ✅ Good - type parameters
const users: User[] = [];
const userMap: Map<number, User> = new Map();

// ❌ Bad - implicit any
function getUser(id) { // Missing type
  return api.get(`/users/${id}`);
}
```

### Avoid `any`

```typescript
// ✅ Good - use specific types
function processData(data: unknown): ProcessedData {
  if (typeof data === 'object' && data !== null) {
    // Type guard
    return transformData(data as RawData);
  }
  throw new Error('Invalid data');
}

// ❌ Bad - using any
function processData(data: any): any {
  return transformData(data);
}
```

### Use Type Guards

```typescript
// ✅ Good - type guard
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}

if (isUser(data)) {
  console.log(data.name); // TypeScript knows data is User
}
```

### Prefer Interfaces for Objects

```typescript
// ✅ Good - interface for object shapes
interface User {
  id: number;
  name: string;
  email: string;
}

// ✅ Good - type for unions, intersections, primitives
type Status = 'active' | 'inactive' | 'pending';
type UserWithStatus = User & { status: Status };
```

## React Best Practices

### Functional Components

```typescript
// ✅ Good - functional component with TypeScript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      {onEdit && <button onClick={() => onEdit(user)}>Edit</button>}
    </div>
  );
};
```

### Hooks

```typescript
// ✅ Good - custom hooks
function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}
```

### Event Handlers

```typescript
// ✅ Good - typed event handlers
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // ...
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

## Error Handling

### Try-Catch Blocks

```typescript
// ✅ Good - proper error handling
async function fetchData(): Promise<Data> {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      Logger.error('API error:', { error });
      throw new AppError('Failed to fetch data', error);
    }
    throw error;
  }
}
```

### Custom Errors

```typescript
// ✅ Good - custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

## Comments and Documentation

### JSDoc Comments

```typescript
/**
 * Fetches user data from the API
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to user data
 * @throws {NotFoundError} When user is not found
 */
async function getUser(userId: number): Promise<User> {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ Good - explain why, not what
// Use exponential backoff to avoid overwhelming the server
const delay = Math.pow(2, retryCount) * 1000;

// ❌ Bad - stating the obvious
// Set delay to 2 to the power of retryCount times 1000
const delay = Math.pow(2, retryCount) * 1000;
```

## Testing Standards

### Test File Naming

- Unit tests: `*.test.ts` or `*.spec.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### Test Structure

```typescript
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 1;
      const expectedUser = { id: 1, name: 'John' };
      
      // Act
      const user = await userService.getUser(userId);
      
      // Assert
      expect(user).toEqual(expectedUser);
    });

    it('should throw NotFoundError when user not found', async () => {
      // Arrange
      const userId = 999;
      
      // Act & Assert
      await expect(userService.getUser(userId))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
```

## Next Steps

- [Git Workflow](./git-workflow.md) - Branching and commits
- [Testing](./testing.md) - Testing guidelines
- [Contributing](./contributing.md) - Contribution guidelines

