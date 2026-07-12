import { Router } from 'express';
import { Role } from 'shared/enums';

import { AllocationController } from '../controllers/allocation.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export function createAllocationRouter(allocationController: AllocationController): Router {
  const router = Router();

  router.use(requireAuth);

  // Allocations
  router.post('/', requireRole([Role.Admin, Role.AssetManager]), allocationController.allocate);
  router.post('/:id/return', requireRole([Role.Admin, Role.AssetManager, Role.Employee]), allocationController.returnAsset);

  return router;
}
