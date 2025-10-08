/**
 * Pull Requests Routes Tests
 * 
 * Tests for pull requests routes
 */

import express from 'express';
import request from 'supertest';
import pullRequestsRouter from '../routes/pull_requests';

// Mock dependencies
jest.mock('../controllers/pull_request.controller');
jest.mock('../middleware/api_key_validator');

describe('Pull Requests Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/pull-requests', pullRequestsRouter);
  });

  it('should have GET / route', async () => {
    const response = await request(app).get('/pull-requests');
    expect(response.status).not.toBe(404);
  });

  it('should have GET /:id route', async () => {
    const response = await request(app).get('/pull-requests/1');
    expect(response.status).not.toBe(404);
  });

  it('should have POST / route', async () => {
    const response = await request(app).post('/pull-requests');
    expect(response.status).not.toBe(404);
  });

  it('should have DELETE /:id route', async () => {
    const response = await request(app).delete('/pull-requests/1');
    expect(response.status).not.toBe(404);
  });
});

