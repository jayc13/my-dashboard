interface GetReportOptions {
    projects?: string[]; // Optional array of project names
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
    exportFormat?: 'json' | 'csv'; // Default to 'json'
    branch?: string; // Optional branch name
}

export class CypressDashboardAPI {
  private readonly apiKey: string;

  constructor(private key: string) {
    this.apiKey = key;
  }

  private getUrl(reportName: string, options?: GetReportOptions): string {
    const {
      endDate = undefined, // Optional end date
      startDate = new Date().toISOString(), // Default to today if not provided
      exportFormat = 'json', // Default export format
      projects = [], // Optional project ID
      branch = 'master',
    } = options || {};

    const baseUrl = 'https://cloud.cypress.io/enterprise-reporting/report';

    const url = new URL(baseUrl);
    url.searchParams.append('report_id', reportName);
    url.searchParams.append('token', this.apiKey);
    url.searchParams.append('export_format', exportFormat);
    url.searchParams.append('start_date', startDate);

    if (endDate) {
      url.searchParams.append('end_date', endDate);
    }

    if (branch) {
      url.searchParams.append('branch', branch);
    }

    if (projects && projects.length > 0) {
      for (const project of projects) {
        url.searchParams.append('projects', project);
      }
    }
    return url.toString();
  }

  async getProjects() {
    const url = this.getUrl('project-list');
    return fetch(url)
      .then(res => res.json());
  }

  async getDailyRunsPerProject(
    options?: GetReportOptions,
  ) {
    const url = this.getUrl('spec-details', options);
    return fetch(url)
      .then(res => res.json());
  }
}