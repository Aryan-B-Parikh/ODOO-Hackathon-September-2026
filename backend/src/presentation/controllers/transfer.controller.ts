import { Request, Response, NextFunction } from 'express';
import { createTransferRequestSchema, approveTransferSchema, rejectTransferSchema, cancelTransferSchema } from 'shared/schemas';

import { TransferUseCases } from '../../application/use-cases/transfer/transfer.use-cases.js';

export class TransferController {
  constructor(private transferUseCases: TransferUseCases) {}

  createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createTransferRequestSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const transfer = await this.transferUseCases.createRequest(validated, userId!);
      res.status(201).json({ success: true, data: transfer });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = approveTransferSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const transfer = await this.transferUseCases.approve(req.params.id, validated, userId!);
      res.json({ success: true, data: transfer });
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = rejectTransferSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const transfer = await this.transferUseCases.reject(req.params.id, validated, userId!);
      res.json({ success: true, data: transfer });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = cancelTransferSchema.parse(req.body);
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      
      const transfer = await this.transferUseCases.cancel(req.params.id, validated, userId!);
      res.json({ success: true, data: transfer });
    } catch (error) {
      next(error);
    }
  };

  getPending = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pending = await this.transferUseCases.getPending();
      res.json({ success: true, data: pending });
    } catch (error) {
      next(error);
    }
  };

  getByAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await this.transferUseCases.getByAsset(req.params.id);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };

  getByEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await this.transferUseCases.getByEmployee(req.params.id);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };
}
