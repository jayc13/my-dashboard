# Getting Started

Welcome to My Dashboard! This guide will help you set up your development environment and get started with the project.

## 🚀 Quick Setup

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** (comes with Node.js)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jayc13/my-dashboard.git
   cd my-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install

   # Install documentation dependencies
   cd ../docs
   npm install
   ```

3. **Set up environment variables**
   
   **Server (.env)**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```
   
   **Client (.env.local)**
   ```bash
   cd client
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Start the server
   cd server
   npm run dev

   # Terminal 2: Start the client
   cd client
   npm run dev

   # Terminal 3: Start the documentation (optional)
   cd docs
   npm start
   ```

## 🎯 What's Next?

- **[Development Overview](./development/overview.md)** - Learn about the development workflow
- **[API Overview](./api/overview.md)** - Understand the API structure
- **[Architecture Overview](./architecture/overview.md)** - Explore the system architecture

## 🔧 Development Tools

### Recommended IDE Setup
- **VS Code** with the following extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - GitLens

### Available Scripts

**Server:**
- `pnpm run dev --filter=server` - Start development server with hot reload
- `pnpm run build --filter=server` - Build for production
- `pnpm test --filter=server` - Run tests
- `pnpm run lint --filter=server` - Run ESLint

**Client:**
- `pnpm run dev --filter=client` - Start development server
- `pnpm run build --filter=client` - Build for production
- `pnpm run preview --filter=client` - Preview production build
- `pnpm test --filter=client` - Run tests
- `pnpm run lint --filter=client` - Run ESLint

**Documentation:**
- `pnpm start --filter=docs` - Start development server
- `pnpm run build --filter=docs` - Build for production
- `pnpm run serve --filter=docs` - Serve production build

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Node modules issues:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Build failures:**
- Check Node.js version: `node --version`
- Ensure all environment variables are set
- Check for TypeScript errors: `npm run type-check`

## 📚 Additional Resources

- **[GitHub Repository](https://github.com/jayc13/my-dashboard)**
- **[API Documentation](./api/overview.md)**
- **[Contributing Guidelines](./development/overview.md)**

Need help? Check the [Development Overview](./development/overview.md) for more detailed information.
