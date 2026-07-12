import { MaintenancePriority, MaintenanceStatus } from 'shared/enums';

export interface MaintenanceRequestEntity {
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
