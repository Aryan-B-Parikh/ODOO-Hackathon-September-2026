import mongoose, { Document, Schema } from 'mongoose';
import { TransferStatus } from 'shared/enums';

export interface TransferRequestDocument extends Document {
  assetId: mongoose.Types.ObjectId;
  fromEmployeeId: mongoose.Types.ObjectId;
  toEmployeeId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedBy?: mongoose.Types.ObjectId;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  reason?: string;
  remarks?: string;
  status: TransferStatus;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transferRequestSchema = new Schema<TransferRequestDocument>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    fromEmployeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toEmployeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    requestedAt: { type: Date, required: true, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    reason: { type: String },
    remarks: { type: String },
    status: {
      type: String,
      enum: Object.values(TransferStatus),
      default: TransferStatus.Pending,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

transferRequestSchema.index({ assetId: 1 });
transferRequestSchema.index({ status: 1 });
transferRequestSchema.index({ requestedAt: -1 });
transferRequestSchema.index({ fromEmployeeId: 1 });
transferRequestSchema.index({ toEmployeeId: 1 });

export const TransferRequestModel = mongoose.model<TransferRequestDocument>('TransferRequest', transferRequestSchema);
