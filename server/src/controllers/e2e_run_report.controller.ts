import { Request, Response } from 'express';
import { E2ERunReportService } from '../services/e2e_run_report.service';
import { AppService } from '../services/app.service';
import { E2EManualRunService } from '../services/e2e_manual_run.service';
import { DateTime } from 'luxon';
import { publishE2EReportRequest } from '../processors/e2e_report.processor';


export async function getReport(req: Request, res: Response) {
  const {
    date = DateTime.now().toUTC().toISODate().slice(0, 10),
  } = req.query;

  console.log(date);

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date as string)) {
    return res.status(400).send({
      error: 'Invalid date format. Expected YYYY-MM-DD',
    });
  }
  
  const {
    summary,
    details,
  } = await E2ERunReportService.getSummaryByDateWithDetails(date as string);

  // If there is no summary, return a 202 Accepted status and trigger the generation of the report
  if (!summary) {
    
    await publishE2EReportRequest(date as string);
    
    return res.status(202).send({
      summary: {
        date,
        status: 'pending',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      },
      details: [],
      message: 'Report is being generated. Please check back later.',
    });
  }

  const detailsWithAppInfo = [];

  for (const detail of details) {
    const appInfo = await AppService.getById(detail.appId);
    if (!appInfo) {
      continue;
    }

    const manualRuns = await E2EManualRunService.getByAppId(detail.appId);

    detailsWithAppInfo.push({
      ...detail,
      app: {
        ...appInfo,
        manualRuns,
      },
    });
  }
  
  return res.status(200).send({
    summary,
    details: detailsWithAppInfo,
  });
}