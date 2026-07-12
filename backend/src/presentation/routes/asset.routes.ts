import { Router } from 'express';

import { AssetController } from '../controllers/asset.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export function createAssetRoutes(assetController: AssetController): Router {
  const router = Router();

  router.use(requireAuth); // Require authentication for all asset routes

  router.post('/', assetController.create);
  router.get('/', assetController.getAll);
  router.get('/:id', assetController.getById);
  router.put('/:id', assetController.update);
  router.patch('/:id/status', assetController.changeStatus);

  return router;
}
