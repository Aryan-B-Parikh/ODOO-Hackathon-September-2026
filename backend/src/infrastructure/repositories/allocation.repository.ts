import mongoose from 'mongoose';
import { AllocateAssetDto, ReturnAssetDto } from 'shared/dto';
import { AllocationStatus, AssetStatus } from 'shared/enums';

import { AllocationEntity } from '../../domain/entities/allocation.entity.js';
import { AllocationDocument, AllocationModel } from '../database/models/allocation.model.js';
import { AssetModel } from '../database/models/asset.model.js';


export class AllocationRepository {
  async findActiveAllocation(assetId: string): Promise<AllocationEntity | null> {
    const doc = await AllocationModel.findOne({ assetId, status: AllocationStatus.Active });
    return doc ? this.mapToEntity(doc) : null;
  }

  async allocate(assetId: string, employeeId: string, allocatedBy: string, data: AllocateAssetDto): Promise<AllocationEntity> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Create Allocation
      const allocationDocs = await AllocationModel.create([{
        assetId,
        employeeId,
        allocatedBy,
        expectedReturnDate: data.expectedReturnDate,
        remarks: data.checkoutNotes,
        status: AllocationStatus.Active,
        allocatedAt: new Date(),
        createdBy: allocatedBy,
        updatedBy: allocatedBy,
      }], { session });

      // Update Asset Status
      await AssetModel.findByIdAndUpdate(assetId, {
        status: AssetStatus.Allocated,
        updatedBy: allocatedBy,
      }, { session, new: true });

      await session.commitTransaction();
      return this.mapToEntity(allocationDocs[0]);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async returnAsset(allocationId: string, returnedBy: string, data: ReturnAssetDto): Promise<AllocationEntity | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const allocation = await AllocationModel.findById(allocationId).session(session);
      if (!allocation || allocation.status !== AllocationStatus.Active) {
        throw new Error('Active allocation not found');
      }

      allocation.status = AllocationStatus.Returned;
      allocation.returnedAt = new Date();
      allocation.returnedBy = new mongoose.Types.ObjectId(returnedBy);
      allocation.updatedBy = new mongoose.Types.ObjectId(returnedBy);
      if (data.checkinNotes) {
        allocation.remarks = (allocation.remarks ? allocation.remarks + ' | ' : '') + data.checkinNotes;
      }
      await allocation.save({ session });

      await AssetModel.findByIdAndUpdate(allocation.assetId, {
        status: AssetStatus.Available,
        condition: data.condition,
        updatedBy: returnedBy,
      }, { session, new: true });

      await session.commitTransaction();
      return this.mapToEntity(allocation);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findHistoryByAsset(assetId: string): Promise<AllocationEntity[]> {
    const docs = await AllocationModel.find({ assetId }).sort({ allocatedAt: -1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findHistoryByEmployee(employeeId: string): Promise<AllocationEntity[]> {
    const docs = await AllocationModel.find({ employeeId }).sort({ allocatedAt: -1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  private mapToEntity(doc: AllocationDocument): AllocationEntity {
    return {
      id: doc._id.toString(),
      assetId: doc.assetId.toString(),
      employeeId: doc.employeeId.toString(),
      allocatedBy: doc.allocatedBy.toString(),
      allocatedAt: doc.allocatedAt.toISOString(),
      expectedReturnDate: doc.expectedReturnDate?.toISOString(),
      returnedAt: doc.returnedAt?.toISOString(),
      returnedBy: doc.returnedBy?.toString(),
      status: doc.status as AllocationStatus,
      remarks: doc.remarks,
      createdBy: doc.createdBy?.toString(),
      updatedBy: doc.updatedBy?.toString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
