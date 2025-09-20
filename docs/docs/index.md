# Project Documentation

Welcome to the project documentation!

## 📚 Documentation Index

### Development Standards
- **[Conventional Commits Guide](./conventional-commits.md)** - Standards for commit message formatting
- **[Pull Request Guide](./pull-request-guide.md)** - Complete guide for creating and reviewing PRs

### Quick Reference

#### Commit Message Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Common Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```bash
feat(client): add user authentication modal

Implement login/signup modal with form validation and error handling.
Includes integration with authentication API and session management.

Closes #123
```

#### Branch Naming Convention
```
<type>/<short-description>
```

**Examples:**
- `feat/user-dashboard`
- `fix/memory-leak`
- `docs/api-guide`
- `refactor/error-handling`

#### PR Title Format
Follow the same format as commit messages:
```
feat(server): implement rate limiting middleware
fix(client): resolve hydration mismatch in SSR
docs: update deployment guide
```

## 🏗️ Project Structure

This project is organized into several main components:

### `/client`
React frontend application
- TypeScript + Vite
- Component-based architecture
- Responsive design

### `/server`
Node.js backend API
- Express.js framework
- RESTful API design
- Database integration

### `/cron`
Scheduled job services
- Background task processing
- Automated maintenance
- Report generation

### `/scripts`
Utility and deployment scripts
- Build automation
- Database migrations
- Deployment helpers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Development Workflow

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd cypress-dashboard
   npm install
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feat/your-feature-name
   ```
   Then create a PR using the provided template.

## 📋 Contribution Guidelines

### Before Contributing
- Read the [Conventional Commits Guide](./conventional-commits.md)
- Review the [Pull Request Guide](./pull-request-guide.md)
- Check existing issues and PRs to avoid duplicates
- Discuss major changes in an issue first

### Code Standards
- Follow existing code style and conventions
- Write meaningful commit messages
- Include tests for new functionality
- Update documentation for API changes
- Ensure all CI checks pass

### Review Process
1. Self-review your changes
2. Ensure all tests pass
3. Create PR with detailed description
4. Address reviewer feedback promptly
5. Merge after approval and passing checks

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests for specific component
npm run test:client
npm run test:server
npm run test:cron

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- Code coverage only goes up
- Write unit tests for all new functions
- Add integration tests for API endpoints
- Include E2E tests for critical user flows

## 🔧 Development Tools

### Git Hooks
The project uses Husky for git hooks:
- **pre-commit**: Runs linting and formatting
- **commit-msg**: Validates commit message format
- **pre-push**: Runs unit tests before pushing

### Code Quality Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Jest**: Unit testing
- **Commitlint**: Commit message validation

## 🆘 Getting Help

### Resources
- Check existing documentation first
- Search through issues and discussions
- Review similar PRs for examples
- Ask questions in team channels

### Contact
- Create an issue for bugs or feature requests
- Use discussions for general questions
- Tag relevant team members for urgent issues

## 📝 Documentation Standards

### Writing Guidelines
- Use clear, concise language
- Include code examples where helpful
- Keep documentation up to date with code changes
- Use consistent formatting and structure

### Documentation Types
- **API Documentation**: Generated from code comments
- **User Guides**: Step-by-step instructions
- **Developer Guides**: Technical implementation details
- **Architecture Decisions**: Record important design choices

## 🔄 Continuous Improvement

This documentation is a living resource that should evolve with the project. Please:
- Suggest improvements through issues or PRs
- Update documentation when making code changes
- Share feedback on clarity and usefulness
- Contribute examples and best practices
