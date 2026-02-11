import fs from 'fs';
import { Logger } from '../utils/logger';
import path from 'path';
import * as dotenv from 'dotenv';
import { db } from './database';

// Load environment variables
dotenv.config({ quiet: true });

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations/mysql');

export async function runMigrations() {
  Logger.info('Running MySQL migrations...');

  // Ensure migrations table exists
  const createMigrationsTableSQL = `CREATE TABLE IF NOT EXISTS migrations
                                    (
                                        id     INT AUTO_INCREMENT PRIMARY KEY,
                                        name   VARCHAR(255) NOT NULL UNIQUE,
                                        run_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                    ) ENGINE = InnoDB
                                      DEFAULT CHARSET = utf8mb4
                                      COLLATE = utf8mb4_unicode_ci`;

  await db.exec(createMigrationsTableSQL);

  // Get already run migrations
  const appliedMigrationsRows = await db.all('SELECT name FROM migrations');
  const appliedMigrations: Set<string> = new Set(
    appliedMigrationsRows.map((row) => row.name),
  );

  for (const name of appliedMigrations) {
    Logger.info(`Already applied migration: ${name}`);
  }

  // Read migration files
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (!appliedMigrations.has(file)) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      try {
        await db.exec(sql);
        await db.run('INSERT INTO migrations (name) VALUES (?)', [file]);
        Logger.info(`Migration applied: ${file}`);
      } catch (error) {
        Logger.error(`Failed to apply migration ${file}:`, { error });
        throw error;
      }
    }
  }
}

// Run migrations immediately when this module is loaded as the main script
runMigrations()
  .then(() => {
    Logger.info('All migrations have been applied successfully.');
  })
  .catch((error) => {
    Logger.error('Migration failed:', { error });
  })
  .finally(() => {
    db.close();
  });
