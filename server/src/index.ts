import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { createE2EReportRouter } from './routes/e2e_report';
import { errorHandler } from './middleware/error_handler';
import { createJiraRouter } from './routes/jira';
import { createPullRequestRouter } from './routes/pull_requests';
import { createToDoListRouter } from './routes/to_do_list';
import { createNotificationRouter } from './routes/notifications';
import { createFCMRouter } from './routes/fcm';
import { createAuthRouter } from './routes/auth';
import { createAppsRouter } from './routes/apps';
import { createE2EManualRunsRouter } from './routes/e2e_manual_runs';
import { createInternalRouter } from './routes/internal';
import apiKeyValidator from './middleware/api_key_validator';

// Load environment variables
dotenv.config();

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

app.use('/api/e2e_reports', createE2EReportRouter());
app.use('/api/jira', createJiraRouter());
app.use('/api/pull_requests', createPullRequestRouter());
app.use('/api/to_do_list', createToDoListRouter());
app.use('/api/notifications', createNotificationRouter());
app.use('/api/fcm', createFCMRouter());
app.use('/api/apps', createAppsRouter());
app.use('/api/e2e_manual_runs', createE2EManualRunsRouter());
app.use('/api/internal', createInternalRouter());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;