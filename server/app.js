import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import departmentsRouter from './routes/departments.js';
import categoriesRouter from './routes/categories.js';
import employeesRouter from './routes/employees.js';
import assetsRouter from './routes/assets.js';
import allocationsRouter from './routes/allocations.js';
import bookingsRouter from './routes/bookings.js';
import maintenanceRouter from './routes/maintenance.js';
import auditsRouter from './routes/audits.js';
import dashboardRouter from './routes/dashboard.js';
import notificationsRouter from './routes/notifications.js';
import reportsRouter from './routes/reports.js';
import organizationRouter from './routes/organization.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded asset files (photos & documents) as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routers
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/allocations', allocationsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/tickets', maintenanceRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/organization', organizationRouter);

// Basic Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
