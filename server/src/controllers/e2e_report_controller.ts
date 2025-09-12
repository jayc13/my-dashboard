import { Request, Response, NextFunction } from 'express';
import { E2e_reportService } from '../services/e2e_report.service';
import { ProjectStatus } from '../types';

const reportService = new E2e_reportService();

export async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const reportDate = req.query.reportDate as string || '';

    const reports = await reportService.getReports(reportDate);
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
}

export async function getReportById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const report = await reportService.getReportById(id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
}

export async function getLastProjectStatus(req: Request, res: Response, next: NextFunction) {
  const projectName: string = req.params.projectName;
  try {
    const result: ProjectStatus | null = await reportService.getLastProjectStatus(projectName);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}