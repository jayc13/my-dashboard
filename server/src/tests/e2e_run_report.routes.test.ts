/**
 * E2E Run Report Routes Tests
 * 
 * Tests for e2e run report routes
 */

import express from 'express';
import request from 'supertest';
import e2eRunReportRouter from '../routes/e2e_run_report';

// Mock dependencies
jest.mock('../controllers/e2e_run_report.controller');
jest.mock('../middleware/api_key_validator');

describe('E2E Run Report Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/e2e-run-report', e2eRunReportRouter);
  });

  it('should have GET / route', async () => {
    const response = await request(app).get('/e2e-run-report');
    expect(response.status).not.toBe(404);
  });

  it('should have GET /:id route', async () => {
    const response = await request(app).get('/e2e-run-report/1');
    expect(response.status).not.toBe(404);
  });

  it('should have POST / route', async () => {
    const response = await request(app).post('/e2e-run-report');
    expect(response.status).not.toBe(404);
  });

  it('should have PATCH /:id route', async () => {
    const response = await request(app).patch('/e2e-run-report/1');
    expect(response.status).not.toBe(404);
  });

  it('should have DELETE /:id route', async () => {
    const response = await request(app).delete('/e2e-run-report/1');
    expect(response.status).not.toBe(404);
  });
});

