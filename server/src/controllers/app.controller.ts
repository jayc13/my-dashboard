import { Request, Response } from 'express';
import { AppService } from '../services/app.service';

export class AppController {
  async getAll(req: Request, res: Response) {
    try {
      const apps = await AppService.getAll();
      res.json(apps);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch apps' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid app ID' });
      }

      const app = await AppService.getById(id);
      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }

      res.json(app);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch app' });
    }
  }

  async getByCode(req: Request, res: Response) {
    try {
      const code = req.params.code;
      if (!code) {
        return res.status(400).json({ error: 'App code is required' });
      }

      const app = await AppService.getByCode(code);
      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }

      res.json(app);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch app' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, code, pipeline_url, e2e_trigger_configuration, watching } = req.body;
            
      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required fields' });
      }

      // Validate JSON format for e2e_trigger_configuration if provided
      if (e2e_trigger_configuration) {
        try {
          JSON.parse(e2e_trigger_configuration);
        } catch {
          return res.status(400).json({ error: 'e2e_trigger_configuration must be valid JSON' });
        }
      }

      const id = await AppService.create({
        name,
        code,
        pipeline_url,
        e2e_trigger_configuration,
        watching: !!watching,
      });
            
      res.status(201).json({ id });
    } catch (err: unknown) {
      console.error(err);
      const error = err as Error;
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        res.status(409).json({ error: 'App code must be unique' });
      } else {
        res.status(500).json({ error: 'Failed to create app' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid app ID' });
      }

      const { name, code, pipeline_url, e2e_trigger_configuration, watching } = req.body;

      // Validate JSON format for e2e_trigger_configuration if provided
      if (e2e_trigger_configuration !== undefined && e2e_trigger_configuration !== null && e2e_trigger_configuration !== '') {
        try {
          JSON.parse(e2e_trigger_configuration);
        } catch {
          return res.status(400).json({ error: 'e2e_trigger_configuration must be valid JSON' });
        }
      }

      const updated = await AppService.update(id, {
        name,
        code,
        pipeline_url,
        e2e_trigger_configuration,
        watching: watching !== undefined ? !!watching : undefined,
      });

      if (!updated) {
        return res.status(404).json({ error: 'App not found' });
      }

      res.json({ success: true });
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        res.status(409).json({ error: 'App code must be unique' });
      } else {
        res.status(500).json({ error: 'Failed to update app' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid app ID' });
      }

      const deleted = await AppService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'App not found' });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete app' });
    }
  }
}
