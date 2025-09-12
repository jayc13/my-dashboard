import { Router } from 'express';
import { getJiraIssues, getManualQATasks, getMyTickets } from '../controllers/jira_controller';

export function createJiraRouter() {
  const router = Router();
  // Define your Jira-related routes here
  router.get('/', getJiraIssues);
  router.get('/manual_qa', getManualQATasks);
  router.get('/my_tickets', getMyTickets);

  return router;
}