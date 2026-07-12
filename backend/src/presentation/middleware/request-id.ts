/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation
 *
 * Responsibility:
 * Injects a unique UUID into every incoming request for log correlation.
 */
import crypto from 'crypto';

import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
};
