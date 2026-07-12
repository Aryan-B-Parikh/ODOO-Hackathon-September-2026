import mongoose, { Schema, Document } from 'mongoose';
import { Role } from 'shared/enums';

import { UserEntity } from '../../../domain/entities/user.entity.js';

export interface UserDocument extends Omit<UserEntity, 'id'>, Document {
  id: string;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.Employee },
    departmentId: { type: String }, // Would ideally be a Schema.Types.ObjectId ref
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
