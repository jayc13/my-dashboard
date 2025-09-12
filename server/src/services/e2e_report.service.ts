import * as fs from 'fs';
import * as path from 'path';
import { CypressRun, ProjectStatus, ProjectSummary } from '../types';
import { CypressDashboardAPI } from './cypress.service';
import { AppService } from './app.service';

export function saveDataToFile(data: string, filePath: string) {
  // Ensure the directory exists
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, data, 'utf-8');
  console.log(`Data saved to ${filePath}`);
}

const getRunStatus = (runs: CypressRun[]): string => {
  return runs
    .filter((run) => run.status !== 'noTests')
    .every(r => r.status === 'passed') ? 'passed' : 'failed';
};

export class E2e_reportService {

  private async pullReport(day: string): Promise<ProjectSummary[]> {
    const DATA_DIR = process.env.DATA_DIR;
    const dataDir = `${DATA_DIR}/${day}`;
    const summaryFile = path.join(dataDir, 'summary.json');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(summaryFile)) {
      const data = fs.readFileSync(summaryFile, 'utf8');
      return JSON.parse(data) as ProjectSummary[];
    } else {
      console.log(`No summary file found for ${day}. Fetching data...`);
    }

    const today = new Date(day);
    // 14 days ago
    const startDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    const apiKey = process.env.CYPRESS_API_KEY;

    if (!apiKey) {
      console.error('CYPRESS_API_KEY environment variable is not set.');
      return [];
    }

    // Get watching projects from database
    const watchingApps = await AppService.getWatching();

    function getProjectCode(projectName: string): string | null {
      const app = watchingApps.find(app => app.name === projectName);
      return app ? app.code : null;
    }

    const projectNames = watchingApps.map(app => app.name);

    const api = new CypressDashboardAPI(apiKey);
    const dataFile = `${DATA_DIR}/${today.toISOString().slice(0, 10)}/dump.json`;

    let projectData;
    if (fs.existsSync(dataFile)) {
      console.log(`Loading data from file: ${dataFile}`);
      const dataFileContent = fs.readFileSync(dataFile, 'utf8');
      projectData = JSON.parse(dataFileContent);
    } else {
      console.log('Fetching data from Cypress Layout API...');
      projectData = await api.getDailyRunsPerProject({
        projects: projectNames,
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
      });

      saveDataToFile(JSON.stringify(projectData, null, 2), dataFile);
    }

    const groupedResults: Record<string, CypressRun[]> = {};

    for (const result of projectData) {
      const projectName = result['project_name'] || 'unknown';
      if (!groupedResults[projectName]) {
        groupedResults[projectName] = [];
      }
      groupedResults[projectName].push(result);
    }

    const processedData: ProjectSummary[] = [];

    for (const projectName in groupedResults) {
      const results = groupedResults[projectName];
      // Group results by run_number
      const runsByNumber: Record<string, CypressRun[]> = {};
      for (const result of results) {
        const runNumber = result['run_number'];
        if (!runNumber) {
          console.warn(`Run number is missing for result: ${JSON.stringify(result)}`);
          continue; // Skip this result if run_number is not available
        }
        if (!runsByNumber[runNumber]) {
          runsByNumber[runNumber] = [];
        }
        runsByNumber[runNumber].push(result);
      }

      const projectCode = getProjectCode(projectName);

      const projectSummary: ProjectSummary = {
        projectName,
        projectCode,
        lastUpdated: null,
        lastRunStatus: '',
        totalRuns: Object.keys(runsByNumber).length,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };

      const lastRun = Object.keys(runsByNumber).length > 0 ? Object.keys(runsByNumber).sort((a, b) => parseInt(b) - parseInt(a))[0] : null;

      for (const runNumber in runsByNumber) {
        const runs = runsByNumber[runNumber];
        const status = getRunStatus(runs);
        if (status === 'passed') {
          projectSummary.passedRuns++;
        } else {
          projectSummary.failedRuns++;
        }
      }

      projectSummary.successRate = projectSummary.totalRuns > 0 ? projectSummary.passedRuns / projectSummary.totalRuns : 1;

      projectSummary.lastRunStatus = lastRun ? getRunStatus(runsByNumber[lastRun]) : 'noTests';

      projectSummary.lastUpdated = lastRun ? runsByNumber[lastRun][0].created_at : null;

      processedData.push(projectSummary);
    }

    saveDataToFile(JSON.stringify(processedData, null, 2), `${DATA_DIR}/${today.toISOString().slice(0, 10)}/summary.json`);

    return processedData;
  }


  async getReports(reportDate?: string): Promise<ProjectSummary[]> {
    const day = reportDate ? new Date(reportDate) : new Date();
    return this.pullReport(day.toISOString().slice(0, 10));
  }

  async getReportById(id: string, reportDate?: string): Promise<ProjectSummary | null> {
    const day = reportDate ? new Date(reportDate) : new Date();

    const reports = await this.pullReport(day.toISOString().slice(0, 10));

    return reports.find(report => report.projectName === id) || null;
  }

  async getLastProjectStatus(projectName: string): Promise<ProjectStatus | null> {
    const apiKey = process.env.CYPRESS_API_KEY;

    if (!apiKey) {
      console.error('CYPRESS_API_KEY environment variable is not set.');
      return null;
    }

    const api = new CypressDashboardAPI(apiKey);

    const results = await api.getDailyRunsPerProject({
      projects: [projectName],
      startDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
      endDate: new Date().toISOString(),
      branch: 'master',
    });

    if (results.length === 0) {
      return null;
    }

    const groupedResults: Record<number, CypressRun[]> = {};

    for (const result of results) {
      const runNumber = result['run_number'] || 'unknown';
      if (!groupedResults[runNumber]) {
        groupedResults[runNumber] = [];
      }
      groupedResults[runNumber].push(result);
    }

    const latestRun = Object.keys(groupedResults).map(a => parseInt(a)).sort((a: number, b: number) => b - a)[0];

    const lastResult = groupedResults[latestRun] || [];

    // Find today's report
    const today: string = new Date().toISOString().slice(0, 10);
    const DATA_DIR = process.env.DATA_DIR || 'data';

    const lastProjectStatus: ProjectStatus = {
      projectName,
      runNumber: latestRun,
      lastRunStatus: getRunStatus(lastResult),
      createdAt: lastResult.length > 0 ? lastResult[0].created_at : '',
    };

    const processedData = await this.pullReport(today);

    // Replace the last project status in the processed data
    const index = processedData.findIndex((item) => item.projectName === lastProjectStatus.projectName);

    if (index !== -1) {
      processedData[index].lastRunStatus = lastProjectStatus.lastRunStatus;
      processedData[index].lastUpdated = lastProjectStatus.createdAt;
    }

    // Update file
    saveDataToFile(JSON.stringify(processedData, null, 2), `${DATA_DIR}/${today}/summary.json`);

    return lastProjectStatus;
  }
}