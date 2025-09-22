import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(Object.keys(err));

  if (err) {
    return res.status(500).json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }

  next();

}