import { Request, Response } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
) {
  console.error(err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
}