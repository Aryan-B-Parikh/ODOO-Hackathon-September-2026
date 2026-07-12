import { z } from 'zod';

export const customFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required').max(50),
  type: z.enum(['text', 'number', 'date', 'boolean']),
  required: z.boolean().default(false),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  customFields: z.array(customFieldSchema).optional().default([]),
});

export const updateCategorySchema = createCategorySchema.partial();

export const changeCategoryStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive']),
});
