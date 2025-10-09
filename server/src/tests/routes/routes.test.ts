/**
 * Routes Tests
 *
 * Tests for route definitions to ensure they are properly configured
 */

import { Router } from 'express';
import { createToDoListRouter } from '../../routes/to_do_list';
import { createAppsRouter } from '../../routes/apps';
import { createAuthRouter } from '../../routes/auth';
import { createE2EManualRunsRouter } from '../../routes/e2e_manual_runs';
import { createE2ERunReportRouter } from '../../routes/e2e_run_report';
import { createFCMRouter } from '../../routes/fcm';
import { createJiraRouter } from '../../routes/jira';
import { createNotificationRouter } from '../../routes/notifications';
import { createPullRequestRouter } from '../../routes/pull_requests';

// Mock controllers
jest.mock('../../controllers/to_do_list.controller', () => ({
  ToDoListController: jest.fn().mockImplementation(() => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('../../controllers/app.controller', () => ({
  AppController: jest.fn().mockImplementation(() => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('../../controllers/auth.controller', () => ({
  AuthController: jest.fn().mockImplementation(() => ({
    validateApiKey: jest.fn(),
  })),
}));

jest.mock('../../controllers/e2e_manual_run.controller', () => ({
  E2EManualRunController: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
}));

jest.mock('../../controllers/e2e_run_report.controller', () => ({
  getReport: jest.fn(),
  getLastProjectStatus: jest.fn(),
}));

jest.mock('../../controllers/fcm.controller', () => ({
  FCMController: jest.fn().mockImplementation(() => ({
    registerToken: jest.fn(),
  })),
}));

jest.mock('../../controllers/jira_controller', () => ({
  getManualQATasks: jest.fn(),
  getMyTickets: jest.fn(),
}));

jest.mock('../../controllers/notification.controller', () => ({
  NotificationController: {
    getAll: jest.fn(),
    markAsRead: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../controllers/pull_request.controller', () => ({
  PullRequestController: jest.fn().mockImplementation(() => ({
    listPullRequests: jest.fn(),
    addPullRequest: jest.fn(),
    getPullRequestDetails: jest.fn(),
    deletePullRequest: jest.fn(),
  })),
}));

jest.mock('../../middleware/bruteForceProtection', () => ({
  authRateLimit: jest.fn((req: any, res: any, next: any) => next()),
  authSlowDown: jest.fn((req: any, res: any, next: any) => next()),
  securityHeaders: jest.fn((req: any, res: any, next: any) => next()),
  bruteForceProtection: {
    checkBlocked: jest.fn((req: any, res: any, next: any) => next()),
  },
}));

describe('Routes', () => {
  describe('ToDoList Routes', () => {
    it('should create router with all routes', () => {
      const router = createToDoListRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function); // Router is a function
    });

    it('should have GET / route', () => {
      const router = createToDoListRouter();
      const routes = (router as any).stack;
      const getRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.get
      );
      expect(getRoute).toBeDefined();
    });

    it('should have GET /:id route', () => {
      const router = createToDoListRouter();
      const routes = (router as any).stack;
      const getByIdRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.get
      );
      expect(getByIdRoute).toBeDefined();
    });

    it('should have POST / route', () => {
      const router = createToDoListRouter();
      const routes = (router as any).stack;
      const postRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.post
      );
      expect(postRoute).toBeDefined();
    });

    it('should have PUT /:id route', () => {
      const router = createToDoListRouter();
      const routes = (router as any).stack;
      const putRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.put
      );
      expect(putRoute).toBeDefined();
    });

    it('should have DELETE /:id route', () => {
      const router = createToDoListRouter();
      const routes = (router as any).stack;
      const deleteRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.delete
      );
      expect(deleteRoute).toBeDefined();
    });
  });

  describe('Apps Routes', () => {
    it('should create router with all routes', () => {
      const router = createAppsRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function);
    });

    it('should have GET / route', () => {
      const router = createAppsRouter();
      const routes = (router as any).stack;
      const getRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.get
      );
      expect(getRoute).toBeDefined();
    });

    it('should have GET /:id route', () => {
      const router = createAppsRouter();
      const routes = (router as any).stack;
      const getByIdRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.get
      );
      expect(getByIdRoute).toBeDefined();
    });

    it('should have POST / route', () => {
      const router = createAppsRouter();
      const routes = (router as any).stack;
      const postRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.post
      );
      expect(postRoute).toBeDefined();
    });

    it('should have PUT /:id route', () => {
      const router = createAppsRouter();
      const routes = (router as any).stack;
      const putRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.put
      );
      expect(putRoute).toBeDefined();
    });

    it('should have DELETE /:id route', () => {
      const router = createAppsRouter();
      const routes = (router as any).stack;
      const deleteRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.delete
      );
      expect(deleteRoute).toBeDefined();
    });
  });

  describe('Auth Routes', () => {
    it('should create router with all routes', () => {
      const router = createAuthRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function);
    });

    it('should have POST /validate route', () => {
      const router = createAuthRouter();
      const routes = (router as any).stack;
      const postRoute = routes.find((r: any) =>
        r.route && r.route.path === '/validate' && r.route.methods.post
      );
      expect(postRoute).toBeDefined();
    });

    it('should apply security middleware', () => {
      const router = createAuthRouter();
      const middlewares = (router as any).stack;
      // Should have middleware layers (securityHeaders, authRateLimit, etc.)
      expect(middlewares.length).toBeGreaterThan(0);
    });
  });

  describe('E2E Manual Runs Routes', () => {
    it('should create router with all routes', () => {
      const router = createE2EManualRunsRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function);
    });

    it('should have POST / route', () => {
      const router = createE2EManualRunsRouter();
      const routes = (router as any).stack;
      const postRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.post
      );
      expect(postRoute).toBeDefined();
    });
  });

  describe('E2E Run Report Routes', () => {
    it('should create router with all routes', () => {
      const router = createE2ERunReportRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function);
    });

    it('should have GET / route', () => {
      const router = createE2ERunReportRouter();
      const routes = (router as any).stack;
      const getRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.get
      );
      expect(getRoute).toBeDefined();
    });

    it('should have GET /:summaryId/:appId route', () => {
      const router = createE2ERunReportRouter();
      const routes = (router as any).stack;
      const getRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:summaryId/:appId' && r.route.methods.get
      );
      expect(getRoute).toBeDefined();
    });
  });

  describe('FCM Routes', () => {
    it('should create router with all routes', () => {
      const router = createFCMRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function);
    });

    it('should have POST /register-token route', () => {
      const router = createFCMRouter();
      const routes = (router as any).stack;
      const postRoute = routes.find((r: any) =>
        r.route && r.route.path === '/register-token' && r.route.methods.post
      );
      expect(postRoute).toBeDefined();
    });
  });

  describe('Jira Routes', () => {
    it('should create router with all routes', () => {
      const router = createJiraRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function);
    });

    it('should have GET /manual_qa route', () => {
      const router = createJiraRouter();
      const routes = (router as any).stack;
      const getRoute = routes.find((r: any) =>
        r.route && r.route.path === '/manual_qa' && r.route.methods.get
      );
      expect(getRoute).toBeDefined();
    });

    it('should have GET /my_tickets route', () => {
      const router = createJiraRouter();
      const routes = (router as any).stack;
      const getRoute = routes.find((r: any) =>
        r.route && r.route.path === '/my_tickets' && r.route.methods.get
      );
      expect(getRoute).toBeDefined();
    });
  });

  describe('Notification Routes', () => {
    it('should create router with all routes', () => {
      const router = createNotificationRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function);
    });

    it('should have GET / route', () => {
      const router = createNotificationRouter();
      const routes = (router as any).stack;
      const getRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.get
      );
      expect(getRoute).toBeDefined();
    });

    it('should have PATCH /:id/read route', () => {
      const router = createNotificationRouter();
      const routes = (router as any).stack;
      const patchRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id/read' && r.route.methods.patch
      );
      expect(patchRoute).toBeDefined();
    });

    it('should have DELETE /:id route', () => {
      const router = createNotificationRouter();
      const routes = (router as any).stack;
      const deleteRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.delete
      );
      expect(deleteRoute).toBeDefined();
    });
  });

  describe('Pull Request Routes', () => {
    it('should create router with all routes', () => {
      const router = createPullRequestRouter();
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Function);
    });

    it('should have GET / route', () => {
      const router = createPullRequestRouter();
      const routes = (router as any).stack;
      const getRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.get
      );
      expect(getRoute).toBeDefined();
    });

    it('should have POST / route', () => {
      const router = createPullRequestRouter();
      const routes = (router as any).stack;
      const postRoute = routes.find((r: any) =>
        r.route && r.route.path === '/' && r.route.methods.post
      );
      expect(postRoute).toBeDefined();
    });

    it('should have GET /:id route', () => {
      const router = createPullRequestRouter();
      const routes = (router as any).stack;
      const getByIdRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.get
      );
      expect(getByIdRoute).toBeDefined();
    });

    it('should have DELETE /:id route', () => {
      const router = createPullRequestRouter();
      const routes = (router as any).stack;
      const deleteRoute = routes.find((r: any) =>
        r.route && r.route.path === '/:id' && r.route.methods.delete
      );
      expect(deleteRoute).toBeDefined();
    });
  });
});

