import { CreateDepartmentDto, UpdateDepartmentDto } from 'shared/dto';

import { DepartmentRepository } from '../../../infrastructure/repositories/department.repository.js';
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
