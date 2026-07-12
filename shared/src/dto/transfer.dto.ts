import { z } from 'zod';

import { TransferStatus } from '../enums/transfer.enum.js';
import { createTransferRequestSchema, approveTransferSchema, rejectTransferSchema, cancelTransferSchema } from '../schemas/transfer.schema.js';

export type CreateTransferRequestDto = z.infer<typeof createTransferRequestSchema>;
export type ApproveTransferDto = z.infer<typeof approveTransferSchema>;
export type RejectTransferDto = z.infer<typeof rejectTransferSchema>;
export type CancelTransferDto = z.infer<typeof cancelTransferSchema>;

export interface TransferRequestDto {
  id: string;
  assetId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  requestedBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  reason?: string;
  remarks?: string;
  status: TransferStatus;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
