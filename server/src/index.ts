import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import {
  errorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
} from './middleware/error_handler';
import { createJiraRouter } from './routes/jira';
import { createPullRequestRouter } from './routes/pull_requests';
import { createToDoListRouter } from './routes/to_do_list';
import { createNotificationRouter } from './routes/notifications';
import { createFCMRouter } from './routes/fcm';
import { createAuthRouter } from './routes/auth';
import { createAppsRouter } from './routes/apps';
import { createE2EManualRunsRouter } from './routes/e2e_manual_runs';
import { testMySQLConnection } from './db/mysql';
import { startProcessor } from './processors/start-processor';
import { createE2ERunReportRouter } from './routes/e2e_run_report';
import apiKeyValidator from './middleware/api_key_validator';
import { NotFoundError } from './errors/AppError';

// Load environment variables
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.use(cors({ origin: '*', methods: '*', allowedHeaders: '*' }));

// Limit JSON payload size to prevent DoS attacks
app.use(express.json({ limit: '10mb' }));

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', createAuthRouter()); // Auth routes don't need API key validation

// Apply API key validation to all other routes
app.use('/api', apiKeyValidator);

app.use('/api/e2e_run_report', createE2ERunReportRouter());
app.use('/api/jira', createJiraRouter());
app.use('/api/pull_requests', createPullRequestRouter());
app.use('/api/to_do_list', createToDoListRouter());
app.use('/api/notifications', createNotificationRouter());
app.use('/api/fcm', createFCMRouter());
app.use('/api/apps', createAppsRouter());
app.use('/api/e2e_manual_runs', createE2EManualRunsRouter());

// Health check endpoint
app.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbConnected = await testMySQLConnection().catch(() => false);

    res.status(200).json({
      success: true,
      status: dbConnected ? 'ok' : 'degraded',
      service: 'My Dashboard Server',
      dbConnected,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    next(error);
  }
});

// 404 handler for undefined routes
// This must be placed after all other routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('Route', req.path));
});

// Global error handling middleware
// This must be the last middleware
app.use(errorHandler);

// Register global error handlers
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server
  // eslint-disable-next-line no-process-exit
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

// Start all processors (E2E Report and Notification)
startProcessor().catch((err: Error) => {
  console.error('Failed to start processors:', err);
  // Don't exit the process, just log the error
});

export default app;