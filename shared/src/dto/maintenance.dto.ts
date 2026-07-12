import { z } from 'zod';

import { MaintenancePriority, MaintenanceStatus } from '../enums/maintenance.enum.js';
import { raiseMaintenanceRequestSchema, assignMaintenanceSchema, startMaintenanceSchema, completeMaintenanceSchema, cancelMaintenanceSchema } from '../schemas/maintenance.schema.js';

export type RaiseMaintenanceRequestDto = z.infer<typeof raiseMaintenanceRequestSchema>;
export type AssignMaintenanceDto = z.infer<typeof assignMaintenanceSchema>;
export type StartMaintenanceDto = z.infer<typeof startMaintenanceSchema>;
export type CompleteMaintenanceDto = z.infer<typeof completeMaintenanceSchema>;
export type CancelMaintenanceDto = z.infer<typeof cancelMaintenanceSchema>;

export interface MaintenanceRequestDto {
  id: string;
  assetId: string;
  reportedBy: string;
  assignedTo?: string;
  issue: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  estimatedCompletion?: string;
  completedAt?: string;
  remarks?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
