import mysql from 'mysql2/promise';
import { Logger } from '../utils/logger';
import * as dotenv from 'dotenv';

let pool: mysql.Pool | null = null;

/**
 * Initializes and returns a MySQL connection pool.
 * If the pool already exists, it returns the existing instance.
 *
 * @returns {mysql.Pool} The MySQL connection pool.
 */
export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    dotenv.config({ quiet: true });

    const config: mysql.PoolOptions = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'cypress_dashboard',
      charset: 'utf8mb4',
      timezone: '+00:00',
      // Connection pool settings
      connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10'),
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

    Logger.info(`Creating MySQL connection pool: ${config.host}:${config.port}/${config.database}`);

    try {
      pool = mysql.createPool(config);
      Logger.info('MySQL connection pool created successfully');
    } catch (error) {
      Logger.error('Failed to create MySQL connection pool:', { error });
      throw error;
    }
  }

  return pool;
}

/**
 * Gets a connection from the pool.
 * This is the recommended way to interact with the database.
 * The connection will be automatically returned to the pool when done.
 *
 * @returns {Promise<mysql.PoolConnection>} A connection from the pool.
 */
export async function getMySQLConnection(): Promise<mysql.PoolConnection> {
  const pool = getMySQLPool();
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    Logger.error('Failed to get connection from pool:', { error });
    throw error;
  }
}

/**
 * Closes the MySQL connection pool.
 */
export async function closeMySQLConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    Logger.info('MySQL connection pool closed');
  }
}

/**
 * Tests the MySQL connection pool.
 */
export async function testMySQLConnection(): Promise<boolean> {
  try {
    const pool = getMySQLPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    Logger.info('MySQL connection test successful');
    return true;
  } catch (error) {
    Logger.error('MySQL connection test failed:', { error });
    return false;
  }
}
