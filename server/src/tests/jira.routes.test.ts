/**
 * Jira Routes Tests
 * 
 * Tests for jira routes
 */

import express from 'express';
import request from 'supertest';
import jiraRouter from '../routes/jira';

// Mock dependencies
jest.mock('../controllers/jira_controller');
jest.mock('../middleware/api_key_validator');

describe('Jira Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/jira', jiraRouter);
  });

  it('should have GET /issues route', async () => {
    const response = await request(app).get('/jira/issues');
    expect(response.status).not.toBe(404);
  });
});

