import { AssetStatus, AssetCondition } from 'shared/enums';

import { CategoryEntity } from './category.entity.js';
import { DepartmentEntity } from './department.entity.js';

export interface AssetEntity {
  id: string;
  assetTag: string;
  name: string;
  categoryId: string | CategoryEntity;
  departmentId: string | DepartmentEntity;
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
