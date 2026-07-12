import { Request, Response, NextFunction } from 'express';
import { allocateAssetSchema, returnAssetSchema } from 'shared/schemas';

import { AllocationUseCases } from '../../application/use-cases/allocation/allocation.use-cases.js';

export class AllocationController {
  constructor(private allocationUseCases: AllocationUseCases) {}

  allocate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = allocateAssetSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const allocation = await this.allocationUseCases.allocate(validated.assetId, validated, userId!);
      res.status(201).json({ success: true, data: allocation });
    } catch (error) {
      next(error);
    }
  };

  returnAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = returnAssetSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      const allocationId = req.params.id;
      
      const allocation = await this.allocationUseCases.returnAsset(allocationId, validated, userId!);
      res.json({ success: true, data: allocation });
    } catch (error) {
      next(error);
    }
  };

  getAssetHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assetId = req.params.id;
      const history = await this.allocationUseCases.getAssetHistory(assetId);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employeeId = req.params.id;
      const history = await this.allocationUseCases.getEmployeeHistory(employeeId);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };
}
