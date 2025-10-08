# Client - React Frontend Application

The client application is a modern React-based dashboard for monitoring Cypress E2E tests, pull requests, and development tasks. Built with TypeScript, Vite, and Material-UI for a responsive and intuitive user experience.

## 🚀 Technology Stack

### Core Technologies

- **React 19.1.0** - Modern React with latest features
- **TypeScript 5.8.3** - Type-safe JavaScript development
- **Vite 7.1.5** - Fast build tool and development server
- **Material-UI (MUI) 7.3.1** - React component library
- **React Router DOM 7.7.1** - Client-side routing

### Key Libraries

- **SWR 2.3.4** - Data fetching and caching
- **Firebase 12.2.1** - Authentication and push notifications
- **Recharts 3.1.2** - Data visualization and charts
- **Notistack 3.0.2** - Snackbar notifications
- **Luxon 3.7.2** - Date and time manipulation
- **React Icons 5.5.0** - Icon library

## 📁 Project Structure

```
client/
├── public/                 # Static assets
│   ├── logo.png           # Application logo
│   ├── logo.svg           # SVG logo
│   └── sw.js              # Service worker for PWA
├── src/
│   ├── components/        # Reusable React components
│   │   ├── common/        # Common UI components
│   │   ├── layout/        # Layout components
│   │   └── widgets/       # Dashboard widgets
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── useAuth.ts
│   ├── hooks/             # Custom React hooks
│   │   └── useFCM.tsx     # Firebase Cloud Messaging
│   ├── pages/             # Page components
│   │   ├── AppsPage.tsx   # Applications dashboard
│   │   ├── E2EPage.tsx    # E2E test results
│   │   ├── LoginPage.tsx  # Authentication
│   │   ├── PullRequestsPage.tsx
│   │   └── TasksPage.tsx  # Task management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── firebase-config.ts # Firebase configuration
├── dist/                  # Built application (generated)
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── eslint.config.js       # ESLint configuration
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to Firebase project (for authentication)

### Installation

```bash
cd client
npm install
```

### Environment Variables

Create a `.env` file in the client directory:

```bash
# Firebase Configuration (handled by build scripts)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
```

### Available Scripts

#### Development

```bash
# Start development server
npm run dev

# Development server runs on http://localhost:5173
```

#### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

#### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint-fix
```

## 🏗️ Application Architecture

### Authentication Flow

- Firebase Authentication integration
- Protected routes with authentication context
- Automatic token refresh and session management
- Login/logout functionality with persistent sessions

### State Management

- **SWR** for server state management and caching
- **React Context** for authentication state
- **Local state** with React hooks for component state

### Routing Structure

```
/                    # Redirect to /e2e (authenticated users)
/login              # Authentication page
/e2e                # E2E test results dashboard
/pull-requests      # Pull request monitoring
/tasks              # Task management
/apps               # Application monitoring
```

### Component Architecture

- **Layout Components**: Header, navigation, responsive layout
- **Page Components**: Full-page views for each route
- **Widget Components**: Reusable dashboard widgets
- **Common Components**: Shared UI elements

## 🔧 Key Features

### Dashboard Pages

1. **E2E Test Results** (`/e2e`)
   - Real-time test execution monitoring
   - Test result visualization with charts
   - Historical test data and trends
   - Failed test analysis and reporting

2. **Pull Requests** (`/pull-requests`)
   - GitHub PR status monitoring
   - Approval workflow tracking
   - CI/CD pipeline status
   - Review assignment and notifications

3. **Tasks** (`/tasks`)
   - Development task management
   - Jira integration for ticket tracking
   - Task assignment and progress tracking
   - Manual testing reminders

4. **Applications** (`/apps`)
   - Application health monitoring
   - Deployment status tracking
   - Performance metrics
   - Service availability monitoring

### Real-time Features

- **Push Notifications**: Firebase Cloud Messaging integration
- **Live Updates**: SWR for automatic data refreshing
- **Progressive Web App**: Service worker for offline functionality
- **Responsive Design**: Mobile-first responsive layout

## 🎨 UI/UX Design

