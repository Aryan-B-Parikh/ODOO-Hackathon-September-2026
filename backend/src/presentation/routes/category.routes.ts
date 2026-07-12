import { Router } from 'express';
import { Role } from 'shared/enums';

import { CategoryController } from '../controllers/category.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();

  // All endpoints require authentication
  router.use(requireAuth);

  // Queries (Accessible by any authenticated user)
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);

  // Commands (Restricted to Admin for Category Management)
  router.post('/', requireRole([Role.Admin]), controller.create);
  router.put('/:id', requireRole([Role.Admin]), controller.update);
  router.patch('/:id/status', requireRole([Role.Admin]), controller.changeStatus);
  router.delete('/:id', requireRole([Role.Admin]), controller.delete);

  return router;
}
