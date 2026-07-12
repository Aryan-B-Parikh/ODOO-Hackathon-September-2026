import { Request, Response } from 'express';
import { Role } from 'shared/enums/role.enum';
import { describe, it, expect, vi } from 'vitest';

import { requireAuth, requireRole } from '../../../../src/presentation/middleware/auth.middleware.js';
import { UnauthorizedError, ForbiddenError } from '../../../../src/presentation/middleware/error-handler.js';

vi.mock('../../../../src/core/security/jwt.service.js');

describe('Auth Middleware', () => {
  describe('requireAuth', () => {
    it('should throw Unauthorized if no token provided', () => {
      const req = { cookies: {}, headers: {} } as Request;
      const res = {} as Response;
      const next = vi.fn();

      requireAuth(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('requireRole', () => {
    it('should call next if role is allowed', () => {
      const req = { user: { role: Role.Admin } } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      requireRole([Role.Admin])(req, res, next);
      expect(next).toHaveBeenCalledWith(); // Called with no args (success)
    });

    it('should throw ForbiddenError if role is not allowed', () => {
      const req = { user: { role: Role.Employee } } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      requireRole([Role.Admin])(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});
