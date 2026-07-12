import fs from 'fs';
import path from 'path';

const files = {
  'backend/src/domain/entities/department.entity.ts': `export class DepartmentEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string,
    public readonly isActive: boolean,
    public readonly managerId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
`,
  'backend/src/infrastructure/database/models/department.model.ts': `import mongoose, { Schema, Document } from 'mongoose';
import { DepartmentEntity } from '../../../domain/entities/department.entity.js';

export interface DepartmentDocument extends Omit<DepartmentEntity, 'id'>, Document {
  id: string;
}

const departmentSchema = new Schema<DepartmentDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    managerId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const DepartmentModel = mongoose.model<DepartmentDocument>('Department', departmentSchema);
`,
  'backend/src/infrastructure/repositories/department.repository.ts': `import { DepartmentEntity } from '../../domain/entities/department.entity.js';
import { DepartmentModel } from '../database/models/department.model.js';
import { CreateDepartmentDto, UpdateDepartmentDto } from 'shared/dto/department.dto.js';

export class DepartmentRepository {
  private mapToEntity(doc: any): DepartmentEntity {
    return new DepartmentEntity(
      doc._id.toString(),
      doc.name,
      doc.code,
      doc.isActive,
      doc.managerId,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async create(data: CreateDepartmentDto): Promise<DepartmentEntity> {
    const doc = new DepartmentModel(data);
    await doc.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    const doc = await DepartmentModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByName(name: string): Promise<DepartmentEntity | null> {
    const doc = await DepartmentModel.findOne({ name });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(skip = 0, limit = 50): Promise<{ data: DepartmentEntity[]; total: number }> {
    const [docs, total] = await Promise.all([
      DepartmentModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      DepartmentModel.countDocuments()
    ]);
    return { data: docs.map(this.mapToEntity), total };
  }

  async update(id: string, data: UpdateDepartmentDto): Promise<DepartmentEntity | null> {
    const doc = await DepartmentModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }

  async deactivate(id: string): Promise<DepartmentEntity | null> {
    const doc = await DepartmentModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }
}
`,
  'backend/src/application/use-cases/organization/department.use-cases.ts': `import { DepartmentRepository } from '../../../infrastructure/repositories/department.repository.js';
import { CreateDepartmentDto, UpdateDepartmentDto } from 'shared/dto/department.dto.js';
import { ConflictError, NotFoundError } from '../../../presentation/middleware/error-handler.js';

export class DepartmentUseCases {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async create(data: CreateDepartmentDto) {
    const existing = await this.departmentRepository.findByName(data.name);
    if (existing) {
      throw new ConflictError('Department with this name already exists');
    }
    return this.departmentRepository.create(data);
  }

  async update(id: string, data: UpdateDepartmentDto) {
    const department = await this.departmentRepository.findById(id);
    if (!department) throw new NotFoundError('Department not found');
    
    if (data.name && data.name !== department.name) {
      const existing = await this.departmentRepository.findByName(data.name);
      if (existing) throw new ConflictError('Department with this name already exists');
    }
    return this.departmentRepository.update(id, data);
  }

  async list(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.departmentRepository.findAll(skip, limit);
  }

  async deactivate(id: string) {
    const department = await this.departmentRepository.deactivate(id);
    if (!department) throw new NotFoundError('Department not found');
    return department;
  }
}
`,
  'backend/src/application/use-cases/organization/employee.use-cases.ts': `import { UserRepository } from '../../../infrastructure/repositories/user.repository.js';
import { PasswordService } from '../../../core/security/password.service.js';
import { CreateEmployeeDto, UpdateEmployeeDto, PromoteEmployeeDto } from 'shared/dto/employee.dto.js';
import { ConflictError, NotFoundError } from '../../../presentation/middleware/error-handler.js';

export class EmployeeUseCases {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async create(data: CreateEmployeeDto) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new ConflictError('Employee with this email already exists');
    
    const passwordHash = await this.passwordService.hash(data.password);
    return this.userRepository.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      role: data.role,
      departmentId: data.departmentId
    });
  }

  async update(id: string, data: UpdateEmployeeDto) {
    const updated = await this.userRepository.update(id, data);
    if (!updated) throw new NotFoundError('Employee not found');
    return updated;
  }

  async promote(id: string, data: PromoteEmployeeDto) {
    const updated = await this.userRepository.update(id, { role: data.role });
    if (!updated) throw new NotFoundError('Employee not found');
    return updated;
  }

  async list(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.userRepository.findAll(skip, limit);
  }

  async getById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('Employee not found');
    return user;
  }
}
`,
  'backend/src/presentation/controllers/department.controller.ts': `import { Request, Response } from 'express';
import { DepartmentUseCases } from '../../application/use-cases/organization/department.use-cases.js';
import { createDepartmentSchema, updateDepartmentSchema } from 'shared/schemas/department.schema.js';

export class DepartmentController {
  constructor(private readonly departmentUseCases: DepartmentUseCases) {}

  create = async (req: Request, res: Response) => {
    const data = createDepartmentSchema.parse(req.body);
    const department = await this.departmentUseCases.create(data);
    res.status(201).json({ success: true, data: department });
  };

  list = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { data, total } = await this.departmentUseCases.list(page, limit);
    res.json({
      success: true,
      data,
      meta: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  };

  update = async (req: Request, res: Response) => {
    const data = updateDepartmentSchema.parse(req.body);
    const department = await this.departmentUseCases.update(req.params.id, data);
    res.json({ success: true, data: department });
  };

  deactivate = async (req: Request, res: Response) => {
    const department = await this.departmentUseCases.deactivate(req.params.id);
    res.json({ success: true, data: department });
  };
}
`,
  'backend/src/presentation/controllers/employee.controller.ts': `import { Request, Response } from 'express';
import { EmployeeUseCases } from '../../application/use-cases/organization/employee.use-cases.js';
import { createEmployeeSchema, updateEmployeeSchema, promoteEmployeeSchema } from 'shared/schemas/employee.schema.js';

export class EmployeeController {
  constructor(private readonly employeeUseCases: EmployeeUseCases) {}

  create = async (req: Request, res: Response) => {
    const data = createEmployeeSchema.parse(req.body);
    const employee = await this.employeeUseCases.create(data);
    // don't send password hash
    const { passwordHash, ...rest } = employee as any;
    res.status(201).json({ success: true, data: rest });
  };

  list = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { data, total } = await this.employeeUseCases.list(page, limit);
    
    const safeData = data.map(u => {
      const { passwordHash, ...rest } = u as any;
      return rest;
    });

    res.json({
      success: true,
      data: safeData,
      meta: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  };

  getById = async (req: Request, res: Response) => {
    const employee = await this.employeeUseCases.getById(req.params.id);
    const { passwordHash, ...rest } = employee as any;
    res.json({ success: true, data: rest });
  };

  update = async (req: Request, res: Response) => {
    const data = updateEmployeeSchema.parse(req.body);
    const employee = await this.employeeUseCases.update(req.params.id, data);
    const { passwordHash, ...rest } = employee as any;
    res.json({ success: true, data: rest });
  };

  promote = async (req: Request, res: Response) => {
    const data = promoteEmployeeSchema.parse(req.body);
    const employee = await this.employeeUseCases.promote(req.params.id, data);
    const { passwordHash, ...rest } = employee as any;
    res.json({ success: true, data: rest });
  };
}
`,
  'backend/src/presentation/routes/department.routes.ts': `import { Router } from 'express';
import { container } from '../../core/container.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { Role } from 'shared/enums/role.enum.js';

export const departmentRoutes = Router();

const controller = container.departmentController;

departmentRoutes.use(requireAuth);

departmentRoutes.get('/', controller.list);
departmentRoutes.post('/', requireRole([Role.Admin]), controller.create);
departmentRoutes.put('/:id', requireRole([Role.Admin]), controller.update);
departmentRoutes.post('/:id/deactivate', requireRole([Role.Admin]), controller.deactivate);
`,
  'backend/src/presentation/routes/employee.routes.ts': `import { Router } from 'express';
import { container } from '../../core/container.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { Role } from 'shared/enums/role.enum.js';

export const employeeRoutes = Router();

const controller = container.employeeController;

employeeRoutes.use(requireAuth);

employeeRoutes.get('/', controller.list);
employeeRoutes.get('/:id', controller.getById);
employeeRoutes.post('/', requireRole([Role.Admin]), controller.create);
employeeRoutes.put('/:id', requireRole([Role.Admin]), controller.update);
employeeRoutes.post('/:id/role', requireRole([Role.Admin]), controller.promote);
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Backend files generated.');
