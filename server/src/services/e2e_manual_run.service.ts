import { db } from '../db/database';
import { AppService } from './app.service';
import { CircleCIService } from './circle_ci.service';

export interface E2EManualRun {
    id?: number;
    app_id: number;
    pipeline_id: string;
    created_at?: string;
}

export interface E2EManualRunInput {
    app_id: number;
}

export interface E2EManualRunOptions {
    filter?: {
        from?: string; // ISO date string
        to?: string;   // ISO date string
    };
}

export class E2EManualRunService {
  static async getAll(): Promise<E2EManualRun[]> {
    try {
      const rows = await db.all('SELECT * FROM e2e_manual_runs ORDER BY created_at DESC');
      return rows as E2EManualRun[];
    } catch (error) {
      console.error('Error fetching E2E manual runs:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<E2EManualRun | undefined> {
    try {
      const row = await db.get('SELECT * FROM e2e_manual_runs WHERE id = ?', [id]);
      return row as E2EManualRun | undefined;
    } catch (error) {
      console.error('Error fetching E2E manual run by id:', error);
      throw error;
    }
  }

  static async getByAppId(appId: number, options?: E2EManualRunOptions): Promise<E2EManualRun[]> {
    try {
      let query = 'SELECT * FROM e2e_manual_runs WHERE app_id = ?';
      const params: (number | string)[] = [appId];

      // Add date range filtering if provided
      if (options?.filter?.from) {
        query += ' AND DATE(created_at) >= DATE(?)';
        params.push(options.filter.from);
      }

      if (options?.filter?.to) {
        query += ' AND DATE(created_at) <= DATE(?)';
        params.push(options.filter.to);
      }

      query += ' ORDER BY created_at DESC';

      const rows = await db.all(query, params);
      return rows as E2EManualRun[];
    } catch (error) {
      console.error('Error fetching E2E manual runs by app id:', error);
      throw error;
    }
  }

  static async getByAppCode(appCode: string, options?: E2EManualRunOptions): Promise<E2EManualRun[]> {
    // First, get the app by code
    const app = await AppService.getByCode(appCode);
    if (!app || !app.id) {
      return []; // Return empty array if app not found
    }

    // Then get the runs for that app with the same options
    return this.getByAppId(app.id, options);
  }

  static async create(input: E2EManualRunInput): Promise<E2EManualRun> {
    try {
      // Get App to ensure it exists
      const app = await AppService.getById(input.app_id);
      if (!app) {
        throw new Error(`App with id ${input.app_id} not found`);
      }

      if (!app.e2e_trigger_configuration) {
        throw new Error(`App with id ${input.app_id} does not have e2e_trigger_configuration set`);
      }

      // Trigger Circle CI E2E runs
      const {
        id: pipeline_id,
      } = await CircleCIService.triggerE2ERuns(app.e2e_trigger_configuration);

      const result = await db.run(
        'INSERT INTO e2e_manual_runs (app_id, pipeline_id) VALUES (?, ?)',
        [input.app_id, pipeline_id],
      );

      // Fetch the newly created record
      const row = await db.get(
        'SELECT * FROM e2e_manual_runs WHERE id = ?',
        [result.insertId],
      );

      return row as E2EManualRun;
    } catch (error) {
      console.error('Error creating E2E manual run:', error);
      throw error;
    }
  }

  static async update(id: number, input: Partial<E2EManualRunInput>): Promise<boolean> {
    try {
      const fields = [];
      const values = [];

      if (input.app_id !== undefined) {
        fields.push('app_id = ?');
        values.push(input.app_id);
      }

      if (fields.length === 0) {
        return false;
      }

      values.push(id);

      const result = await db.run(
        `UPDATE e2e_manual_runs SET ${fields.join(', ')} WHERE id = ?`,
        values,
      );

      return (result.affectedRows || 0) > 0;
    } catch (error) {
      console.error('Error updating E2E manual run:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db.run('DELETE FROM e2e_manual_runs WHERE id = ?', [id]);
      return (result.affectedRows || 0) > 0;
    } catch (error) {
      console.error('Error deleting E2E manual run:', error);
      throw error;
    }
  }
}
