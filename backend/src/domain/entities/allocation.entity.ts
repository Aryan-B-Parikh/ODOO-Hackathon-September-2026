import { AllocationStatus } from 'shared/enums';

export interface AllocationEntity {
  id: string;
  assetId: string;
  employeeId: string;
  allocatedBy: string;
  allocatedAt: string;
  expectedReturnDate?: string;
  returnedAt?: string;
  returnedBy?: string;
  status: AllocationStatus;
  remarks?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
