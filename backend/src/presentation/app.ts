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
import { container } from '../core/container.js';
import { httpLogger } from '../core/logger.js';

import { requireAuth } from './middleware/auth.middleware.js';
import { globalErrorHandler, NotFoundError } from './middleware/error-handler.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { createAllocationRouter } from './routes/allocation.routes.js';
import { createAssetRoutes } from './routes/asset.routes.js';
import { authRouter as authRoutes } from './routes/auth.routes.js';
import { createCategoryRoutes } from './routes/category.routes.js';
import { departmentRoutes } from './routes/department.routes.js';
import { employeeRoutes } from './routes/employee.routes.js';
import { healthRouter as healthRoutes } from './routes/health.js';
import { createMaintenanceRouter } from './routes/maintenance.routes.js';
import { createTransferRouter } from './routes/transfer.routes.js';


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

// 7. API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/categories', createCategoryRoutes(container.categoryController));
app.use('/api/v1/assets', createAssetRoutes(container.assetController));
app.use('/api/v1/allocations', createAllocationRouter(container.allocationController));
app.use('/api/v1/transfers', createTransferRouter(container.transferController));
app.use('/api/v1/maintenance', createMaintenanceRouter(container.maintenanceController));

// History routes mounted directly since they span bounded contexts
app.get('/api/v1/assets/:id/allocation-history', requireAuth, container.allocationController.getAssetHistory);
app.get('/api/v1/employees/:id/allocation-history', requireAuth, container.allocationController.getEmployeeHistory);
app.get('/api/v1/assets/:id/transfers', requireAuth, container.transferController.getByAsset);
app.get('/api/v1/employees/:id/transfers', requireAuth, container.transferController.getByEmployee);
app.get('/api/v1/assets/:id/maintenance', requireAuth, container.maintenanceController.getByAsset);

// 8. Health Routes
app.use('/health', healthRoutes);

// 9. 404 Handler for unmatched routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// 10. Global Error Handler
app.use(globalErrorHandler);
