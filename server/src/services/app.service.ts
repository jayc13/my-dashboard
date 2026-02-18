import { DatabaseRow, db } from '../db/database';
import { E2EManualRunService } from './e2e_manual_run.service';
import { CircleCIService } from './circle_ci.service';
import type { Application, ApplicationDetails, LastApplicationRun } from '@my-dashboard/types/applications';
import { AppDetailedE2EReportDetail } from '@my-dashboard/types/e2e';
import { Logger } from '../utils/logger';

export class AppService {
  static async getAll(): Promise<Application[]> {
    try {
      const rows = await db.all('SELECT * FROM apps ORDER BY name ASC');
      return rows.map(fromDatabaseRowToApplication);
    } catch (error) {
      Logger.error('Error fetching apps', { error });
      throw error;
    }
  }

  static async getById(id: number): Promise<ApplicationDetails | undefined> {
    try {
      const row = await db.get('SELECT * FROM apps WHERE id = ?', [id]);
      if (!row) {
        return undefined;
      }

      const app: Application = fromDatabaseRowToApplication(row);

      return this.enrichWithRunDetails(app);
    } catch (error) {
      Logger.error('Error fetching app by id', { id, error });
      throw error;
    }
  }

  static async getAppWithDetailsById(id: number): Promise<AppDetailedE2EReportDetail | undefined> {
    try {
      const row = await db.get('SELECT * FROM apps WHERE id = ?', [id]);
      if (!row) {
        return undefined;
      }

      const app: Application = fromDatabaseRowToApplication(row);

      return await this.enrichWithRunDetails(app) as AppDetailedE2EReportDetail;
    } catch (error) {
      Logger.error('Error fetching app with details by id', { id, error });
      throw error;
    }
  }

  static async getByCode(code: string): Promise<ApplicationDetails | undefined> {
    try {
      const row = await db.get('SELECT * FROM apps WHERE code = ?', [code]);
      if (!row) {
        return undefined;
      }

      const app: Application = fromDatabaseRowToApplication(row);

      return this.enrichWithRunDetails(app);
    } catch (error) {
      Logger.error('Error fetching app by code', { code, error });
      throw error;
    }
  }

  static async create(app: Omit<Application, 'id'>): Promise<Application> {
    try {
      const result = await db.run(
        `INSERT INTO apps (name, code, pipeline_url, e2e_trigger_configuration, watching)
                 VALUES (?, ?, ?, ?, ?)`,
        [app.name, app.code, app.pipelineUrl || null, app.e2eTriggerConfiguration || null, app.watching ? 1 : 0],
      );
      const newApp = await this.getById(result.insertId!);
      if (!newApp) {
        throw new Error('Failed to retrieve the newly created app.');
      }
      return newApp;
    } catch (error) {
      Logger.error('Error creating app', { appName: app.name, error });
      throw error;
    }
  }

  static async update(id: number, app: Partial<Omit<Application, 'id'>>): Promise<Application> {
    try {
      const fields = [];
      const values = [];

      if (app.name !== undefined) {
        fields.push('name = ?');
        values.push(app.name);
      }
      if (app.code !== undefined) {
        fields.push('code = ?');
        values.push(app.code);
      }
      if (app.pipelineUrl !== undefined) {
        fields.push('pipeline_url = ?');
        values.push(app.pipelineUrl || null);
      }
      if (app.e2eTriggerConfiguration !== undefined) {
        fields.push('e2e_trigger_configuration = ?');
        values.push(app.e2eTriggerConfiguration || null);
      }
      if (app.watching !== undefined) {
        fields.push('watching is ?');
        values.push(app.watching);
      }

      if (fields.length === 0) {
        const updatedApp = await this.getById(id);
        if (!updatedApp) {
          throw new Error('App not found.');
        }
        return updatedApp;
      }

      values.push(id);

      await db.run(
        `UPDATE apps SET ${fields.join(', ')} WHERE id = ?`,
        values,
      );

      const updatedApp = await this.getById(id);
      if (!updatedApp) {
        throw new Error('Failed to retrieve the updated app.');
      }

      return updatedApp;
    } catch (error) {
      Logger.error('Error updating app', { id, error });
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db.run('DELETE FROM apps WHERE id = ?', [id]);
      return (result.affectedRows || 0) > 0;
    } catch (error) {
      Logger.error('Error deleting app', { id, error });
      throw error;
    }
  }

  static async getWatching(): Promise<Application[]> {
    try {
      const rows = await db.all('SELECT * FROM apps WHERE watching is true ORDER BY name ASC');
      return rows.map(fromDatabaseRowToApplication);
    } catch (error) {
      Logger.error('Error fetching watching apps', { error });
      throw error;
    }
  }

  private static async enrichWithRunDetails(app: Application): Promise<ApplicationDetails> {
    const appRuns = await E2EManualRunService.getByAppId(app.id!, {
      filter: {
        from: new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z',
        to: new Date().toISOString().slice(0, 10) + 'T23:59:59.999Z',
      },
    });

    let lastRun: LastApplicationRun | undefined = undefined;

    if (appRuns.length) {
      const latestWorkflow = await CircleCIService.getPipelineLatestWorkflow(appRuns[0].pipeline_id);

      const circleBaseUrl = process.env.CIRCLE_CI_BASE_URL;

      if (!circleBaseUrl) {
        throw new Error('CIRCLE_CI_BASE_URL environment variable is required');
      }

      const latestUrl: string = `${circleBaseUrl}/pipelines/${latestWorkflow.project_slug}/${latestWorkflow.pipeline_number}/workflows/${latestWorkflow.id}`;

      lastRun = {
        id: appRuns[0].id!,
        status: latestWorkflow.status,
        url: latestUrl,
        pipelineId: appRuns[0].pipeline_id,
        createdAt: appRuns[0].created_at!,
      };
    }

    return {
      ...app,
      e2eRunsQuantity: appRuns.length,
      lastRun,
    };
  }
}

function fromDatabaseRowToApplication(row: DatabaseRow): Application {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    pipelineUrl: row.pipeline_url,
    e2eTriggerConfiguration: row.e2e_trigger_configuration,
    watching: !!row.watching,
  };
}