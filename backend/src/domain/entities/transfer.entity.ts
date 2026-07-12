import { TransferStatus } from 'shared/enums';

export interface TransferRequestEntity {
  id: string;
  assetId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  requestedBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  reason?: string;
  remarks?: string;
  status: TransferStatus;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