### Material-UI Theme

- Consistent design system with Material-UI
- Dark/light theme support (configurable)
- Responsive breakpoints for mobile/tablet/desktop
- Accessible components with ARIA support

### Data Visualization

- **Recharts** for interactive charts and graphs
- Real-time data updates in visualizations
- Customizable chart types (line, bar, pie, area)
- Export functionality for reports

## 🔐 Security Features

### Authentication

- Firebase Authentication with secure token handling
- Protected routes with authentication guards
- Automatic session management and refresh
- Secure logout with token cleanup

### Content Security

- Helmet.js integration for security headers
- XSS protection with secure content policies
- CSRF protection for form submissions
- Secure API communication with authentication headers

## 📱 Progressive Web App (PWA)

### Service Worker Features

- Offline functionality for cached pages
- Background sync for data updates
- Push notification handling
- App-like experience on mobile devices

### Installation

- Add to home screen functionality
- Native app-like behavior
- Offline-first architecture
- Background updates

## 🧪 Testing Strategy

### Current Status

- ESLint for code quality and consistency
- TypeScript for compile-time error checking
- TODO: Unit tests with Jest and React Testing Library
- TODO: Integration tests for key user flows
- TODO: E2E tests with Cypress

### Recommended Testing Setup

```bash
# TODO: Add testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

## 🚀 Deployment

### Build Process

1. TypeScript compilation and type checking
2. Vite build optimization and bundling
3. Firebase configuration injection
4. Static asset optimization
5. Service worker generation

### Production Build

```bash
# Create optimized production build
npm run build

# Output directory: dist/
# Ready for static hosting (Nginx, Apache, CDN)
```

### Environment-Specific Builds

- Development: Hot reload, source maps, debug tools
- Production: Minified, optimized, compressed assets
- Staging: Production-like with additional logging

## 🔧 Configuration Files

### TypeScript Configuration

- `tsconfig.json` - Main TypeScript config
- `tsconfig.app.json` - Application-specific settings
- `tsconfig.node.json` - Node.js environment settings

### Build Configuration

- `vite.config.ts` - Vite build and dev server settings
- `eslint.config.js` - Code linting rules
- `package.json` - Dependencies and scripts

## 📊 Performance Optimization

### Build Optimizations

- Code splitting with dynamic imports
- Tree shaking for unused code elimination
- Asset optimization and compression
- Bundle analysis and size monitoring

### Bundle Size Analysis

```bash
# Analyze current bundle size
npm run bundle-size

# Build with detailed bundle analysis
npm run build:analyze

# This will generate dist/bundle-analysis.html with interactive visualization
```

### CI/CD Bundle Size Monitoring

The GitHub Actions workflow automatically:

- Analyzes bundle size on every PR
- Compares with the main branch
- Fails if bundle size increases by more than 512KB or 10%
- Provides detailed size breakdown and optimization suggestions

### Runtime Optimizations

- SWR caching for API responses
- React.memo for component memoization
- Lazy loading for route components
- Image optimization and lazy loading

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

**Development Server Issues:**

```bash
# Check port availability (default: 5173)
lsof -ti:5173

# Restart with different port
npm run dev -- --port 3001
```

**TypeScript Errors:**

```bash
# Run type checking
npx tsc --noEmit

# Check TypeScript configuration
npx tsc --showConfig
```

### Getting Help

- Check browser console for runtime errors
- Review network tab for API communication issues
- Verify Firebase configuration and authentication
- Check environment variables and build configuration

## 🔄 Development Workflow

### Feature Development

1. Create feature branch from main
2. Set up development environment
3. Implement components with TypeScript
4. Test functionality in development server
5. Run linting and type checking
6. Create pull request with proper documentation

### Code Standards

- Follow React best practices and hooks patterns
- Use TypeScript for all new code
- Implement responsive design principles
- Write meaningful component and function names
- Add proper error handling and loading states

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Material-UI Documentation](https://mui.com/)
- [SWR Documentation](https://swr.vercel.app/)
- [Firebase Web Documentation](https://firebase.google.com/docs/web/setup)
