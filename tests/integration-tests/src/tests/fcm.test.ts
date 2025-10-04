import { TestHelpers } from '@utils/test-helpers';
import { closeTestConnection, truncateTables } from '@utils/dbHelper';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

describe('FCM API Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;
  let dbConnection: mysql.Connection;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();

    // Create database connection for verification
    dbConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'cypress_dashboard',
      charset: 'utf8mb4',
      timezone: '+00:00',
    });
  });

  afterAll(async () => {
    await truncateTables(['device_tokens']);
    if (dbConnection) {
      await dbConnection.end();
    }
    await closeTestConnection();
  });

  beforeEach(async () => {
    // Clean up device tokens before each test
    await truncateTables(['device_tokens']);
  });

  describe('POST /api/fcm/register-token', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      const tokenData = {
        token: 'test-device-token-123',
      };

      try {
        await httpClient.postJson('/api/fcm/register-token', tokenData);
        fail('Expected request to fail with 401');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 401');

        const response = await httpClient.post('/api/fcm/register-token', tokenData);
        expect(response.status).toBe(401);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return 400 when token is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.postJson('/api/fcm/register-token', {}, {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');

        const response = await httpClient.post('/api/fcm/register-token', {}, {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(400);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should register a new device token successfully', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomToken = `test-token-${testHelpers.generateRandomString(16)}`;

      const response = await httpClient.postJson('/api/fcm/register-token', {
        token: randomToken,
      }, {
        'x-api-key': apiKey,
      });

      testHelpers.validateResponseStructure(response, ['message']);
      expect(response.message).toBe('Device token registered successfully');

      // Verify token was saved to database
      const [rows] = await dbConnection.execute(
        'SELECT * FROM device_tokens WHERE token = ?',
        [randomToken],
      );
      const tokens = rows as any[];
      expect(tokens.length).toBe(1);
      expect(tokens[0].token).toBe(randomToken);
    });

    it('should update existing token when registering duplicate', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomToken = `test-token-${testHelpers.generateRandomString(16)}`;

      // Register token first time
      const firstResponse = await httpClient.postJson('/api/fcm/register-token', {
        token: randomToken,
      }, {
        'x-api-key': apiKey,
      });

      expect(firstResponse.message).toBe('Device token registered successfully');

      // Get the initial last_used timestamp
      const [firstRows] = await dbConnection.execute(
        'SELECT last_used FROM device_tokens WHERE token = ?',
        [randomToken],
      );
      const firstTokens = firstRows as any[];
      const firstLastUsed = firstTokens[0].last_used;

      // Wait a moment to ensure timestamp difference
      await testHelpers.sleep(1000);

      // Register same token again
      const secondResponse = await httpClient.postJson('/api/fcm/register-token', {
        token: randomToken,
      }, {
        'x-api-key': apiKey,
      });

      expect(secondResponse.message).toBe('Device token registered successfully');

      // Verify only one token exists and last_used was updated
      const [secondRows] = await dbConnection.execute(
        'SELECT * FROM device_tokens WHERE token = ?',
        [randomToken],
      );
      const secondTokens = secondRows as any[];
      expect(secondTokens.length).toBe(1);
      
      const secondLastUsed = secondTokens[0].last_used;
      expect(new Date(secondLastUsed).getTime()).toBeGreaterThanOrEqual(new Date(firstLastUsed).getTime());
    });

    it('should handle multiple different tokens', async () => {
      const httpClient = testHelpers.getHttpClient();
      const tokens = [
        `test-token-${testHelpers.generateRandomString(16)}`,
        `test-token-${testHelpers.generateRandomString(16)}`,
        `test-token-${testHelpers.generateRandomString(16)}`,
      ];

      // Register all tokens
      for (const token of tokens) {
        const response = await httpClient.postJson('/api/fcm/register-token', {
          token,
        }, {
          'x-api-key': apiKey,
        });

        expect(response.message).toBe('Device token registered successfully');
      }

      // Verify all tokens are in database
      const [rows] = await dbConnection.execute(
        'SELECT token FROM device_tokens WHERE token IN (?, ?, ?)',
        tokens,
      );
      const dbTokens = rows as any[];
      expect(dbTokens.length).toBe(3);

      const dbTokenValues = dbTokens.map((row: any) => row.token);
      tokens.forEach(token => {
        expect(dbTokenValues).toContain(token);
      });
    });

    it('should handle empty string token', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.postJson('/api/fcm/register-token', {
          token: '',
        }, {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');

        const response = await httpClient.post('/api/fcm/register-token', {
          token: '',
        }, {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(400);
      }
    });

    it('should handle very long token strings', async () => {
      const httpClient = testHelpers.getHttpClient();
      // FCM tokens can be quite long (up to 255 characters based on schema)
      const longToken = `test-token-${testHelpers.generateRandomString(200)}`;

      const response = await httpClient.postJson('/api/fcm/register-token', {
        token: longToken,
      }, {
        'x-api-key': apiKey,
      });

      expect(response.message).toBe('Device token registered successfully');

      // Verify token was saved
      const [rows] = await dbConnection.execute(
        'SELECT * FROM device_tokens WHERE token = ?',
        [longToken],
      );
      const tokens = rows as any[];
      expect(tokens.length).toBe(1);
      expect(tokens[0].token).toBe(longToken);
    });

    it('should validate token field structure', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomToken = `test-token-${testHelpers.generateRandomString(16)}`;

      await httpClient.postJson('/api/fcm/register-token', {
        token: randomToken,
      }, {
        'x-api-key': apiKey,
      });

      // Verify database record has all expected fields
      const [rows] = await dbConnection.execute(
        'SELECT id, token, created_at, last_used FROM device_tokens WHERE token = ?',
        [randomToken],
      );
      const tokens = rows as any[];
      expect(tokens.length).toBe(1);

      const tokenRecord = tokens[0];
      expect(tokenRecord).toHaveProperty('id');
      expect(tokenRecord).toHaveProperty('token');
      expect(tokenRecord).toHaveProperty('created_at');
      expect(tokenRecord).toHaveProperty('last_used');
      expect(typeof tokenRecord.id).toBe('number');
      expect(tokenRecord.token).toBe(randomToken);
    });
  });

  describe('FCM Token Management', () => {
    it('should maintain unique constraint on tokens', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomToken = `test-token-${testHelpers.generateRandomString(16)}`;

      // Register token twice
      await httpClient.postJson('/api/fcm/register-token', {
        token: randomToken,
      }, {
        'x-api-key': apiKey,
      });

      await httpClient.postJson('/api/fcm/register-token', {
        token: randomToken,
      }, {
        'x-api-key': apiKey,
      });

      // Verify only one record exists
      const [rows] = await dbConnection.execute(
        'SELECT COUNT(*) as count FROM device_tokens WHERE token = ?',
        [randomToken],
      );
      const result = rows as any[];
      expect(result[0].count).toBe(1);
    });
  });
});

