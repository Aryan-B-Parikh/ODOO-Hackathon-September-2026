import { RaiseMaintenanceRequestDto, AssignMaintenanceDto, StartMaintenanceDto, CompleteMaintenanceDto, CancelMaintenanceDto } from 'shared/dto';
import { AssetStatus, MaintenanceStatus } from 'shared/enums';

import { MaintenanceRequestEntity } from '../../../domain/entities/maintenance.entity.js';
import { AssetRepository } from '../../../infrastructure/repositories/asset.repository.js';
import { MaintenanceRepository } from '../../../infrastructure/repositories/maintenance.repository.js';
import { UserRepository } from '../../../infrastructure/repositories/user.repository.js';
import { ConflictError, NotFoundError, BadRequestError } from '../../../presentation/middleware/error-handler.js';


export class MaintenanceUseCases {
  constructor(
    private maintenanceRepository: MaintenanceRepository,
    private assetRepository: AssetRepository,
    private userRepository: UserRepository
  ) {}

  async raiseRequest(data: RaiseMaintenanceRequestDto, userId: string): Promise<MaintenanceRequestEntity> {
    // Validate asset
    const asset = await this.assetRepository.findById(data.assetId);
    if (!asset) throw new NotFoundError('Asset not found');
    
    // Retired assets cannot receive maintenance
    if (asset.status === AssetStatus.Retired || asset.status === AssetStatus.Disposed) {
      throw new BadRequestError('Retired/Disposed assets cannot receive maintenance');
    }

    // Prevent duplicate active maintenance
    const activeMaintenance = await this.maintenanceRepository.findActiveByAsset(data.assetId);
    if (activeMaintenance) {
      throw new ConflictError('Asset already has an active maintenance request');
    }

    return this.maintenanceRepository.create(data, userId);
  }

  async assign(id: string, data: AssignMaintenanceDto, userId: string): Promise<MaintenanceRequestEntity> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundError('Maintenance request not found');
    if (maintenance.status !== MaintenanceStatus.Open) {
      throw new BadRequestError('Only open requests can be assigned');
    }

    const engineer = await this.userRepository.findById(data.assignedTo);
    if (!engineer || !engineer.isActive) {
      throw new NotFoundError('Assignee not found or inactive');
    }

    const assigned = await this.maintenanceRepository.assign(id, userId, data);
    if (!assigned) throw new NotFoundError('Maintenance request not found');
    return assigned;
  }

  async start(id: string, data: StartMaintenanceDto, userId: string): Promise<MaintenanceRequestEntity> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundError('Maintenance request not found');
    if (maintenance.status !== MaintenanceStatus.Open) {
      throw new BadRequestError('Only open requests can be started');
    }

    const started = await this.maintenanceRepository.start(id, userId, data);
    if (!started) throw new NotFoundError('Maintenance request not found');
    return started;
  }

  async complete(id: string, data: CompleteMaintenanceDto, userId: string): Promise<MaintenanceRequestEntity> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundError('Maintenance request not found');
    if (maintenance.status !== MaintenanceStatus.InProgress) {
      throw new BadRequestError('Only in-progress requests can be completed');
    }

    const completed = await this.maintenanceRepository.complete(id, userId, data);
    if (!completed) throw new NotFoundError('Maintenance request not found');
    return completed;
  }

  async cancel(id: string, data: CancelMaintenanceDto, userId: string): Promise<MaintenanceRequestEntity> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundError('Maintenance request not found');
    if (maintenance.status !== MaintenanceStatus.Open) {
      throw new BadRequestError('Only open requests can be cancelled');
    }

    const cancelled = await this.maintenanceRepository.cancel(id, userId, data);
    if (!cancelled) throw new NotFoundError('Maintenance request not found');
    return cancelled;
  }

  async getByAsset(assetId: string): Promise<MaintenanceRequestEntity[]> {
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) throw new NotFoundError('Asset not found');
    return this.maintenanceRepository.findByAsset(assetId);
  }

  async getOpen(): Promise<MaintenanceRequestEntity[]> {
    return this.maintenanceRepository.findOpen();
  }
}
