import { Request, Response, NextFunction } from 'express';
import { AppService } from '../services/app.service';
import { NotFoundError, ValidationError, DatabaseError, ConflictError } from '../errors/AppError';
import { validateId, validateRequiredFields, validateJSON, validateAndSanitizeString } from '../utils/validation';

export class AppController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const apps = await AppService.getAll();
      res.json({ success: true, data: apps });
    } catch (err) {
      next(new DatabaseError('Failed to fetch apps', err as Error));
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = validateId(req.params.id, 'id');

      const app = await AppService.getById(id);
      if (!app) {
        throw new NotFoundError('App', id);
      }

      res.json({ success: true, data: app });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, pipelineUrl, e2eTriggerConfiguration, watching } = req.body;

      // Validate required fields
      validateRequiredFields(req.body, ['name', 'code']);

      // Validate and sanitize name and code
      const sanitizedName = validateAndSanitizeString(name, 'name', {
        required: true,
        max: 255,
      });

      const sanitizedCode = validateAndSanitizeString(code, 'code', {
        required: true,
        max: 100,
      });

      // Validate optional URL
      const sanitizedPipelineUrl = pipelineUrl
        ? validateAndSanitizeString(pipelineUrl, 'pipelineUrl', { max: 500 })
        : undefined;

      let formattedE2ETriggerConfig: string | undefined = undefined;

      // Validate JSON format for e2eTriggerConfiguration if provided
      if (e2eTriggerConfiguration) {
        const parsed = validateJSON(e2eTriggerConfiguration, 'e2eTriggerConfiguration');
        formattedE2ETriggerConfig = JSON.stringify(parsed, null, 2);
      }

      const newApp = await AppService.create({
        name: sanitizedName!,
        code: sanitizedCode!,
        pipelineUrl: sanitizedPipelineUrl,
        e2eTriggerConfiguration: formattedE2ETriggerConfig,
        watching: !!watching,
      });

      res.status(201).json({ success: true, data: newApp });
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        next(err);
      } else {
        const error = err as Error;
        if (error.message && error.message.includes('Duplicate entry')) {
          next(new ConflictError('App code must be unique'));
        } else {
          next(new DatabaseError('Failed to create app', error));
        }
      }
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = validateId(req.params.id, 'id');

      // Check if app exists
      const existingApp = await AppService.getById(id);
      if (!existingApp) {
        throw new NotFoundError('App', id);
      }

      const { name, code, pipelineUrl, e2eTriggerConfiguration, watching } = req.body;

      // Validate and sanitize fields if provided
      const sanitizedName = name
        ? validateAndSanitizeString(name, 'name', { max: 255 })
        : undefined;

      const sanitizedCode = code
        ? validateAndSanitizeString(code, 'code', { max: 100 })
        : undefined;

      const sanitizedPipelineUrl = pipelineUrl !== undefined
        ? validateAndSanitizeString(pipelineUrl, 'pipelineUrl', { max: 500 })
        : undefined;

      // Validate JSON format for e2e_trigger_configuration if provided
      if (e2eTriggerConfiguration !== undefined && e2eTriggerConfiguration !== null && e2eTriggerConfiguration !== '') {
        validateJSON(e2eTriggerConfiguration, 'e2eTriggerConfiguration');
      }

      const updated = await AppService.update(id, {
        name: sanitizedName,
        code: sanitizedCode,
        pipelineUrl: sanitizedPipelineUrl,
        e2eTriggerConfiguration,
        watching: watching !== undefined ? !!watching : undefined,
      });

      if (!updated) {
        throw new NotFoundError('App', id);
      }

      res.status(200).json({ success: true, data: updated });
    } catch (err: unknown) {
      if (err instanceof ValidationError || err instanceof NotFoundError) {
        next(err);
      } else {
        const error = err as Error;
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
          next(new ConflictError('App code must be unique'));
        } else {
          next(new DatabaseError('Failed to update app', error));
        }
      }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = validateId(req.params.id, 'id');

      // Check if app exists
      const existingApp = await AppService.getById(id);
      if (!existingApp) {
        throw new NotFoundError('App', id);
      }

      const deleted = await AppService.delete(id);
      if (!deleted) {
        throw new NotFoundError('App', id);
      }

      res.json({ success: true, message: 'App deleted successfully' });
    } catch (err) {
      if (err instanceof ValidationError || err instanceof NotFoundError) {
        next(err);
      } else {
        next(new DatabaseError('Failed to delete app', err as Error));
      }
    }
  }
}
