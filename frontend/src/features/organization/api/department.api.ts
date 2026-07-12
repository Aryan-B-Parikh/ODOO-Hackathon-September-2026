import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponse } from 'shared/dto';

import { apiClient } from '../../../services/api-client';

export const departmentApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<{ success: boolean; data: DepartmentResponse[]; meta: any }>('/departments', { params });
    return res.data;
  },
  create: async (data: CreateDepartmentDto) => {
    const res = await apiClient.post<{ success: boolean; data: DepartmentResponse }>('/departments', data);
    return res.data;
  },
  update: async (id: string, data: UpdateDepartmentDto) => {
    const res = await apiClient.put<{ success: boolean; data: DepartmentResponse }>(`/departments/${id}`, data);
    return res.data;
  },
  deactivate: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: DepartmentResponse }>(`/departments/${id}/deactivate`);
    return res.data;
  }
};
