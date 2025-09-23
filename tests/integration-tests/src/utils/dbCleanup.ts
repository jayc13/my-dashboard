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

    console.log(`Connecting to test MySQL database: ${config.host}:${config.port}/${config.database}`);

    try {
      connection = await mysql.createConnection(config);
      console.log('Test MySQL connection established successfully');
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
    console.log('Test MySQL connection closed');
  }
}

/**
 * Utility to clean up the test database after each suite
 * Truncates all todo-related tables to ensure clean state for tests
 */
export async function cleanupDatabase(): Promise<void> {
  try {
    const conn = await getTestConnection();

    // Disable foreign key checks temporarily to avoid constraint issues
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate todos table
    await conn.execute('TRUNCATE TABLE todos');

    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Error during database cleanup:', error);
    throw error;
  }
}

/**
 * Utility to truncate specific todo tables
 * @param tables - Array of table names to truncate (defaults to ['todos'])
 */
export async function truncateTodoTables(tables: string[] = ['todos']): Promise<void> {
  try {
    const conn = await getTestConnection();

    console.log(`Truncating tables: ${tables.join(', ')}`);

    // Disable foreign key checks temporarily
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate each specified table
    for (const table of tables) {
      await conn.execute(`TRUNCATE TABLE ${table}`);
      console.log(`Truncated ${table} table`);
    }

    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Table truncation completed successfully');
  } catch (error) {
    console.error('Error during table truncation:', error);
    throw error;
  }
}

