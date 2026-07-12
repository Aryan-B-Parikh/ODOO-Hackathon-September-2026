import { Router } from 'express';
import { Role } from 'shared/enums';

import { container } from '../../core/container.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export const employeeRoutes = Router();

const controller = container.employeeController;

employeeRoutes.use(requireAuth);

employeeRoutes.get('/', controller.list);
employeeRoutes.get('/:id', controller.getById);
employeeRoutes.post('/', requireRole([Role.Admin]), controller.create);
employeeRoutes.put('/:id', requireRole([Role.Admin]), controller.update);
employeeRoutes.post('/:id/role', requireRole([Role.Admin]), controller.promote);
