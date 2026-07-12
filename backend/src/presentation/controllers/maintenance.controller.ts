import { Request, Response, NextFunction } from 'express';
import { raiseMaintenanceRequestSchema, assignMaintenanceSchema, startMaintenanceSchema, completeMaintenanceSchema, cancelMaintenanceSchema } from 'shared/schemas';

import { MaintenanceUseCases } from '../../application/use-cases/maintenance/maintenance.use-cases.js';

export class MaintenanceController {
  constructor(private maintenanceUseCases: MaintenanceUseCases) {}

  raiseRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = raiseMaintenanceRequestSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const maintenance = await this.maintenanceUseCases.raiseRequest(validated, userId!);
      res.status(201).json({ success: true, data: maintenance });
    } catch (error) {
      next(error);
    }
  };

  assign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = assignMaintenanceSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const maintenance = await this.maintenanceUseCases.assign(req.params.id, validated, userId!);
      res.json({ success: true, data: maintenance });
    } catch (error) {
      next(error);
    }
  };

  start = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = startMaintenanceSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const maintenance = await this.maintenanceUseCases.start(req.params.id, validated, userId!);
      res.json({ success: true, data: maintenance });
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = completeMaintenanceSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const maintenance = await this.maintenanceUseCases.complete(req.params.id, validated, userId!);
      res.json({ success: true, data: maintenance });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = cancelMaintenanceSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const maintenance = await this.maintenanceUseCases.cancel(req.params.id, validated, userId!);
      res.json({ success: true, data: maintenance });
    } catch (error) {
      next(error);
    }
  };

  getByAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await this.maintenanceUseCases.getByAsset(req.params.id);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };

  getOpen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const openRequests = await this.maintenanceUseCases.getOpen();
      res.json({ success: true, data: openRequests });
    } catch (error) {
      next(error);
    }
  };
}
