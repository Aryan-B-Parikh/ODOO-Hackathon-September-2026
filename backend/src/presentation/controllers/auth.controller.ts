import { Request, Response, NextFunction } from 'express';
import { loginSchema } from 'shared/schemas';

import { GetMeUseCase } from '../../application/use-cases/auth/get-me.use-case.js';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case.js';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private getMeUseCase: GetMeUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute(input);
      
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('token');
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      
      const userRes = await this.getMeUseCase.execute(req.user.userId);
      res.status(200).json({ success: true, data: userRes });
    } catch (error) {
      next(error);
    }
  };
}
