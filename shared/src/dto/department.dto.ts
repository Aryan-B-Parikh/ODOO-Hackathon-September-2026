import { z } from 'zod';

import { createDepartmentSchema, updateDepartmentSchema } from '../schemas/department.schema.js';

export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
