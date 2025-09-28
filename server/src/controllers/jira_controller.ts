import { Request, Response, NextFunction } from 'express';
import { JiraService } from '../services/jira.service';


const jiraService = new JiraService();

export async function getManualQATasks(req: Request, res: Response, next: NextFunction) {
  try {
    const jql = 'labels in ("manual_qa") AND "Status" NOT IN ("Done", "Ready to Release", "To Do") AND project = "Agent Client Tools" ORDER BY created DESC';

    const result = await jiraService.fetchIssues(jql);
    return res.status(200 ).json({
      total: result.total,
      issues: result.issues.map((issue) => jiraService.formatJiraIssue(issue)),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const jql = 'assignee = currentUser() AND resolution = Unresolved order by updated DESC';

    const result = await jiraService.fetchIssues(jql);
    return res.status(200 ).json({
      total: result.total,
      issues: result.issues.map((issue) => jiraService.formatJiraIssue(issue)),
    });
  } catch (error) {
    next(error);
  }
}