import { CategoryDto, CreateCategoryDto, UpdateCategoryDto, ChangeCategoryStatusDto } from 'shared/dto';

import { apiClient } from '../../../services/api-client';

export const categoryApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<{ success: boolean; data: CategoryDto[]; meta: any }>('/categories', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: CategoryDto }>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryDto) => {
    const response = await apiClient.post<{ success: boolean; data: CategoryDto }>('/categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryDto) => {
    const response = await apiClient.put<{ success: boolean; data: CategoryDto }>(`/categories/${id}`, data);
    return response.data;
  },

  changeStatus: async (id: string, data: ChangeCategoryStatusDto) => {
    const response = await apiClient.patch<{ success: boolean; data: CategoryDto }>(`/categories/${id}/status`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/categories/${id}`);
    return response.data;
  }
};
