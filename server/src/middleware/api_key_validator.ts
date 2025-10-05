import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';

const apiKeyValidator = (req: Request, res: Response, next: NextFunction) => {
  // Allow /health endpoint without API key
  if (req.path === '/health') {
    return next();
  }

  const apiKey = req.header('x-api-key');
  const validApiKey = process.env.API_SECURITY_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    // Use UnauthorizedError which will be handled by the error handler middleware
    return next(new UnauthorizedError('Invalid or missing API key'));
  }

  next();
};

export default apiKeyValidator;

