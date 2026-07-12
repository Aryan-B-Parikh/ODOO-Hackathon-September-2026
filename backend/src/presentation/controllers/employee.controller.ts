import { Request, Response } from 'express';
import { createEmployeeSchema, updateEmployeeSchema, promoteEmployeeSchema } from 'shared/schemas';

import { EmployeeUseCases } from '../../application/use-cases/organization/employee.use-cases.js';

export class EmployeeController {
  constructor(private readonly employeeUseCases: EmployeeUseCases) {}

  create = async (req: Request, res: Response) => {
    const data = createEmployeeSchema.parse(req.body);
    const employee = await this.employeeUseCases.create(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { passwordHash, ...rest } = employee as any;
    res.status(201).json({ success: true, data: rest });
  };

  list = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { data, total } = await this.employeeUseCases.list(page, limit);
    
    const safeData = data.map(u => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      const { passwordHash, ...rest } = u as any;
      return rest;
    });

    res.json({
      success: true,
      data: safeData,
      meta: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  };

  getById = async (req: Request, res: Response) => {
    const employee = await this.employeeUseCases.getById(req.params.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { passwordHash, ...rest } = employee as any;
    res.json({ success: true, data: rest });
  };

  update = async (req: Request, res: Response) => {
    const data = updateEmployeeSchema.parse(req.body);
    const employee = await this.employeeUseCases.update(req.params.id, data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { passwordHash, ...rest } = employee as any;
    res.json({ success: true, data: rest });
  };

  promote = async (req: Request, res: Response) => {
    const data = promoteEmployeeSchema.parse(req.body);
    const employee = await this.employeeUseCases.promote(req.params.id, data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { passwordHash, ...rest } = employee as any;
    res.json({ success: true, data: rest });
  };
}
