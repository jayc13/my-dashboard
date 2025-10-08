/**
 * E2E Manual Runs Routes Tests
 * 
 * Tests for e2e manual runs routes
 */

import express from 'express';
import request from 'supertest';
import e2eManualRunsRouter from '../routes/e2e_manual_runs';

// Mock dependencies
jest.mock('../controllers/e2e_manual_run.controller');
jest.mock('../middleware/api_key_validator');

describe('E2E Manual Runs Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/e2e-manual-runs', e2eManualRunsRouter);
  });

  it('should have POST / route', async () => {
    const response = await request(app).post('/e2e-manual-runs');
    expect(response.status).not.toBe(404);
  });
});

