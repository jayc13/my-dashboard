/**
 * Routes Tests
 * 
 * Tests for route definitions to ensure they are properly configured
 */

import { Router } from 'express';
import { createToDoListRouter } from '../routes/to_do_list';

// Mock controllers
jest.mock('../controllers/to_do_list.controller', () => ({
  ToDoListController: jest.fn().mockImplementation(() => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
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
});

