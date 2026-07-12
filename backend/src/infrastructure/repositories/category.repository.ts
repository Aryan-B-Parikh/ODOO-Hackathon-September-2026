import { CategoryEntity } from '../../domain/entities/category.entity.js';
import { CategoryModel, CategoryDocument } from '../database/models/category.model.js';

export class CategoryRepository {
  async create(data: Partial<Omit<CategoryEntity, 'id'>>): Promise<CategoryEntity> {
    const doc = new CategoryModel(data);
    await doc.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const doc = await CategoryModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const doc = await CategoryModel.findOne({ name });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(skip = 0, limit = 50, filters: Record<string, unknown> = {}): Promise<{ data: CategoryEntity[]; total: number }> {
    const [docs, total] = await Promise.all([
      CategoryModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),
      CategoryModel.countDocuments(filters)
    ]);
    return { data: docs.map(doc => this.mapToEntity(doc)), total };
  }

  async update(id: string, data: Partial<Omit<CategoryEntity, 'id'>>): Promise<CategoryEntity | null> {
    const doc = await CategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return result !== null;
  }

  private mapToEntity(doc: CategoryDocument): CategoryEntity {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      status: doc.status as 'Active' | 'Inactive',
      customFields: doc.customFields,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
