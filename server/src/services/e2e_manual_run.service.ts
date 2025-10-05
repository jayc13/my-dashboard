import { Logger } from '../utils/logger';
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
      Logger.error('Error fetching E2E manual runs by app id:', { error });
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

      // Check for existing manual runs in progress
      // Only check the latest run since that's the only one that could be in progress
      const existingRuns = await this.getByAppId(input.appId);

      if (existingRuns.length > 0) {
        const latestRun = existingRuns[0]; // Runs are ordered by created_at DESC

        try {
          const workflow = await CircleCIService.getPipelineLatestWorkflow(latestRun.pipeline_id);

          // CircleCI workflow statuses that indicate "in progress":
          // - "running": workflow is currently executing
          // - "on_hold": workflow is paused waiting for approval
          // - "failing": workflow is running but has failing jobs
          const inProgressStatuses = ['running', 'on_hold', 'failing'];

          if (inProgressStatuses.includes(workflow.status)) {
            throw new Error('A manual run is already in progress for this app. Please wait for it to complete before starting a new one.');
          }
        } catch (error) {
          // If we can't get the workflow status, log it but continue
          // This could happen if the pipeline is very old or deleted
          if (error instanceof Error && error.message.includes('manual run is already in progress')) {
            throw error; // Re-throw our validation error
          }
          Logger.warn(`Could not check status for pipeline ${latestRun.pipeline_id}:`, { error });
        }
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
      Logger.error('Error creating E2E manual run:', { error });
      throw error;
    }
  }
}
