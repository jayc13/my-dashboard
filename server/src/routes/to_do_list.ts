import { Router } from 'express';
import { ToDoListController } from '../controllers/to_do_list.controller';

const controller = new ToDoListController();

export function createToDoListRouter() {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}