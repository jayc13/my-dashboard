import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ quiet: true });

let connection: mysql.Connection | null = null;

/**
 * Get MySQL connection for test database cleanup
 */
async function getTestConnection(): Promise<mysql.Connection> {
  if (!connection) {
    const config: mysql.ConnectionOptions = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'cypress_dashboard',
      charset: 'utf8mb4',
      timezone: '+00:00',
    };

    try {
      connection = await mysql.createConnection(config);
    } catch (error) {
      console.error('Failed to connect to test MySQL:', error);
      throw error;
    }
  }

  return connection;
}

/**
 * Close the test database connection
 */
export async function closeTestConnection(): Promise<void> {
  if (connection) {
    await connection.end();
    connection = null;
  }
}

export async function cleanupDatabase(): Promise<void> {
  const tables = [
    'todos',
    'notifications',
    'apps',
    'device_tokens',
    'pull_requests',
    'e2e_manual_runs',
    'e2e_report_summaries',
    'e2e_report_details',
  ];
  return truncateTables(tables);
}

export async function truncateTables(tables: string[] = []): Promise<void> {
  try {
    const conn = await getTestConnection();
    // Disable foreign key checks temporarily
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    // Truncate each specified table
    for (const table of tables) {
      await conn.execute(`TRUNCATE TABLE ${table}`);
    }
    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  } catch {
    // Ignore errors during cleanup
  }
}

