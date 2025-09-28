import { getTestConnection } from './database-connection';



export async function cleanupDatabase(): Promise<void> {
  const tables = [
    'todos',
    'notifications',
    'apps',
  ];
  return truncateTables(tables);
}

export async function truncateTables(tables: string[] = []): Promise<void> {
  try {
    // Use cypress_dashboard as the default database for cleanup operations
    const conn = await getTestConnection({
      database: process.env.MYSQL_DATABASE || 'cypress_dashboard',
    });
    // Disable foreign key checks temporarily
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    // Truncate each specified table
    for (const table of tables) {
      await conn.execute(`TRUNCATE TABLE ${table}`);
    }
    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Error during table truncation:', error);
    throw error;
  }
}

