import { Router } from 'express';
import { getReport, getLastProjectStatus } from '../controllers/e2e_run_report.controller';

export function createE2ERunReportRouter() {
  const router = Router();

  router.get('/', getReport);
  router.get('/:summaryId/:appId', getLastProjectStatus);

  return router;
}