import { CreateAssetDto, UpdateAssetDto, ChangeAssetStatusDto, AssetDto } from 'shared/dto';

import { apiClient } from '../../../services/api-client';

export const assetApi = {
  getAll: async (params?: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<{ success: boolean; data: AssetDto[]; meta: any }>('/assets', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: AssetDto }>(`/assets/${id}`);
    return response.data.data;
  },

  create: async (data: CreateAssetDto) => {
    const response = await apiClient.post<{ success: boolean; data: AssetDto }>('/assets', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateAssetDto) => {
    const response = await apiClient.put<{ success: boolean; data: AssetDto }>(`/assets/${id}`, data);
    return response.data.data;
  },

  changeStatus: async (id: string, data: ChangeAssetStatusDto) => {
    const response = await apiClient.patch<{ success: boolean; data: AssetDto }>(`/assets/${id}/status`, data);
    return response.data.data;
  },
};
