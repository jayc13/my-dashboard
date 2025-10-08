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
import { ValidationError, DatabaseError, NotFoundError } from '../errors';
import { validateId, validateJSON } from '../utils';


export async function getReport(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      date = DateTime.now().toUTC().toISODate().slice(0, 10),
      enrichments = '{}',
    } = req.query;

    let enrichmentsObj: DetailedE2EReportEnrichments = {
      includeDetails: true,
      includeAppInfo: true,
      includeManualRuns: true,
    };

    // Validate enrichments JSON
    try {
      const parsed = validateJSON(enrichments as string, 'enrichments');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        enrichmentsObj = {
          ...enrichmentsObj,
          ...(parsed as Partial<DetailedE2EReportEnrichments>),
        };
      }
    } catch {
      throw new ValidationError('Invalid enrichments format. Expected JSON string');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date as string)) {
      throw new ValidationError('Invalid date format. Expected YYYY-MM-DD', [{
        field: 'date',
        message: 'Date must be in YYYY-MM-DD format',
        code: 'INVALID_DATE_FORMAT',
        value: date,
      }]);
    }

    const summary = await E2ERunReportService.getSummaryByDate(date as string);

    // If there is no summary, return a 202 Accepted status and trigger the generation of the report
    if (!summary) {
      publishE2EReportRequest(date as string);
    }

    if (!summary || summary.status === 'pending') {
      return res.status(202).send({
        success: true,
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
      success: true,
      summary,
      details: detailsWithAppInfo,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      next(error);
    } else {
      next(new DatabaseError('Failed to fetch E2E report', error as Error));
    }
  }
}

export async function getLastProjectStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const appId = validateId(req.params.appId, 'appId');
    const summaryId = validateId(req.params.summaryId, 'summaryId');

    const result: E2EReportDetail | null = await E2ERunReportService.getLastProjectStatus(summaryId, appId);

    if (!result) {
      throw new NotFoundError('Project status');
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      next(error);
    } else {
      next(new DatabaseError('Failed to fetch project status', error as Error));
    }
  }
}