import { Request, Response, NextFunction } from 'express';
import { E2EManualRunService } from '../services/e2e_manual_run.service';
import { ValidationError, ConflictError, DatabaseError } from '../errors/AppError';
import { validateRequiredFields, validateId } from '../utils/validation';

export class E2EManualRunController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId } = req.body;

      // Validate required fields
      validateRequiredFields(req.body, ['appId']);

      // Validate appId
      const validatedAppId = validateId(appId, 'appId');

      const run = await E2EManualRunService.create({
        appId: validatedAppId,
      });

      // Transform snake_case database fields to camelCase for API response
      const response = {
        id: run.id,
        appId: run.app_id,
        pipelineId: run.pipeline_id,
        createdAt: run.created_at,
      };

      res.status(201).json({ success: true, data: response });
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        next(err);
      } else {
        const error = err as Error;
        if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
          next(new ValidationError('Invalid appId: app does not exist'));
        } else if (error.message && error.message.includes('manual run is already in progress')) {
          next(new ConflictError(error.message));
        } else {
          next(new DatabaseError('Failed to create e2e manual run', error));
        }
      }
    }
  }
}
