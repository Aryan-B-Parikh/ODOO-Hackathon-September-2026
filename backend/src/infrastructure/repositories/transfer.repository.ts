import mongoose from 'mongoose';
import { CreateTransferRequestDto, ApproveTransferDto, RejectTransferDto, CancelTransferDto } from 'shared/dto';
import { TransferStatus, AllocationStatus } from 'shared/enums';

import { TransferRequestEntity } from '../../domain/entities/transfer.entity.js';
import { AllocationModel } from '../database/models/allocation.model.js';
import { AssetModel } from '../database/models/asset.model.js';
import { TransferRequestModel, TransferRequestDocument } from '../database/models/transfer.model.js';


export class TransferRepository {
  async createRequest(assetId: string, fromEmployeeId: string, data: CreateTransferRequestDto, userId: string): Promise<TransferRequestEntity> {
    const doc = new TransferRequestModel({
      assetId,
      fromEmployeeId,
      toEmployeeId: data.targetEmployeeId,
      reason: data.reason,
      requestedBy: userId,
      status: TransferStatus.Pending,
      requestedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
    });
    await doc.save();
    return this.mapToEntity(doc);
  }

  async approve(id: string, userId: string, data: ApproveTransferDto): Promise<TransferRequestEntity | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const transfer = await TransferRequestModel.findById(id).session(session);
      if (!transfer || transfer.status !== TransferStatus.Pending) {
        throw new Error('Transfer request not found or not pending');
      }

      // Close old allocation
      const oldAllocation = await AllocationModel.findOne({
        assetId: transfer.assetId,
        employeeId: transfer.fromEmployeeId,
        status: AllocationStatus.Active
      }).session(session);

      if (oldAllocation) {
        oldAllocation.status = AllocationStatus.Returned;
        oldAllocation.returnedAt = new Date();
        oldAllocation.returnedBy = new mongoose.Types.ObjectId(userId);
        oldAllocation.updatedBy = new mongoose.Types.ObjectId(userId);
        await oldAllocation.save({ session });
      }

      // Create new allocation
      await AllocationModel.create([{
        assetId: transfer.assetId,
        employeeId: transfer.toEmployeeId,
        allocatedBy: userId,
        allocatedAt: new Date(),
        status: AllocationStatus.Active,
        createdBy: userId,
        updatedBy: userId,
      }], { session });

      // Update asset audit fields
      await AssetModel.findByIdAndUpdate(transfer.assetId, {
        updatedBy: userId,
      }, { session });

      // Mark transfer approved
      transfer.status = TransferStatus.Approved;
      transfer.approvedAt = new Date();
      transfer.approvedBy = new mongoose.Types.ObjectId(userId);
      transfer.updatedBy = new mongoose.Types.ObjectId(userId);
      if (data.remarks) transfer.remarks = data.remarks;
      await transfer.save({ session });

      await session.commitTransaction();
      return this.mapToEntity(transfer);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async reject(id: string, userId: string, data: RejectTransferDto): Promise<TransferRequestEntity | null> {
    const doc = await TransferRequestModel.findOneAndUpdate(
      { _id: id, status: TransferStatus.Pending },
      {
        status: TransferStatus.Rejected,
        rejectedAt: new Date(),
        rejectedBy: userId,
        reason: data.reason,
        updatedBy: userId,
      },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async cancel(id: string, userId: string, data: CancelTransferDto): Promise<TransferRequestEntity | null> {
    const doc = await TransferRequestModel.findOneAndUpdate(
      { _id: id, status: TransferStatus.Pending },
      {
        status: TransferStatus.Cancelled,
        updatedBy: userId,
        reason: data.reason,
      },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async findPending(assetId: string): Promise<TransferRequestEntity | null> {
    const doc = await TransferRequestModel.findOne({ assetId, status: TransferStatus.Pending });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findPendingAll(): Promise<TransferRequestEntity[]> {
    const docs = await TransferRequestModel.find({ status: TransferStatus.Pending }).sort({ requestedAt: -1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByAsset(assetId: string): Promise<TransferRequestEntity[]> {
    const docs = await TransferRequestModel.find({ assetId }).sort({ requestedAt: -1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByEmployee(employeeId: string): Promise<TransferRequestEntity[]> {
    const docs = await TransferRequestModel.find({
      $or: [{ fromEmployeeId: employeeId }, { toEmployeeId: employeeId }]
    }).sort({ requestedAt: -1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findById(id: string): Promise<TransferRequestEntity | null> {
    const doc = await TransferRequestModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  private mapToEntity(doc: TransferRequestDocument): TransferRequestEntity {
    return {
      id: doc._id.toString(),
      assetId: doc.assetId.toString(),
      fromEmployeeId: doc.fromEmployeeId.toString(),
      toEmployeeId: doc.toEmployeeId.toString(),
      requestedBy: doc.requestedBy.toString(),
      approvedBy: doc.approvedBy?.toString(),
      rejectedBy: doc.rejectedBy?.toString(),
      requestedAt: doc.requestedAt.toISOString(),
      approvedAt: doc.approvedAt?.toISOString(),
      rejectedAt: doc.rejectedAt?.toISOString(),
      reason: doc.reason,
      remarks: doc.remarks,
      status: doc.status as TransferStatus,
      createdBy: doc.createdBy?.toString(),
      updatedBy: doc.updatedBy?.toString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
