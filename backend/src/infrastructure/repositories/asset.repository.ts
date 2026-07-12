import { CreateAssetDto, UpdateAssetDto } from 'shared/dto';
import { AssetStatus } from 'shared/enums';

import { AssetEntity } from '../../domain/entities/asset.entity.js';
import { AssetDocument, AssetModel } from '../database/models/asset.model.js';

export class AssetRepository {
  private mapToEntity(doc: AssetDocument): AssetEntity {
    return {
      id: doc._id.toString(),
      assetTag: doc.assetTag,
      name: doc.name,
      categoryId: doc.categoryId.toString(),
      departmentId: doc.departmentId.toString(),
      status: doc.status,
      condition: doc.condition,
      serialNumber: doc.serialNumber,
      location: doc.location,
      acquisitionDate: doc.acquisitionDate,
      acquisitionCost: doc.acquisitionCost,
      isShared: doc.isShared,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata) : undefined,
      images: doc.images || [],
      documents: doc.documents || [],
      isArchived: doc.isArchived,
      createdBy: doc.createdBy?.toString(),
      updatedBy: doc.updatedBy?.toString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  async create(data: CreateAssetDto & { createdBy?: string; updatedBy?: string }): Promise<AssetEntity> {
    const doc = new AssetModel(data);
    await doc.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<AssetEntity | null> {
    const doc = await AssetModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByTag(assetTag: string): Promise<AssetEntity | null> {
    const doc = await AssetModel.findOne({ assetTag });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findBySerialNumber(serialNumber: string): Promise<AssetEntity | null> {
    const doc = await AssetModel.findOne({ serialNumber });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(skip = 0, limit = 50, filters: Record<string, unknown> = {}): Promise<{ data: AssetEntity[]; total: number }> {
    const [docs, total] = await Promise.all([
      AssetModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('categoryId').populate('departmentId'),
      AssetModel.countDocuments(filters)
    ]);
    
    // Using simple mapping, population can be handled better if we strictly type the populated doc, but for now we rely on the DB resolving references.
    // The mapToEntity handles raw objectIds. If populated, we might need a richer mapper, but since PRD says "no god entity", we keep it simple.
    // Actually, if we populate, `categoryId` is an object. Let's adjust `mapToEntity` to handle populated objects.
    return { data: docs.map(doc => this.mapToEntity(doc)), total };
  }

  async update(id: string, data: UpdateAssetDto & { updatedBy?: string }): Promise<AssetEntity | null> {
    const doc = await AssetModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }

  async changeStatus(id: string, status: AssetStatus, updatedBy?: string): Promise<AssetEntity | null> {
    const doc = await AssetModel.findByIdAndUpdate(id, { $set: { status, updatedBy } }, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }
}
