export interface ThirdPartyAPICall {
  id: string;
  timestamp: string;
  service: 'github' | 'circleci' | 'cypress' | 'jira';
  method: string;
  path: string;
  fullUrl: string;
  headers: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  userAgent?: string | undefined;
  ip?: string | undefined;
  responseStatus?: number;
  responseTime?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseBody?: any;
}

export interface APICallSummary {
  totalCalls: number;
  uniqueEndpoints: number;
  serviceBreakdown: Record<string, number>;
  methodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  averageResponseTime: number;
  timeRange: {
    earliest: string;
    latest: string;
  };
}

export interface RegistryStats {
  totalCalls: number;
  callsToday: number;
  topEndpoints: Array<{
    service: string;
    endpoint: string;
    count: number;
  }>;
  recentCalls: ThirdPartyAPICall[];
}

// Third-party service specific types
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at?: string;
  html_url: string;
}

export interface CircleCIPipeline {
  id: string;
  number: number;
  state: 'created' | 'running' | 'success' | 'failed';
  created_at: string;
  updated_at: string;
  project_slug: string;
}

export interface CypressRun {
  runId: string;
  status: 'running' | 'passed' | 'failed';
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalPending: number;
  createdAt: string;
  completedAt?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    created: string;
    updated: string;
  };
}
