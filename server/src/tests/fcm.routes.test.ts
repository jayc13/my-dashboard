/**
 * FCM Routes Tests
 * 
 * Tests for FCM routes
 */

import express from 'express';
import request from 'supertest';
import fcmRouter from '../routes/fcm';

// Mock dependencies
jest.mock('../controllers/fcm.controller');
jest.mock('../middleware/api_key_validator');

describe('FCM Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/fcm', fcmRouter);
  });

  it('should have POST /register route', async () => {
    const response = await request(app).post('/fcm/register');
    expect(response.status).not.toBe(404);
  });

  it('should have POST /unregister route', async () => {
    const response = await request(app).post('/fcm/unregister');
    expect(response.status).not.toBe(404);
  });

  it('should have GET /tokens route', async () => {
    const response = await request(app).get('/fcm/tokens');
    expect(response.status).not.toBe(404);
  });
});

