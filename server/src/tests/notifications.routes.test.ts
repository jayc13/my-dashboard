/**
 * Notifications Routes Tests
 * 
 * Tests for notifications routes
 */

import express from 'express';
import request from 'supertest';
import notificationsRouter from '../routes/notifications';

// Mock dependencies
jest.mock('../controllers/notification.controller');
jest.mock('../middleware/api_key_validator');

describe('Notifications Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/notifications', notificationsRouter);
  });

  it('should have GET / route', async () => {
    const response = await request(app).get('/notifications');
    expect(response.status).not.toBe(404);
  });

  it('should have PATCH /:id/read route', async () => {
    const response = await request(app).patch('/notifications/1/read');
    expect(response.status).not.toBe(404);
  });

  it('should have DELETE /:id route', async () => {
    const response = await request(app).delete('/notifications/1');
    expect(response.status).not.toBe(404);
  });
});

