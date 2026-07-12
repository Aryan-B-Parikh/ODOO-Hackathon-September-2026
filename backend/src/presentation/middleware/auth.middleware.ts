import { Request, Response, NextFunction } from 'express';
import { Role } from 'shared/enums';
import { JwtPayload } from 'shared/types';

import { JwtService } from '../../core/security/jwt.service.js';

import { UnauthorizedError, ForbiddenError } from './error-handler.js';

const jwtService = new JwtService();

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Missing authentication token');
    }

    const payload = jwtService.verify(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    
    next();
  };
};
