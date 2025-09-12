import { Request, Response } from 'express';
import { E2EManualRunInput, E2EManualRunOptions, E2EManualRunService } from '../services/e2e_manual_run.service';

export class E2EManualRunController {
  async getAll(req: Request, res: Response) {
    try {
      const runs = await E2EManualRunService.getAll();
      res.json(runs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch e2e manual runs' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid run ID' });
      }

      const run = await E2EManualRunService.getById(id);
      if (!run) {
        return res.status(404).json({ error: 'E2E manual run not found' });
      }

      res.json(run);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch e2e manual run' });
    }
  }

  async getByAppId(req: Request, res: Response) {
    try {
      const appId = parseInt(req.params.appId);
      if (isNaN(appId)) {
        return res.status(400).json({ error: 'Invalid app ID' });
      }

      // Extract date range from query parameters
      const { from, to } = req.query;
      const options: E2EManualRunOptions = {};

      if (from || to) {
        options.filter = {};
        if (from && typeof from === 'string') {
          options.filter.from = from;
        }
        if (to && typeof to === 'string') {
          options.filter.to = to;
        }
      }

      const runs = await E2EManualRunService.getByAppId(appId, options);
      res.json(runs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch e2e manual runs for app' });
    }
  }

  async getByAppCode(req: Request, res: Response) {
    try {
      const appCode = req.params.appCode;
      if (!appCode) {
        return res.status(400).json({ error: 'App code is required' });
      }

      // Extract date range from query parameters
      const { from, to } = req.query;
      const options: E2EManualRunOptions = {};

      if (from || to) {
        options.filter = {};
        if (from && typeof from === 'string') {
          options.filter.from = from;
        }
        if (to && typeof to === 'string') {
          options.filter.to = to;
        }
      }

      const runs = await E2EManualRunService.getByAppCode(appCode, options);
      res.json(runs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch e2e manual runs for app code' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { app_id } = req.body;
            
      if (!app_id || isNaN(parseInt(app_id))) {
        return res.status(400).json({ error: 'Valid app_id is required' });
      }

      const run = await E2EManualRunService.create({
        app_id: parseInt(app_id),
      });
            
      res.status(201).json(run);
    } catch (err: unknown) {
      console.error(err);
      const error = err as Error;
      if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
        res.status(400).json({ error: 'Invalid app_id: app does not exist' });
      } else {
        res.status(500).json({ error: 'Failed to create e2e manual run' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid run ID' });
      }

      const { app_id } = req.body;
      const updateData: Partial<E2EManualRunInput> = {};

      if (app_id !== undefined) {
        if (isNaN(parseInt(app_id))) {
          return res.status(400).json({ error: 'Invalid app_id' });
        }
        updateData.app_id = parseInt(app_id);
      }

      const updated = await E2EManualRunService.update(id, updateData);

      if (!updated) {
        return res.status(404).json({ error: 'E2E manual run not found' });
      }

      res.json({ success: true });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
        res.status(400).json({ error: 'Invalid app_id: app does not exist' });
      } else {
        res.status(500).json({ error: 'Failed to update e2e manual run' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid run ID' });
      }

      const deleted = await E2EManualRunService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'E2E manual run not found' });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete e2e manual run' });
    }
  }
}
