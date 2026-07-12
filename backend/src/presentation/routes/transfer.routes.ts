import { Router } from 'express';
import { Role } from 'shared/enums';

import { TransferController } from '../controllers/transfer.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export function createTransferRouter(transferController: TransferController): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/', requireRole([Role.Employee, Role.DepartmentHead, Role.AssetManager, Role.Admin]), transferController.createRequest);
  router.get('/pending', requireRole([Role.AssetManager, Role.DepartmentHead, Role.Admin]), transferController.getPending);
  
  router.post('/:id/approve', requireRole([Role.AssetManager, Role.DepartmentHead, Role.Admin]), transferController.approve);
  router.post('/:id/reject', requireRole([Role.AssetManager, Role.DepartmentHead, Role.Admin]), transferController.reject);
  router.post('/:id/cancel', requireRole([Role.Employee, Role.AssetManager, Role.Admin]), transferController.cancel);

  return router;
}
