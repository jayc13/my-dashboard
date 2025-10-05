import { Request, Response, NextFunction } from 'express';
import { JiraService } from '../services/jira.service';
import { ExternalServiceError } from '../errors/AppError';

const jiraService = new JiraService();

export async function getManualQATasks(req: Request, res: Response, next: NextFunction) {
  try {
    const jql = 'labels in ("manual_qa") AND "Status" NOT IN ("Done", "Ready to Release", "To Do") AND project = "Agent Client Tools" ORDER BY created DESC';

    const result = await jiraService.fetchIssues(jql);
    return res.status(200).json({
      success: true,
      data: {
        total: result.total,
        issues: result.issues.map((issue) => jiraService.formatJiraIssue(issue)),
      },
    });
  } catch (error) {
    next(new ExternalServiceError('Jira', 'Failed to fetch manual QA tasks', error as Error));
  }
}

export async function getMyTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const jql = 'assignee = currentUser() AND resolution = Unresolved order by updated DESC';

    const result = await jiraService.fetchIssues(jql);
    return res.status(200).json({
      success: true,
      data: {
        total: result.total,
        issues: result.issues.map((issue) => jiraService.formatJiraIssue(issue)),
      },
    });
  } catch (error) {
    next(new ExternalServiceError('Jira', 'Failed to fetch tickets', error as Error));
  }
}