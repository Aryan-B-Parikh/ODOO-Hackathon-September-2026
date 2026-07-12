import fs from 'fs';
import path from 'path';

const files = {
  'shared/src/schemas/department.schema.ts': `import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  managerId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
`,
  'shared/src/schemas/employee.schema.ts': `import { z } from 'zod';
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
`,
  'shared/src/dto/department.dto.ts': `import { z } from 'zod';
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
`,
  'shared/src/dto/employee.dto.ts': `import { z } from 'zod';
import { createEmployeeSchema, updateEmployeeSchema, promoteEmployeeSchema } from '../schemas/employee.schema.js';
import { Role } from '../enums/role.enum.js';

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
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

// Update barrel files
const updateBarrel = (file, line) => {
  const fullPath = path.resolve(process.cwd(), file);
  let content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
  if (!content.includes(line)) {
    fs.writeFileSync(fullPath, content + '\\n' + line + '\\n');
  }
};

updateBarrel('shared/src/schemas/index.ts', "export * from './department.schema.js';\\nexport * from './employee.schema.js';");
updateBarrel('shared/src/dto/index.ts', "export * from './department.dto.js';\\nexport * from './employee.dto.js';");

console.log('Shared files generated.');
