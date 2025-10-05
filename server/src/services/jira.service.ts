import * as dotenv from 'dotenv';
import { JiraTicket } from '@my-dashboard/types/jira';
import { Logger } from '../utils/logger';

interface JiraUser {
  displayName: string;
}

interface JiraStatus {
  name: string;
}

interface JiraPriority {
  name: string;
}

interface JiraFields {
  summary: string;
  status: JiraStatus;
  created: string;
  updated: string;
  assignee?: JiraUser;
  reporter?: JiraUser;
  parent: {
    id: string;
    key: string;
    fields: {
      summary: string;
    };
  };
  labels: string[];
  priority?: JiraPriority;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: JiraFields;
}

export interface FetchIssuesResponse {
  total: number;
  issues: JiraIssue[];
}

export class JiraService {
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor() {
    // Load environment variables
    dotenv.config({ quiet: true });
    const JIRA_BASE_URL = process.env.JIRA_BASE_URL || '';
    const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || '';
    const JIRA_EMAIL = process.env.JIRA_EMAIL || '';

    this.baseUrl = JIRA_BASE_URL;
    const token = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
    this.authHeader = `Basic ${token}`;
  }

  async fetchIssues(jql: string): Promise<FetchIssuesResponse> {
    const JIRA_FIELDS = [
      'summary',
      'status',
      'created',
      'updated',
      'assignee',
      'reporter',
      'labels',
      'parent',
      'priority',
    ].join(',');
    const url = `${this.baseUrl}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&fields=${JIRA_FIELDS}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      const json = await res.json();
      Logger.error('Failed to fetch Jira issues', { status: res.status, statusText: res.statusText, response: json });
      throw new Error(`Failed to fetch issues: ${res.statusText}`);
    }
    return res.json();
  }

  formatJiraIssue(issue: JiraIssue): JiraTicket {
    return {
      id: issue.id,
      key: issue.key,
      url: `${this.baseUrl}/browse/${issue.key}`,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      created: issue.fields.created,
      updated: issue.fields.updated,
      parent: issue.fields.parent ? {
        id: issue.fields.parent.id,
        key: issue.fields.parent.key,
        url: `${this.baseUrl}/browse/${issue.fields.parent.key}`,
        summary: issue.fields.parent.fields.summary,
      } : undefined,
      assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned',
      reporter: issue.fields.reporter ? issue.fields.reporter.displayName : 'Unknown',
      labels: issue.fields.labels || [],
      priority: issue.fields.priority ? issue.fields.priority.name : 'None',
    };
  }
}

