import { z } from 'zod';

import { MaintenancePriority } from '../enums/maintenance.enum.js';

export const raiseMaintenanceRequestSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  issue: z.string().min(1, 'Issue description is required'),
  priority: z.nativeEnum(MaintenancePriority).optional().default(MaintenancePriority.Low),
});

export const assignMaintenanceSchema = z.object({
  assignedTo: z.string().min(1, 'Assignee ID is required'),
  estimatedCompletion: z.string().datetime().optional(),
});

export const startMaintenanceSchema = z.object({
  remarks: z.string().optional(),
});

export const completeMaintenanceSchema = z.object({
  remarks: z.string().optional(),
});

export const cancelMaintenanceSchema = z.object({
  remarks: z.string().optional(),
});
