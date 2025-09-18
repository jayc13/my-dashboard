import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

let connection: mysql.Connection | null = null;

/**
 * Initializes and returns a MySQL database connection.
 * If the connection already exists, it returns the existing instance.
 *
 * @returns {Promise<mysql.Connection>} The MySQL database connection.
 */
export async function getMySQLConnection(): Promise<mysql.Connection> {
  if (!connection) {
    dotenv.config({ quiet: true });
        
    const config: mysql.ConnectionOptions = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'cypress_dashboard',
      charset: 'utf8mb4',
      timezone: '+00:00',
    };

    console.log(`Connecting to MySQL database: ${config.host}:${config.port}/${config.database}`);
        
    try {
      connection = await mysql.createConnection(config);
      console.log('MySQL connection established successfully');
    } catch (error) {
      console.error('Failed to connect to MySQL:', error);
      throw error;
    }
  }
    
  return connection;
}

/**
 * Closes the MySQL database connection.
 */
export async function closeMySQLConnection(): Promise<void> {
  if (connection) {
    await connection.end();
    connection = null;
    console.log('MySQL connection closed');
  }
}

/**
 * Tests the MySQL connection.
 */
export async function testMySQLConnection(): Promise<boolean> {
  try {
    const conn = await getMySQLConnection();
    await conn.ping();
    console.log('MySQL connection test successful');
    return true;
  } catch (error) {
    console.error('MySQL connection test failed:', error);
    return false;
  }
}
