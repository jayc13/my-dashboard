/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from 'mysql2/promise';
import { Logger } from '../utils/logger';
import { getMySQLPool, closeMySQLConnection } from './mysql';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export interface DatabaseResult {
    insertId?: number;
    affectedRows?: number;
    changedRows?: number;
}

export interface DatabaseRow {
    [key: string]: any;
}

/**
 * Database abstraction layer for MySQL
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private transactionConnection: mysql.PoolConnection | null = null;

  private constructor() {
    Logger.info('Using MySQL database');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
     * Execute a query and return all results
     */
  public async all(sql: string, params: any[] = []): Promise<DatabaseRow[]> {
    const pool = getMySQLPool();
    const [rows] = await pool.execute(sql, params);
    return rows as DatabaseRow[];
  }

  /**
     * Execute a query and return the first result
     */
  public async get(sql: string, params: any[] = []): Promise<DatabaseRow | undefined> {
    const pool = getMySQLPool();
    const [rows] = await pool.execute(sql, params);
    const rowsArray = rows as DatabaseRow[];
    return rowsArray.length > 0 ? rowsArray[0] : undefined;
  }

  /**
     * Execute a query that modifies data (INSERT, UPDATE, DELETE)
     */
  public async run(sql: string, params: any[] = []): Promise<DatabaseResult> {
    const pool = getMySQLPool();
    const [result] = await pool.execute(sql, params);
    const mysqlResult = result as mysql.ResultSetHeader;
    return {
      insertId: mysqlResult.insertId,
      affectedRows: mysqlResult.affectedRows,
    };
  }

  /**
     * Execute multiple SQL statements (for migrations)
     */
  public async exec(sql: string): Promise<void> {
    const pool = getMySQLPool();
    const connection = await pool.getConnection();
    try {
      // Split SQL into individual statements and execute them
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.execute(statement.trim());
        }
      }
    } finally {
      connection.release();
    }
  }

  /**
     * Begin a transaction
     */
  public async beginTransaction(): Promise<void> {
    if (this.transactionConnection) {
      throw new Error('Transaction already in progress');
    }
    const pool = getMySQLPool();
    this.transactionConnection = await pool.getConnection();
    await this.transactionConnection.beginTransaction();
  }

  /**
     * Commit a transaction
     */
  public async commit(): Promise<void> {
    if (!this.transactionConnection) {
      throw new Error('No transaction in progress');
    }
    try {
      await this.transactionConnection.commit();
    } finally {
      this.transactionConnection.release();
      this.transactionConnection = null;
    }
  }

  /**
     * Rollback a transaction
     */
  public async rollback(): Promise<void> {
    if (!this.transactionConnection) {
      throw new Error('No transaction in progress');
    }
    try {
      await this.transactionConnection.rollback();
    } finally {
      this.transactionConnection.release();
      this.transactionConnection = null;
    }
  }

  /**
     * Close the database connection pool
     */
  public async close(): Promise<void> {
    await closeMySQLConnection();
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();
