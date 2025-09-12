import { Router } from 'express';
import { FileSystemController } from '../controllers/file_system.controller';

const controller = new FileSystemController();

export function createInternalRouter() {
  const router = Router();

  // List directories and files under DATA_DIR
  router.get('/files', controller.listDataDirectory);

  // Delete a file or directory under DATA_DIR
  router.delete('/files', controller.deleteItem);

  // Get DATA_DIR configuration info
  router.get('/files/info', controller.getDataDirInfo);

  return router;
}
