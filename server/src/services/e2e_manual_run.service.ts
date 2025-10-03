import { db } from '../db/database';
import { AppService } from './app.service';
import { CircleCIService } from './circle_ci.service';
import type { E2EManualRunOptions } from '@my-dashboard/types/e2e';

export interface E2EManualRun {
    id?: number;
    app_id: number;
    pipeline_id: string;
    created_at?: string;
}

export interface E2EManualRunInput {
    appId: number;
}

export class E2EManualRunService {

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

  static async create(input: E2EManualRunInput): Promise<E2EManualRun> {
    try {
      // Get App to ensure it exists
      const app = await AppService.getById(input.appId);
      if (!app) {
        throw new Error(`App with id ${input.appId} not found`);
      }

      if (!app.e2eTriggerConfiguration) {
        throw new Error(`App with id ${input.appId} does not have e2e_trigger_configuration set`);
      }

      // Trigger Circle CI E2E runs
      const {
        id: pipelineId,
      } = await CircleCIService.triggerE2ERuns(app.e2eTriggerConfiguration);

      const result = await db.run(
        'INSERT INTO e2e_manual_runs (app_id, pipeline_id) VALUES (?, ?)',
        [input.appId, pipelineId],
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
}
