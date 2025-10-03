import { Router } from 'express';
import { E2EManualRunController } from '../controllers/e2e_manual_run.controller';

const controller = new E2EManualRunController();

export function createE2EManualRunsRouter() {
  const router = Router();

  // Create new e2e manual run
  router.post('/', controller.create);

  return router;
}
