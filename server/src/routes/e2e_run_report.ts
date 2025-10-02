import { Router } from 'express';
import { getReport } from '../controllers/e2e_run_report.controller';

export function createE2ERunReportRouter() {
  const router = Router();

  router.get('/', getReport);

  return router;
}