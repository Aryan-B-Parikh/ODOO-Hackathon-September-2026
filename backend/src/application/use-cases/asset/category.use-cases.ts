import { CreateCategoryDto, UpdateCategoryDto } from 'shared/dto';

import { CategoryEntity } from '../../../domain/entities/category.entity.js';
import { CategoryRepository } from '../../../infrastructure/repositories/category.repository.js';
import { ConflictError, NotFoundError } from '../../../presentation/middleware/error-handler.js';

export class CategoryUseCases {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(data: CreateCategoryDto): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findByName(data.name);
    if (existing) {
      throw new ConflictError('A category with this name already exists');
    }

    return this.categoryRepository.create(data);
  }

  async getById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Asset Category not found');
    return category;
  }

  async getAll(skip = 0, limit = 50, filters: Record<string, unknown> = {}): Promise<{ data: CategoryEntity[]; total: number }> {
    return this.categoryRepository.findAll(skip, limit, filters);
  }

  async update(id: string, data: UpdateCategoryDto): Promise<CategoryEntity> {
    if (data.name) {
      const existing = await this.categoryRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError('A category with this name already exists');
      }
    }

    const updated = await this.categoryRepository.update(id, data);
    if (!updated) throw new NotFoundError('Asset Category not found');
    return updated;
  }

  async changeStatus(id: string, status: 'Active' | 'Inactive'): Promise<CategoryEntity> {
    const updated = await this.categoryRepository.update(id, { status });
    if (!updated) throw new NotFoundError('Asset Category not found');
    return updated;
  }

  async deactivate(id: string): Promise<void> {
    // Treat deletion as soft delete / deactivate
    const updated = await this.categoryRepository.update(id, { status: 'Inactive' });
    if (!updated) throw new NotFoundError('Asset Category not found');
  }
}
