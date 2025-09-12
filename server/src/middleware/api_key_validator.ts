import { Request, Response, NextFunction } from 'express';

const apiKeyValidator = (req: Request, res: Response, next: NextFunction) => {
  // Allow /health endpoint without API key
  if (req.path === '/health') {
    return next();
  }

  const apiKey = req.header('x-api-key');
  const validApiKey = process.env.API_SECURITY_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }

  next();
};

export default apiKeyValidator;

