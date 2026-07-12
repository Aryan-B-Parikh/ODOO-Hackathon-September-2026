import { z } from 'zod';

export const createTransferRequestSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  targetEmployeeId: z.string().min(1, 'Target employee ID is required'),
  reason: z.string().optional(),
});

export const approveTransferSchema = z.object({
  remarks: z.string().optional(),
});

export const rejectTransferSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export const cancelTransferSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});
