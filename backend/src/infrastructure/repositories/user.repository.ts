import { UserEntity } from '../../domain/entities/user.entity.js';
import { UserModel } from '../database/models/user.model.js';

export class UserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await UserModel.findById(id).lean();
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(doc: any): UserEntity {
    return {
      id: doc._id.toString(),
      email: doc.email,
      passwordHash: doc.passwordHash,
      firstName: doc.firstName,
      lastName: doc.lastName,
      role: doc.role,
      departmentId: doc.departmentId,
      isActive: doc.isActive,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
