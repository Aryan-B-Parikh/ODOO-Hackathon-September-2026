import { CustomFieldDto } from 'shared/dto';

export interface CategoryEntity {
  id: string;
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  customFields: CustomFieldDto[];
  createdAt: Date;
  updatedAt: Date;
}
