import mongoose, { Schema, Document } from 'mongoose';

import { DepartmentEntity } from '../../../domain/entities/department.entity.js';

export interface DepartmentDocument extends Omit<DepartmentEntity, 'id'>, Document {
  id: string;
}

const departmentSchema = new Schema<DepartmentDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    managerId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const DepartmentModel = mongoose.model<DepartmentDocument>('Department', departmentSchema);
