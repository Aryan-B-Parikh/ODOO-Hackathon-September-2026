import { AllocateAssetDto, ReturnAssetDto } from 'shared/dto';
import { AssetStatus } from 'shared/enums';

import { AllocationEntity } from '../../../domain/entities/allocation.entity.js';
import { AllocationRepository } from '../../../infrastructure/repositories/allocation.repository.js';
import { AssetRepository } from '../../../infrastructure/repositories/asset.repository.js';
import { UserRepository } from '../../../infrastructure/repositories/user.repository.js';
import { ConflictError, NotFoundError, BadRequestError } from '../../../presentation/middleware/error-handler.js';


export class AllocationUseCases {
  constructor(
    private allocationRepository: AllocationRepository,
    private assetRepository: AssetRepository,
    private userRepository: UserRepository
  ) {}

  async allocate(assetId: string, data: AllocateAssetDto, userId: string): Promise<AllocationEntity> {
    // Validate asset exists and is available
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) throw new NotFoundError('Asset not found');
    if (asset.status !== AssetStatus.Available) {
      throw new ConflictError('Asset must be available before allocation');
    }

    // Validate employee exists
    const employee = await this.userRepository.findById(data.assignedToId);
    if (!employee) throw new NotFoundError('Employee not found');
    if (!employee.isActive) throw new BadRequestError('Cannot allocate to inactive employee');

    // Prevent duplicate active allocations
    const activeAllocation = await this.allocationRepository.findActiveAllocation(assetId);
    if (activeAllocation) {
      throw new ConflictError('Asset already has an active allocation');
    }

    return this.allocationRepository.allocate(assetId, data.assignedToId, userId, data);
  }

  async returnAsset(allocationId: string, data: ReturnAssetDto, userId: string): Promise<AllocationEntity> {
    const allocation = await this.allocationRepository.returnAsset(allocationId, userId, data);
    if (!allocation) {
      throw new NotFoundError('Active allocation not found');
    }
    return allocation;
  }

  async getAssetHistory(assetId: string): Promise<AllocationEntity[]> {
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) throw new NotFoundError('Asset not found');
    return this.allocationRepository.findHistoryByAsset(assetId);
  }

  async getEmployeeHistory(employeeId: string): Promise<AllocationEntity[]> {
    const employee = await this.userRepository.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');
    return this.allocationRepository.findHistoryByEmployee(employeeId);
  }
}
