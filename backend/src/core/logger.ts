/**
 * AssetFlow ERP
 *
 * Layer:
 * Core
 *
 * Responsibility:
 * Centralized structured JSON logger (Pino).
 *
 * Architectural Rules:
 * - Must never import from Presentation or Business Domain.
 * - Used strictly for runtime observability.
 */
import pino from 'pino';
import { pinoHttp } from 'pino-http';

import { Config } from '../config/index.js';

const isDev = Config.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});

export const httpLogger = pinoHttp({
  logger,
  customProps: (req, _res) => ({
    reqId: req.id,
  }),
});
