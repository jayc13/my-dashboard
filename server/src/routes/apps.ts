import { Router } from 'express';
import { AppController } from '../controllers/app.controller';

const controller = new AppController();

export function createAppsRouter() {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
