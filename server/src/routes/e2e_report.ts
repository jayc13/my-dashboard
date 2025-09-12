import { Router } from 'express';
import { getReports, getReportById, getLastProjectStatus } from '../controllers/e2e_report_controller';

export function createE2EReportRouter() {
  const router = Router();

  router.get('/', getReports);
  router.get('/report/:id', getReportById);
  router.get('/project_status/:projectName', getLastProjectStatus);

  return router;
}