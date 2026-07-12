import { Request, Response } from 'express';
import { createDepartmentSchema, updateDepartmentSchema } from 'shared/schemas';

import { DepartmentUseCases } from '../../application/use-cases/organization/department.use-cases.js';

export class DepartmentController {
  constructor(private readonly departmentUseCases: DepartmentUseCases) {}

  create = async (req: Request, res: Response) => {
    const data = createDepartmentSchema.parse(req.body);
    const department = await this.departmentUseCases.create(data);
    res.status(201).json({ success: true, data: department });
  };

  list = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { data, total } = await this.departmentUseCases.list(page, limit);
    res.json({
      success: true,
      data,
      meta: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  };

  update = async (req: Request, res: Response) => {
    const data = updateDepartmentSchema.parse(req.body);
    const department = await this.departmentUseCases.update(req.params.id, data);
    res.json({ success: true, data: department });
  };

  deactivate = async (req: Request, res: Response) => {
    const department = await this.departmentUseCases.deactivate(req.params.id);
    res.json({ success: true, data: department });
  };
}
