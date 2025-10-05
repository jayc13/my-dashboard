import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/AppError';
import { validateId, validateRequiredFields } from '../utils/validation';

/**
 * Middleware to validate ID parameter
 */
export function validateIdParam(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = validateId(req.params[paramName], paramName);
      // Store validated ID in request for use in controllers
      req.params[paramName] = id.toString();
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to validate required body fields
 */
export function validateRequiredBodyFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      validateRequiredFields(req.body, fields);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to validate request body is not empty
 */
export function validateBodyNotEmpty(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ValidationError('Request body cannot be empty', [{
        field: 'body',
        message: 'Request body is required',
        code: 'EMPTY_BODY',
      }]);
    }
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to validate content type is JSON
 */
export function validateJsonContentType(req: Request, res: Response, next: NextFunction): void {
  try {
    const contentType = req.get('content-type');
    
    if (req.method !== 'GET' && req.method !== 'DELETE' && 
        (!contentType || !contentType.includes('application/json'))) {
      throw new ValidationError('Invalid content type', [{
        field: 'content-type',
        message: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE',
      }]);
    }
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to validate query parameters
 */
export function validateQueryParams(
  allowedParams: string[],
  requiredParams: string[] = [],
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const queryKeys = Object.keys(req.query);
      
      // Check for unknown parameters
      const unknownParams = queryKeys.filter(key => !allowedParams.includes(key));
      if (unknownParams.length > 0) {
        throw new ValidationError('Invalid query parameters', [{
          field: 'query',
          message: `Unknown query parameters: ${unknownParams.join(', ')}`,
          code: 'UNKNOWN_QUERY_PARAMS',
          value: unknownParams,
        }]);
      }
      
      // Check for required parameters
      const missingParams = requiredParams.filter(param => !(param in req.query));
      if (missingParams.length > 0) {
        throw new ValidationError('Missing required query parameters', [{
          field: 'query',
          message: `Missing required parameters: ${missingParams.join(', ')}`,
          code: 'MISSING_QUERY_PARAMS',
          value: missingParams,
        }]);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to validate pagination parameters
 */
export function validatePaginationParams(
  defaultLimit: number = 50,
  maxLimit: number = 100,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { limit, offset, page } = req.query;
      
      // Validate and set limit
      if (limit !== undefined) {
        const limitNum = parseInt(limit as string, 10);
        if (isNaN(limitNum) || limitNum <= 0) {
          throw new ValidationError('Invalid limit parameter', [{
            field: 'limit',
            message: 'limit must be a positive integer',
            code: 'INVALID_LIMIT',
            value: limit,
          }]);
        }
        if (limitNum > maxLimit) {
          throw new ValidationError('Limit exceeds maximum', [{
            field: 'limit',
            message: `limit cannot exceed ${maxLimit}`,
            code: 'LIMIT_TOO_LARGE',
            value: limitNum,
          }]);
        }
        req.query.limit = limitNum.toString();
      } else {
        req.query.limit = defaultLimit.toString();
      }
      
      // Validate and set offset
      if (offset !== undefined) {
        const offsetNum = parseInt(offset as string, 10);
        if (isNaN(offsetNum) || offsetNum < 0) {
          throw new ValidationError('Invalid offset parameter', [{
            field: 'offset',
            message: 'offset must be a non-negative integer',
            code: 'INVALID_OFFSET',
            value: offset,
          }]);
        }
        req.query.offset = offsetNum.toString();
      } else {
        req.query.offset = '0';
      }
      
      // Validate page if provided
      if (page !== undefined) {
        const pageNum = parseInt(page as string, 10);
        if (isNaN(pageNum) || pageNum <= 0) {
          throw new ValidationError('Invalid page parameter', [{
            field: 'page',
            message: 'page must be a positive integer',
            code: 'INVALID_PAGE',
            value: page,
          }]);
        }
        req.query.page = pageNum.toString();
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

