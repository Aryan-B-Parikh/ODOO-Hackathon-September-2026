import { CreateTransferRequestDto, ApproveTransferDto, RejectTransferDto, CancelTransferDto } from 'shared/dto';
import { TransferStatus } from 'shared/enums';

import { TransferRequestEntity } from '../../../domain/entities/transfer.entity.js';
import { AllocationRepository } from '../../../infrastructure/repositories/allocation.repository.js';
import { TransferRepository } from '../../../infrastructure/repositories/transfer.repository.js';
import { UserRepository } from '../../../infrastructure/repositories/user.repository.js';
import { ConflictError, NotFoundError, BadRequestError } from '../../../presentation/middleware/error-handler.js';


export class TransferUseCases {
  constructor(
    private transferRepository: TransferRepository,
    private allocationRepository: AllocationRepository,
    private userRepository: UserRepository
  ) {}

  async createRequest(data: CreateTransferRequestDto, userId: string): Promise<TransferRequestEntity> {
    // Check if asset has an active allocation
    const activeAllocation = await this.allocationRepository.findActiveAllocation(data.assetId);
    if (!activeAllocation) {
      throw new BadRequestError('Only allocated assets can be transferred');
    }

    // Asset must currently belong to fromEmployeeId
    // Normally we allow the current owner or asset manager to initiate
    // But business rule: "Asset must currently belong to fromEmployeeId"
    const fromEmployeeId = activeAllocation.employeeId;

    // Validate destination employee
    if (fromEmployeeId === data.targetEmployeeId) {
      throw new BadRequestError('Cannot transfer to the same employee');
    }

    const targetEmployee = await this.userRepository.findById(data.targetEmployeeId);
    if (!targetEmployee || !targetEmployee.isActive) {
      throw new NotFoundError('Target employee not found or inactive');
    }

    // Prevent duplicate pending requests
    const existingPending = await this.transferRepository.findPending(data.assetId);
    if (existingPending) {
      throw new ConflictError('A pending transfer request already exists for this asset');
    }

    return this.transferRepository.createRequest(data.assetId, fromEmployeeId, data, userId);
  }

  async approve(id: string, data: ApproveTransferDto, userId: string): Promise<TransferRequestEntity> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) throw new NotFoundError('Transfer request not found');
    if (transfer.status !== TransferStatus.Pending) {
      throw new BadRequestError('Only pending requests can be approved');
    }

    const approved = await this.transferRepository.approve(id, userId, data);
    if (!approved) throw new NotFoundError('Transfer request not found');
    return approved;
  }

  async reject(id: string, data: RejectTransferDto, userId: string): Promise<TransferRequestEntity> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) throw new NotFoundError('Transfer request not found');
    if (transfer.status !== TransferStatus.Pending) {
      throw new BadRequestError('Only pending requests can be rejected');
    }

    const rejected = await this.transferRepository.reject(id, userId, data);
    if (!rejected) throw new NotFoundError('Transfer request not found');
    return rejected;
  }

  async cancel(id: string, data: CancelTransferDto, userId: string): Promise<TransferRequestEntity> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) throw new NotFoundError('Transfer request not found');
    if (transfer.status !== TransferStatus.Pending) {
      throw new BadRequestError('Only pending requests can be cancelled');
    }

    const cancelled = await this.transferRepository.cancel(id, userId, data);
    if (!cancelled) throw new NotFoundError('Transfer request not found');
    return cancelled;
  }

  async getPending(): Promise<TransferRequestEntity[]> {
    return this.transferRepository.findPendingAll();
  }

  async getByAsset(assetId: string): Promise<TransferRequestEntity[]> {
    return this.transferRepository.findByAsset(assetId);
  }

  async getByEmployee(employeeId: string): Promise<TransferRequestEntity[]> {
    const employee = await this.userRepository.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');
    return this.transferRepository.findByEmployee(employeeId);
  }
}
