import { Router } from 'express';
import { Role } from 'shared/enums';

import { MaintenanceController } from '../controllers/maintenance.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export function createMaintenanceRouter(maintenanceController: MaintenanceController): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/', requireRole([Role.Employee, Role.AssetManager, Role.Admin]), maintenanceController.raiseRequest);
  router.get('/open', requireRole([Role.AssetManager, Role.Admin]), maintenanceController.getOpen);
  
  router.patch('/:id/assign', requireRole([Role.AssetManager, Role.Admin]), maintenanceController.assign);
  router.patch('/:id/start', requireRole([Role.AssetManager, Role.Admin]), maintenanceController.start);
  router.patch('/:id/complete', requireRole([Role.AssetManager, Role.Admin]), maintenanceController.complete);
  router.patch('/:id/cancel', requireRole([Role.Employee, Role.AssetManager, Role.Admin]), maintenanceController.cancel);

  return router;
}
