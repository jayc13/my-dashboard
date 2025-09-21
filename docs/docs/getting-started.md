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
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

**Documentation:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Serve production build

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
