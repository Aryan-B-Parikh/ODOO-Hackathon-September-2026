import { Router } from 'express';
import { Role } from 'shared/enums';

import { container } from '../../core/container.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export const departmentRoutes = Router();

const controller = container.departmentController;

departmentRoutes.use(requireAuth);

departmentRoutes.get('/', controller.list);
departmentRoutes.post('/', requireRole([Role.Admin]), controller.create);
departmentRoutes.put('/:id', requireRole([Role.Admin]), controller.update);
departmentRoutes.post('/:id/deactivate', requireRole([Role.Admin]), controller.deactivate);
