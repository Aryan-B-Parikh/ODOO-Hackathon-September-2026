import { z } from 'zod';

import { AllocationStatus } from '../enums/allocation.enum.js';
import { allocateAssetSchema, returnAssetSchema } from '../schemas/allocation.schema.js';

export type AllocateAssetDto = z.infer<typeof allocateAssetSchema>;
export type ReturnAssetDto = z.infer<typeof returnAssetSchema>;

export interface AllocationDto {
  id: string;
  assetId: string;
  employeeId: string;
  allocatedBy?: string;
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
