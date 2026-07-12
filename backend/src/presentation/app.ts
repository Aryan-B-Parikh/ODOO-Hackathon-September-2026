/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation
 *
 * Responsibility:
 * Configures the Express application pipeline (middleware order).
 * DOES NOT bind the port or connect to the database.
 */
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { Config } from '../config/index.js';
import { httpLogger } from '../core/logger.js';

import { globalErrorHandler, NotFoundError } from './middleware/error-handler.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { healthRouter } from './routes/health.js';


export const app = express();

// 1. Request ID
app.use(requestIdMiddleware);

// 2. Security Headers
app.use(helmet());

// 3. CORS
app.use(cors({ origin: Config.CORS_ORIGIN, credentials: true }));

// 4. Compression
app.use(compression());

// 5. Body & Cookie Parsers
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// 6. Request Logging
app.use(httpLogger);

// 7. Health Routes (Bypass Auth)
app.use('/health', healthRouter);

// 8. 404 Handler for unmatched routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// 9. Global Error Handler
app.use(globalErrorHandler);
