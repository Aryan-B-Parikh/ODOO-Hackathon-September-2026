import { z } from 'zod';

import { AssetStatus, AssetCondition } from '../enums/asset.enum.js';

export const createAssetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  departmentId: z.string().min(1, 'Department is required'),
  condition: z.nativeEnum(AssetCondition, {
    errorMap: () => ({ message: 'Invalid condition' }),
  }),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  acquisitionDate: z.string().datetime().optional(),
  acquisitionCost: z.number().nonnegative().optional(),
  isShared: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
  images: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
  isArchived: z.boolean().default(false),
});

export const updateAssetSchema = createAssetSchema.partial();

export const changeAssetStatusSchema = z.object({
  status: z.nativeEnum(AssetStatus, {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});
