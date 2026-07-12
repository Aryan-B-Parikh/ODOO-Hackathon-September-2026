import { Router } from 'express';

import { container } from '../../core/container.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', container.authController.login);
authRouter.post('/logout', container.authController.logout);
authRouter.get('/me', requireAuth, container.authController.me);
