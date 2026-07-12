import { z } from 'zod';

import { Role } from '../enums/role.enum.js';

export const createEmployeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  role: z.nativeEnum(Role).default(Role.Employee),
  departmentId: z.string().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  departmentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const promoteEmployeeSchema = z.object({
  role: z.nativeEnum(Role),
});
