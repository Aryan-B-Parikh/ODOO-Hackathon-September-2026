import { UserEntity } from '../../domain/entities/user.entity.js';
import { UserDocument, UserModel } from '../database/models/user.model.js';

export class UserRepository {
  async create(data: Partial<Omit<UserEntity, 'id'>>): Promise<UserEntity> {
    const doc = new UserModel(data);
    await doc.save();
    return this.mapToEntity(doc);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async update(id: string, data: Partial<Omit<UserEntity, 'id'>>): Promise<UserEntity | null> {
    const doc = await UserModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(skip = 0, limit = 50): Promise<{ data: UserEntity[]; total: number }> {
    const [docs, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments()
    ]);
    return { data: docs.map((doc) => this.mapToEntity(doc)), total };
  }

  async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  private mapToEntity(doc: UserDocument): UserEntity {
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
