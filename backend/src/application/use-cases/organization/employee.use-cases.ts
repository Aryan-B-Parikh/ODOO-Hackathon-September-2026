import { CreateEmployeeDto, UpdateEmployeeDto, PromoteEmployeeDto } from 'shared/dto';

import { PasswordService } from '../../../core/security/password.service.js';
import { UserRepository } from '../../../infrastructure/repositories/user.repository.js';
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
      departmentId: data.departmentId || undefined
    });
  }

  async update(id: string, data: UpdateEmployeeDto) {
    const updated = await this.userRepository.update(id, {
      ...data,
      departmentId: data.departmentId === null ? undefined : data.departmentId
    });
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
