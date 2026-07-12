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
  res.status(200).json({ status: 'UP', message: 'Event loop is responsive' });
});

healthRouter.get('/ready', (req, res) => {
  if (Database.isReady()) {
    res.status(200).json({ status: 'UP', database: 'connected' });
  } else {
    res.status(503).json({ status: 'DOWN', database: 'disconnected' });
  }
});
