import { z } from 'zod';

import { Role } from '../enums/role.enum.js';
import { createEmployeeSchema, updateEmployeeSchema, promoteEmployeeSchema } from '../schemas/employee.schema.js';

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type PromoteEmployeeDto = z.infer<typeof promoteEmployeeSchema>;

export interface EmployeeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  departmentId?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
