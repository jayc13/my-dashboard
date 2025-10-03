import { Request, Response } from 'express';
import { E2EManualRunService } from '../services/e2e_manual_run.service';

export class E2EManualRunController {
  async create(req: Request, res: Response) {
    try {
      const { appId } = req.body;

      if (!appId || isNaN(parseInt(appId))) {
        return res.status(400).json({ error: 'Valid appId is required' });
      }

      const run = await E2EManualRunService.create({
        appId: parseInt(appId),
      });

      res.status(201).json(run);
    } catch (err: unknown) {
      console.error(err);
      const error = err as Error;
      if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
        res.status(400).json({ error: 'Invalid appId: app does not exist' });
      } else if (error.message && error.message.includes('manual run is already in progress')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create e2e manual run' });
      }
    }
  }
}
