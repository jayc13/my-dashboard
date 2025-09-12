import { Router } from 'express';
import { E2EManualRunController } from '../controllers/e2e_manual_run.controller';

const controller = new E2EManualRunController();

export function createE2EManualRunsRouter() {
  const router = Router();

  // Get all e2e manual runs
  router.get('/', controller.getAll);
    
  // Get e2e manual run by ID
  router.get('/:id', controller.getById);
    
  // Get e2e manual runs by app ID
  router.get('/app/:appId', controller.getByAppId);

  // Get e2e manual runs by app code
  router.get('/app-code/:appCode', controller.getByAppCode);

  // Create new e2e manual run
  router.post('/', controller.create);
    
  // Update e2e manual run
  router.put('/:id', controller.update);
    
  // Delete e2e manual run
  router.delete('/:id', controller.delete);

  return router;
}
