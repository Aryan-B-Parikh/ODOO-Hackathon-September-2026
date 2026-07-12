import mongoose, { Document, Schema } from 'mongoose';
import { MaintenancePriority, MaintenanceStatus } from 'shared/enums';

export interface MaintenanceRequestDocument extends Document {
  assetId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  issue: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  estimatedCompletion?: Date;
  completedAt?: Date;
  remarks?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceRequestSchema = new Schema<MaintenanceRequestDocument>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    issue: { type: String, required: true },
    priority: {
      type: String,
      enum: Object.values(MaintenancePriority),
      default: MaintenancePriority.Low,
    },
    status: {
      type: String,
      enum: Object.values(MaintenanceStatus),
      default: MaintenanceStatus.Open,
    },
    estimatedCompletion: { type: Date },
    completedAt: { type: Date },
    remarks: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

maintenanceRequestSchema.index({ assetId: 1 });
maintenanceRequestSchema.index({ status: 1 });
maintenanceRequestSchema.index({ priority: 1 });
maintenanceRequestSchema.index({ createdAt: -1 });
maintenanceRequestSchema.index({ assignedTo: 1 });

export const MaintenanceRequestModel = mongoose.model<MaintenanceRequestDocument>('MaintenanceRequest', maintenanceRequestSchema);
