import mongoose, { Document, Schema } from 'mongoose';
import { AssetStatus, AssetCondition } from 'shared/enums';

import { CounterModel } from './counter.model.js';

export interface AssetDocument extends Document {
  assetTag: string;
  name: string;
  categoryId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  status: AssetStatus;
  condition: AssetCondition;
  serialNumber?: string;
  location?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
  isShared: boolean;
  metadata?: Map<string, unknown>;
  images: string[];
  documents: string[];
  isArchived: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<AssetDocument>(
  {
    assetTag: { type: String, unique: true }, // Will be auto-generated before validate
    name: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    status: {
      type: String,
      enum: Object.values(AssetStatus),
      default: AssetStatus.Available,
    },
    condition: {
      type: String,
      enum: Object.values(AssetCondition),
      required: true,
    },
    serialNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    location: { type: String },
    acquisitionDate: { type: String },
    acquisitionCost: { type: Number },
    isShared: { type: Boolean, default: false },
    metadata: { type: Map, of: Schema.Types.Mixed },
    images: { type: [String], default: [] },
    documents: { type: [String], default: [] },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// Auto-generate assetTag before saving if it doesn't exist
assetSchema.pre('save', async function (next) {
  if (this.isNew && !this.assetTag) {
    try {
      const counter = await CounterModel.findByIdAndUpdate(
        'assetTag',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format: AF-0001
      this.assetTag = `AF-${counter.seq.toString().padStart(4, '0')}`;
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Indexes
assetSchema.index({ name: 'text', assetTag: 'text' });
assetSchema.index({ status: 1 });
assetSchema.index({ departmentId: 1 });
assetSchema.index({ categoryId: 1 });

export const AssetModel = mongoose.model<AssetDocument>('Asset', assetSchema);
