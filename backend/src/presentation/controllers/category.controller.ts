import { Request, Response, NextFunction } from 'express';
import { createCategorySchema, updateCategorySchema, changeCategoryStatusSchema } from 'shared/schemas';

import { CategoryUseCases } from '../../application/use-cases/asset/category.use-cases.js';

export class CategoryController {
  constructor(private readonly categoryUseCases: CategoryUseCases) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createCategorySchema.parse(req.body);
      const category = await this.categoryUseCases.create(data);
      res.status(201).json({ success: true, data: category });
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
      if (req.query.search) {
        filters.name = { $regex: req.query.search, $options: 'i' };
      }

      const { data, total } = await this.categoryUseCases.getAll(skip, limit, filters);

      res.status(200).json({
        success: true,
        data,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrevious: page > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryUseCases.getById(req.params.id);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateCategorySchema.parse(req.body);
      const category = await this.categoryUseCases.update(req.params.id, data);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = changeCategoryStatusSchema.parse(req.body);
      const category = await this.categoryUseCases.changeStatus(req.params.id, data.status);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.categoryUseCases.deactivate(req.params.id);
      res.status(200).json({ success: true, message: 'Category deactivated successfully' });
    } catch (error) {
      next(error);
    }
  };
}
