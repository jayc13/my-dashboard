# Coding Standards

This document outlines the coding standards, conventions, and best practices for My Dashboard development to ensure consistent, maintainable, and high-quality code across all components.

## 🎯 General Principles

### Code Quality Standards
- **Readability**: Code should be self-documenting and easy to understand
- **Consistency**: Follow established patterns and conventions
- **Maintainability**: Write code that is easy to modify and extend
- **Performance**: Consider performance implications of implementation choices
- **Security**: Follow security best practices and validate all inputs

### SOLID Principles
- **Single Responsibility**: Each class/function should have one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for their base types
- **Interface Segregation**: Clients shouldn't depend on interfaces they don't use
- **Dependency Inversion**: Depend on abstractions, not concretions

## 📝 TypeScript Standards

### Type Definitions
```typescript
// ✅ Use explicit types for function parameters and return values
function processUser(user: User): Promise<ProcessedUser> {
  return processUserData(user);
}

// ✅ Use interfaces for object shapes
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// ✅ Use union types for limited options
type UserRole = 'admin' | 'user' | 'viewer';

// ❌ Avoid 'any' type
function badFunction(data: any): any {
  return data.whatever;
}
```

### Naming Conventions
```typescript
// ✅ Use PascalCase for types, interfaces, classes
interface UserProfile { }
class UserService { }
type ApiResponse<T> = { };

// ✅ Use camelCase for variables, functions, methods
const userName = 'john';
function getUserById(id: number) { }

// ✅ Use UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// ✅ Use descriptive names
const isUserAuthenticated = checkAuthStatus();
const userAuthenticationToken = generateToken();
```

### Error Handling
```typescript
// ✅ Use custom error classes
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ✅ Use Result pattern for operations that can fail
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: number): Promise<Result<User>> {
  try {
    const user = await userRepository.findById(id);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## ⚛️ React Standards

### Component Structure
```typescript
// ✅ Use functional components with TypeScript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    onEdit?.(user);
  }, [user, onEdit]);
  
  return (
    <div className={`user-card ${className || ''}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={handleEdit}>Edit</button>
      )}
    </div>
  );
}
```

### Hooks Usage
```typescript
// ✅ Custom hooks for reusable logic
function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchUser(userId)
      .then(result => {
        if (result.success) {
          setUser(result.data);
        } else {
          setError(result.error);
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
}

// ✅ Use useCallback for event handlers
const handleSubmit = useCallback((data: FormData) => {
  onSubmit(data);
}, [onSubmit]);

// ✅ Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return performExpensiveCalculation(data);
}, [data]);
```

### State Management
```typescript
// ✅ Use useReducer for complex state
interface AppState {
  user: User | null;
  notifications: Notification[];
  loading: boolean;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_LOADING'; payload: boolean };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}
```

## 🖥️ Node.js/Express Standards

### API Route Structure
```typescript
// ✅ Use proper route organization
// routes/users.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateUser } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();
const userController = new UserController();

router.get('/', requireAuth, userController.getUsers);
router.get('/:id', requireAuth, userController.getUserById);
router.post('/', requireAuth, validateUser, userController.createUser);
router.put('/:id', requireAuth, validateUser, userController.updateUser);
router.delete('/:id', requireAuth, userController.deleteUser);

export default router;
```

### Controller Pattern
```typescript
// ✅ Use controller classes for route handlers
export class UserController {
  constructor(private userService: UserService) {}
  
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };
  
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(Number(id));
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };
}
```

### Service Layer
```typescript
// ✅ Separate business logic into services
export class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
  
  async getUserById(id: number): Promise<User | null> {
    if (id <= 0) {
      throw new ValidationError('Invalid user ID', 'id');
    }
    
    return this.userRepository.findById(id);
  }
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validate business rules
    await this.validateUserData(userData);
    
    // Create user
    const user = await this.userRepository.create(userData);
    
    // Send welcome email (async)
    this.emailService.sendWelcomeEmail(user).catch(console.error);
    
    return user;
  }
  
  private async validateUserData(userData: CreateUserRequest): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('Email already exists', 'email');
    }
  }
}
```

## 🗄️ Database Standards

### Query Organization
```typescript
// ✅ Use repository pattern for database operations
export class UserRepository {
  constructor(private db: Database) {}
  
  async findAll(): Promise<User[]> {
    const query = `
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    
    const rows = await this.db.query(query);
    return rows.map(this.mapRowToUser);
  }
  
  async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE id = ? AND deleted_at IS NULL
    `;
    
    const rows = await this.db.query(query, [id]);
    return rows.length > 0 ? this.mapRowToUser(rows[0]) : null;
  }
  
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
```

### Migration Standards
```sql
-- ✅ Use descriptive migration names
-- migrations/001_create_users_table.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## 🧪 Testing Standards

### Unit Test Structure
```typescript
// ✅ Use descriptive test names and organize with describe blocks
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    
    userService = new UserService(mockUserRepository);
  });
  
  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = 1;
      const expectedUser = { id: 1, name: 'John', email: 'john@example.com' };
      mockUserRepository.findById.mockResolvedValue(expectedUser);
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
    
    it('should throw ValidationError when invalid ID is provided', async () => {
      // Arrange
      const invalidId = -1;
      
      // Act & Assert
      await expect(userService.getUserById(invalidId))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### Integration Test Structure
```typescript
// ✅ Test API endpoints with proper setup/teardown
describe('User API', () => {
  let app: Express;
  let testDb: Database;
  
  beforeAll(async () => {
    testDb = await createTestDatabase();
    app = createApp(testDb);
  });
  
  afterAll(async () => {
    await testDb.close();
  });
  
  beforeEach(async () => {
    await testDb.clear();
    await testDb.seed();
  });
  
  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-api-key', 'test-key')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });
});
```

## 📁 File Organization

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── __tests__/          # Test files
```

### Import Organization
```typescript
// ✅ Organize imports in this order:
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { Router } from 'express';
import axios from 'axios';

// 2. Internal modules (absolute paths)
import { UserService } from '@/services/UserService';
import { validateUser } from '@/middleware/validation';

// 3. Relative imports
import './UserCard.css';
import { formatDate } from '../utils/dateUtils';
```

## 🔧 Configuration Standards

### Environment Variables
```typescript
// ✅ Use typed environment configuration
interface Config {
  port: number;
  apiKey: string;
  databaseUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
}

function loadConfig(): Config {
  const requiredEnvVars = ['API_SECURITY_KEY', 'DATABASE_URL'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
  
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    apiKey: process.env.API_SECURITY_KEY!,
    databaseUrl: process.env.DATABASE_URL!,
    nodeEnv: (process.env.NODE_ENV as Config['nodeEnv']) || 'development',
  };
}
```

## 📋 Code Review Checklist

### Before Submitting PR
- [ ] Code follows TypeScript best practices
- [ ] All functions have proper type annotations
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] No console.log statements in production code
- [ ] No hardcoded values or secrets
- [ ] Documentation is updated

### During Code Review
- [ ] Logic is correct and efficient
- [ ] Code is readable and well-structured
- [ ] Security considerations are addressed
- [ ] Performance implications are considered
- [ ] Tests cover edge cases
- [ ] Error messages are helpful
- [ ] Code follows established patterns

These standards ensure consistent, maintainable, and high-quality code across the My Dashboard project. All team members should follow these guidelines and help enforce them during code reviews.
