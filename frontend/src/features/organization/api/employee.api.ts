import { CreateEmployeeDto, UpdateEmployeeDto, PromoteEmployeeDto, EmployeeResponse } from 'shared/dto';

import { apiClient } from '../../../services/api-client';

export const employeeApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<{ success: boolean; data: EmployeeResponse[]; meta: any }>('/employees', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: EmployeeResponse }>(`/employees/${id}`);
    return res.data;
  },
  create: async (data: CreateEmployeeDto) => {
    const res = await apiClient.post<{ success: boolean; data: EmployeeResponse }>('/employees', data);
    return res.data;
  },
  update: async (id: string, data: UpdateEmployeeDto) => {
    const res = await apiClient.put<{ success: boolean; data: EmployeeResponse }>(`/employees/${id}`, data);
    return res.data;
  },
  promote: async (id: string, data: PromoteEmployeeDto) => {
    const res = await apiClient.post<{ success: boolean; data: EmployeeResponse }>(`/employees/${id}/role`, data);
    return res.data;
  }
};
