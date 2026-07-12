import mongoose, { Schema, Document } from 'mongoose';

import { CategoryEntity } from '../../../domain/entities/category.entity.js';

export interface CategoryDocument extends Omit<CategoryEntity, 'id'>, Document {
  id: string;
}

const customFieldSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['text', 'number', 'date', 'boolean'], required: true },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    customFields: { type: [customFieldSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = mongoose.model<CategoryDocument>('AssetCategory', categorySchema, 'assetCategories');
