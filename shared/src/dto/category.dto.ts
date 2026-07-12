import { z } from 'zod';

import { 
  createCategorySchema, 
  updateCategorySchema, 
  changeCategoryStatusSchema,
  customFieldSchema
} from '../schemas/category.schema.js';

export type CustomFieldDto = z.infer<typeof customFieldSchema>;
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
export type ChangeCategoryStatusDto = z.infer<typeof changeCategoryStatusSchema>;

export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  customFields: CustomFieldDto[];
  createdAt: Date;
  updatedAt: Date;
}
