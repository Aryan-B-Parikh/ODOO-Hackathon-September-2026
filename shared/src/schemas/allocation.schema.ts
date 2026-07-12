import { z } from 'zod';

export const allocateAssetSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  assignedToId: z.string().min(1, 'Assigned user/department ID is required'),
  expectedReturnDate: z.string().datetime().optional().or(z.string().min(1, 'Expected return date must be valid string')),
  checkoutNotes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  checkinNotes: z.string().optional(),
  condition: z.string().min(1, 'Condition is required'),
});
