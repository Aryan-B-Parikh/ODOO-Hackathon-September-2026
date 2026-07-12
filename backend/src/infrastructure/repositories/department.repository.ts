import { CreateDepartmentDto, UpdateDepartmentDto } from 'shared/dto';

import { DepartmentEntity } from '../../domain/entities/department.entity.js';
import { DepartmentModel } from '../database/models/department.model.js';

export class DepartmentRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(doc: any): DepartmentEntity {
    return new DepartmentEntity(
      doc._id.toString(),
      doc.name,
      doc.code,
      doc.isActive,
      doc.managerId,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async create(data: CreateDepartmentDto): Promise<DepartmentEntity> {
    const doc = new DepartmentModel(data);
    await doc.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    const doc = await DepartmentModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByName(name: string): Promise<DepartmentEntity | null> {
    const doc = await DepartmentModel.findOne({ name });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(skip = 0, limit = 50): Promise<{ data: DepartmentEntity[]; total: number }> {
    const [docs, total] = await Promise.all([
      DepartmentModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      DepartmentModel.countDocuments()
    ]);
    return { data: docs.map(this.mapToEntity), total };
  }

  async update(id: string, data: UpdateDepartmentDto): Promise<DepartmentEntity | null> {
    const doc = await DepartmentModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }

  async deactivate(id: string): Promise<DepartmentEntity | null> {
    const doc = await DepartmentModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }
}
