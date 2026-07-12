/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation
 *
 * Responsibility:
 * Defines Kubernetes-compatible /live and /ready endpoints.
 */
import { Router } from 'express';

import { Database } from '../../infrastructure/database/index.js';

export const healthRouter = Router();

healthRouter.get('/live', (req, res) => {
  res.status(200).json({ status: 'live' });
});

healthRouter.get('/ready', (req, res) => {
  if (Database.isReady()) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not_ready' });
  }
});
