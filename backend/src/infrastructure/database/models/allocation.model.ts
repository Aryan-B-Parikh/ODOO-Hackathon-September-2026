import mongoose, { Document, Schema } from 'mongoose';
import { AllocationStatus } from 'shared/enums';

export interface AllocationDocument extends Document {
  assetId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  allocatedBy: mongoose.Types.ObjectId;
  allocatedAt: Date;
  expectedReturnDate?: Date;
  returnedAt?: Date;
  returnedBy?: mongoose.Types.ObjectId;
  status: AllocationStatus;
  remarks?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const allocationSchema = new Schema<AllocationDocument>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    allocatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    allocatedAt: { type: Date, required: true, default: Date.now },
    expectedReturnDate: { type: Date },
    returnedAt: { type: Date },
    returnedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: Object.values(AllocationStatus),
      default: AllocationStatus.Active,
    },
    remarks: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

allocationSchema.index({ assetId: 1 });
allocationSchema.index({ employeeId: 1 });
allocationSchema.index({ status: 1 });
allocationSchema.index({ allocatedAt: -1 });

export const AllocationModel = mongoose.model<AllocationDocument>('Allocation', allocationSchema);
