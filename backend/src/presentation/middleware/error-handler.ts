/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation / Core
 *
 * Responsibility:
 * Defines base Error classes and the Global Error Handler middleware.
 * Maps exceptions to standard HTTP JSON responses.
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../core/logger.js';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public statusCode: number, message: string, public isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') { super(404, message); }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(401, message); }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(403, message); }
}

export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    logger.warn({ reqId: req.id, err }, 'Validation Error');
    res.status(400).json({ error: 'Validation Error', details: err.errors });
    return;
  }

  if (err instanceof AppError) {
    logger.warn({ reqId: req.id, err }, `AppError: ${err.message}`);
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unknown/Fatal error
  logger.error({ reqId: req.id, err }, '💥 Unhandled Server Error');
  res.status(500).json({ error: 'Internal Server Error' });
};
