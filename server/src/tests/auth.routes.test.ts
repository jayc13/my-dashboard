/**
 * Auth Routes Tests
 * 
 * Tests for auth routes
 */

import express from 'express';
import request from 'supertest';
import authRouter from '../routes/auth';

// Mock dependencies
jest.mock('../controllers/auth.controller');
jest.mock('../middleware/bruteForceProtection');

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
  });

  it('should have POST /validate route', async () => {
    const response = await request(app).post('/auth/validate');
    expect(response.status).not.toBe(404);
  });
});

