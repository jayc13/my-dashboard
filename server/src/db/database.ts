/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from 'mysql2/promise';
import { Logger } from '../utils/logger';
import { getMySQLConnection } from './mysql';
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
    const connection = await getMySQLConnection();
    const [rows] = await connection.execute(sql, params);
    return rows as DatabaseRow[];
  }

  /**
     * Execute a query and return the first result
     */
  public async get(sql: string, params: any[] = []): Promise<DatabaseRow | undefined> {
    const connection = await getMySQLConnection();
    const [rows] = await connection.execute(sql, params);
    const rowsArray = rows as DatabaseRow[];
    return rowsArray.length > 0 ? rowsArray[0] : undefined;
  }

  /**
     * Execute a query that modifies data (INSERT, UPDATE, DELETE)
     */
  public async run(sql: string, params: any[] = []): Promise<DatabaseResult> {
    const connection = await getMySQLConnection();
    const [result] = await connection.execute(sql, params);
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
    const connection = await getMySQLConnection();
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement.trim());
      }
    }
  }

  /**
     * Begin a transaction
     */
  public async beginTransaction(): Promise<void> {
    const connection = await getMySQLConnection();
    await connection.beginTransaction();
  }

  /**
     * Commit a transaction
     */
  public async commit(): Promise<void> {
    const connection = await getMySQLConnection();
    await connection.commit();
  }

  /**
     * Rollback a transaction
     */
  public async rollback(): Promise<void> {
    const connection = await getMySQLConnection();
    await connection.rollback();
  }

  /**
     * Close the database connection
     */
  public async close(): Promise<void> {
    const connection = await getMySQLConnection();
    await connection.end();
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();
