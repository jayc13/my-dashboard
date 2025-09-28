import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ quiet: true });

/**
 * Shared database connection utility for E2E tests
 */
let testConnection: mysql.Connection | null = null;

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  charset?: string;
  timezone?: string;
}

/**
 * Get default database configuration from environment variables
 */
function getDefaultConfig(): mysql.ConnectionOptions {
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'test_db',
    charset: 'utf8mb4',
    timezone: '+00:00',
  };
}

/**
 * Get MySQL connection for tests
 * Uses a singleton pattern to reuse the same connection across test helpers
 */
export async function getTestConnection(config?: DatabaseConfig): Promise<mysql.Connection> {
  if (!testConnection) {
    const defaultConfig = getDefaultConfig();
    const finalConfig: mysql.ConnectionOptions = {
      ...defaultConfig,
      ...config,
    };

    try {
      testConnection = await mysql.createConnection(finalConfig);
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      throw error;
    }
  }

  return testConnection;
}

/**
 * Close the test database connection
 * Useful for cleanup in test teardown
 */
export async function closeTestConnection(): Promise<void> {
  if (testConnection) {
    try {
      await testConnection.end();
      testConnection = null;
    } catch (error) {
      console.error('Error closing test database connection:', error);
      throw error;
    }
  }
}

/**
 * Reset the connection (force reconnection on next getTestConnection call)
 * Useful when switching between different database configurations
 */
export function resetTestConnection(): void {
  testConnection = null;
}
