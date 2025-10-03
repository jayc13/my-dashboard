import { NextFunction, Request, Response } from 'express';
import { E2ERunReportService } from '../services/e2e_run_report.service';
import { AppService } from '../services/app.service';
import { E2EManualRunService } from '../services/e2e_manual_run.service';
import { DateTime } from 'luxon';
import { publishE2EReportRequest } from '../processors/e2e_report.processor';
import {
  AppDetailedE2EReportDetail,
  DetailedE2EReportDetail,
  DetailedE2EReportEnrichments,
  E2EReportDetail,
} from '@my-dashboard/types/e2e';


export async function getReport(req: Request, res: Response) {
  const {
    date = DateTime.now().toUTC().toISODate().slice(0, 10),
    enrichments = '{}',
  } = req.query;

  let enrichmentsObj: DetailedE2EReportEnrichments = {
    includeDetails: true,
    includeAppInfo: true,
    includeManualRuns: true,
  };

  try {
    enrichmentsObj = {
      ...enrichmentsObj,
      ...JSON.parse(enrichments as string),
    };
  } catch {
    return res.status(400).send({
      error: 'Invalid enrichments format. Expected JSON string',
    });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date as string)) {
    return res.status(400).send({
      error: 'Invalid date format. Expected YYYY-MM-DD',
    });
  }
  
  const summary = await E2ERunReportService.getSummaryByDate(date as string);

  // If there is no summary, return a 202 Accepted status and trigger the generation of the report
  if (!summary) {
    publishE2EReportRequest(date as string);
  }


  if (!summary || summary.status === 'pending') {
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

  let detailsWithAppInfo: DetailedE2EReportDetail[] | undefined  = [];

  if (enrichmentsObj.includeDetails) {
    const details = await E2ERunReportService.getDetailsBySummaryId(summary.id);

    for (const detail of details) {
      const enrichedDetail: DetailedE2EReportDetail = { ...detail };

      if (enrichmentsObj.includeAppInfo) {
        const appInfo = await AppService.getById(detail.appId);
        if (!appInfo) {
          continue;
        }

        const fromDate = DateTime.fromISO(date as string, { zone: 'utc' }).startOf('day').toISO()!;
        const toDate = DateTime.fromISO(date as string, { zone: 'utc' }).endOf('day').toISO()!;

        enrichedDetail.app = {
          ...appInfo,
          manualRuns: (
            enrichmentsObj.includeManualRuns ? (await E2EManualRunService.getByAppId(detail.appId, { filter: { from: fromDate, to: toDate } })) : undefined
          ),
        } as AppDetailedE2EReportDetail;
      }

      detailsWithAppInfo.push(enrichedDetail);
    }
  } else {
    detailsWithAppInfo = undefined;
  }
  
  return res.status(200).send({
    summary,
    details: detailsWithAppInfo,
  });
}

export async function getLastProjectStatus(req: Request, res: Response, next: NextFunction) {
  const appId: string = req.params.appId;
  const summaryId: string = req.params.summaryId;

  if (!appId || isNaN(Number(appId))) {
    return res.status(400).send({ error: 'Invalid or missing appId parameter' });
  }

  if (!summaryId || isNaN(Number(summaryId))) {
    return res.status(400).send({ error: 'Invalid or missing summaryId parameter' });
  }

  try {
    const result: E2EReportDetail | null = await E2ERunReportService.getLastProjectStatus(Number(summaryId), Number(appId));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}