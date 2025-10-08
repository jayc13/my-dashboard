/**
 * Apps Routes Tests
 * 
 * Tests for apps routes
 */

import express from 'express';
import request from 'supertest';
import appsRouter from '../routes/apps';

// Mock dependencies
jest.mock('../controllers/app.controller');
jest.mock('../middleware/api_key_validator');

describe('Apps Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/apps', appsRouter);
  });

  it('should have GET / route', async () => {
    const response = await request(app).get('/apps');
    expect(response.status).not.toBe(404);
  });

  it('should have GET /:id route', async () => {
    const response = await request(app).get('/apps/1');
    expect(response.status).not.toBe(404);
  });

  it('should have GET /code/:code route', async () => {
    const response = await request(app).get('/apps/code/test-app');
    expect(response.status).not.toBe(404);
  });
});

