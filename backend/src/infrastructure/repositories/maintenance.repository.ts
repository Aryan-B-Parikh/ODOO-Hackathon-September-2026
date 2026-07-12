import mongoose from 'mongoose';
import { RaiseMaintenanceRequestDto, AssignMaintenanceDto, StartMaintenanceDto, CompleteMaintenanceDto, CancelMaintenanceDto } from 'shared/dto';
import { MaintenanceStatus, AssetStatus, AllocationStatus } from 'shared/enums';

import { MaintenanceRequestEntity } from '../../domain/entities/maintenance.entity.js';
import { AllocationModel } from '../database/models/allocation.model.js';
import { AssetModel } from '../database/models/asset.model.js';
import { MaintenanceRequestModel, MaintenanceRequestDocument } from '../database/models/maintenance.model.js';


export class MaintenanceRepository {
  async create(data: RaiseMaintenanceRequestDto, userId: string): Promise<MaintenanceRequestEntity> {
    const doc = new MaintenanceRequestModel({
      assetId: data.assetId,
      issue: data.issue,
      priority: data.priority,
      reportedBy: userId,
      status: MaintenanceStatus.Open,
      createdBy: userId,
      updatedBy: userId,
    });
    await doc.save();
    return this.mapToEntity(doc);
  }

  async assign(id: string, userId: string, data: AssignMaintenanceDto): Promise<MaintenanceRequestEntity | null> {
    const doc = await MaintenanceRequestModel.findOneAndUpdate(
      { _id: id, status: MaintenanceStatus.Open },
      {
        assignedTo: data.assignedTo,
        estimatedCompletion: data.estimatedCompletion,
        updatedBy: userId,
      },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async start(id: string, userId: string, data: StartMaintenanceDto): Promise<MaintenanceRequestEntity | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const maintenance = await MaintenanceRequestModel.findOne({ _id: id, status: { $in: [MaintenanceStatus.Open] } }).session(session);
      if (!maintenance) {
        throw new Error('Maintenance request not found or not in Open state');
      }

      // Start Maintenance
      maintenance.status = MaintenanceStatus.InProgress;
      maintenance.updatedBy = new mongoose.Types.ObjectId(userId);
      if (data.remarks) maintenance.remarks = data.remarks;
      await maintenance.save({ session });

      // Update Asset Status -> UnderMaintenance
      await AssetModel.findByIdAndUpdate(
        maintenance.assetId,
        { status: AssetStatus.UnderMaintenance, updatedBy: userId },
        { session }
      );

      await session.commitTransaction();
      return this.mapToEntity(maintenance);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async complete(id: string, userId: string, data: CompleteMaintenanceDto): Promise<MaintenanceRequestEntity | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const maintenance = await MaintenanceRequestModel.findOne({ _id: id, status: MaintenanceStatus.InProgress }).session(session);
      if (!maintenance) {
        throw new Error('Maintenance request not found or not in progress');
      }

      // Complete Request
      maintenance.status = MaintenanceStatus.Completed;
      maintenance.completedAt = new Date();
      maintenance.updatedBy = new mongoose.Types.ObjectId(userId);
      if (data.remarks) maintenance.remarks = data.remarks;
      await maintenance.save({ session });

      // Check for active allocations
      const activeAllocation = await AllocationModel.findOne({
        assetId: maintenance.assetId,
        status: AllocationStatus.Active
      }).session(session);

      // Asset status -> Available (if no active allocation) or Allocated
      const newAssetStatus = activeAllocation ? AssetStatus.Allocated : AssetStatus.Available;

      await AssetModel.findByIdAndUpdate(
        maintenance.assetId,
        { status: newAssetStatus, updatedBy: userId },
        { session }
      );

      await session.commitTransaction();
      return this.mapToEntity(maintenance);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async cancel(id: string, userId: string, data: CancelMaintenanceDto): Promise<MaintenanceRequestEntity | null> {
    const doc = await MaintenanceRequestModel.findOneAndUpdate(
      { _id: id, status: MaintenanceStatus.Open },
      {
        status: MaintenanceStatus.Cancelled,
        updatedBy: userId,
        remarks: data.remarks,
      },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByAsset(assetId: string): Promise<MaintenanceRequestEntity[]> {
    const docs = await MaintenanceRequestModel.find({ assetId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findOpen(): Promise<MaintenanceRequestEntity[]> {
    const docs = await MaintenanceRequestModel.find({ status: MaintenanceStatus.Open }).sort({ createdAt: -1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByEngineer(assignedTo: string): Promise<MaintenanceRequestEntity[]> {
    const docs = await MaintenanceRequestModel.find({ assignedTo }).sort({ createdAt: -1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findActiveByAsset(assetId: string): Promise<MaintenanceRequestEntity | null> {
    const doc = await MaintenanceRequestModel.findOne({
      assetId,
      status: { $in: [MaintenanceStatus.Open, MaintenanceStatus.InProgress] }
    });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findById(id: string): Promise<MaintenanceRequestEntity | null> {
    const doc = await MaintenanceRequestModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  private mapToEntity(doc: MaintenanceRequestDocument): MaintenanceRequestEntity {
    return {
      id: doc._id.toString(),
      assetId: doc.assetId.toString(),
      reportedBy: doc.reportedBy.toString(),
      assignedTo: doc.assignedTo?.toString(),
      issue: doc.issue,
      priority: doc.priority,
      status: doc.status,
      estimatedCompletion: doc.estimatedCompletion?.toISOString(),
      completedAt: doc.completedAt?.toISOString(),
      remarks: doc.remarks,
      createdBy: doc.createdBy?.toString(),
      updatedBy: doc.updatedBy?.toString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
