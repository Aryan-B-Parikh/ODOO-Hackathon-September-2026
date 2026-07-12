import { CreateAssetDto, UpdateAssetDto } from 'shared/dto';
import { AssetStatus } from 'shared/enums';

import { AssetEntity } from '../../../domain/entities/asset.entity.js';
import { AssetRepository } from '../../../infrastructure/repositories/asset.repository.js';
import { CategoryRepository } from '../../../infrastructure/repositories/category.repository.js';
import { DepartmentRepository } from '../../../infrastructure/repositories/department.repository.js';
import { ConflictError, NotFoundError, BadRequestError } from '../../../presentation/middleware/error-handler.js';


export class AssetUseCases {
  constructor(
    private assetRepository: AssetRepository,
    private categoryRepository: CategoryRepository,
    private departmentRepository: DepartmentRepository
  ) {}

  async create(data: CreateAssetDto, userId?: string): Promise<AssetEntity> {
    // 1. Verify Category exists and is active
    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) throw new NotFoundError('Category not found');
    if (category.status !== 'Active') throw new BadRequestError('Cannot register asset under an inactive category');

    // 2. Verify Department exists and is active
    const department = await this.departmentRepository.findById(data.departmentId);
    if (!department) throw new NotFoundError('Department not found');
    if (!department.isActive) throw new BadRequestError('Cannot register asset to an inactive department');

    // 3. Verify Serial Number uniqueness if provided
    if (data.serialNumber) {
      const existing = await this.assetRepository.findBySerialNumber(data.serialNumber);
      if (existing) throw new ConflictError('Serial number already in use');
    }

    return this.assetRepository.create({ ...data, createdBy: userId, updatedBy: userId } as unknown as Parameters<AssetRepository['create']>[0]);
  }

  async getById(id: string): Promise<AssetEntity> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset not found');
    return asset;
  }

  async getAll(skip = 0, limit = 50, filters: Record<string, unknown> = {}): Promise<{ data: AssetEntity[]; total: number }> {
    return this.assetRepository.findAll(skip, limit, filters);
  }

  async update(id: string, data: UpdateAssetDto, userId?: string): Promise<AssetEntity> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset not found');
    
    // Cannot edit archived assets except where defined (e.g., status changes or unarchiving)
    if (asset.isArchived && data.isArchived !== false) {
      throw new BadRequestError('Cannot edit an archived asset');
    }

    if (data.serialNumber && data.serialNumber !== asset.serialNumber) {
      const existing = await this.assetRepository.findBySerialNumber(data.serialNumber);
      if (existing) throw new ConflictError('Serial number already in use');
    }

    const updated = await this.assetRepository.update(id, { ...data, updatedBy: userId });
    if (!updated) throw new NotFoundError('Asset not found');
    return updated;
  }

  async changeStatus(id: string, status: AssetStatus, userId?: string): Promise<AssetEntity> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset not found');

    if (asset.status === AssetStatus.Disposed) {
      throw new BadRequestError('Cannot change status of a Disposed asset');
    }

    const updated = await this.assetRepository.changeStatus(id, status, userId);
    if (!updated) throw new NotFoundError('Asset not found');
    return updated;
  }
}
