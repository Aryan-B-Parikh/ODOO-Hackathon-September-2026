import { Request, Response, NextFunction } from 'express';
import { createAssetSchema, updateAssetSchema, changeAssetStatusSchema } from 'shared/schemas';

import { AssetUseCases } from '../../application/use-cases/asset/asset.use-cases.js';


export class AssetController {
  constructor(private assetUseCases: AssetUseCases) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createAssetSchema.parse(req.body);
      // Retrieve user ID from req.user (populated by auth middleware)
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      const asset = await this.assetUseCases.create(validated, userId);
      res.status(201).json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const filters: Record<string, unknown> = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.categoryId) filters.categoryId = req.query.categoryId;
      if (req.query.departmentId) filters.departmentId = req.query.departmentId;
      if (req.query.isArchived) filters.isArchived = req.query.isArchived === 'true';
      if (req.query.search) {
        filters.$text = { $search: req.query.search as string };
      }

      const { data, total } = await this.assetUseCases.getAll(skip, limit, filters);

      res.json({
        success: true,
        data,
        meta: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await this.assetUseCases.getById(req.params.id);
      res.json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateAssetSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      const asset = await this.assetUseCases.update(req.params.id, validated, userId);
      res.json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = changeAssetStatusSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      const asset = await this.assetUseCases.changeStatus(req.params.id, validated.status, userId);
      res.json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  };
}
