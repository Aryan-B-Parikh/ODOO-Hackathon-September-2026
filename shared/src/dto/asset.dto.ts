import { z } from 'zod';

import { AssetStatus, AssetCondition } from '../enums/asset.enum.js';
import { createAssetSchema, updateAssetSchema, changeAssetStatusSchema } from '../schemas/asset.schema.js';

import { CategoryDto } from './category.dto.js';

export type CreateAssetDto = z.infer<typeof createAssetSchema>;
export type UpdateAssetDto = z.infer<typeof updateAssetSchema>;
export type ChangeAssetStatusDto = z.infer<typeof changeAssetStatusSchema>;

export interface AssetDto {
  id: string;
  assetTag: string;
  name: string;
  categoryId: string | CategoryDto;
  departmentId: string;
  status: AssetStatus;
  condition: AssetCondition;
  serialNumber?: string;
  location?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
  isShared: boolean;
  metadata?: Record<string, unknown>;
  images: string[];
  documents: string[];
  isArchived: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
