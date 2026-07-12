import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { CreateAssetDto, UpdateAssetDto, ChangeAssetStatusDto } from 'shared/dto';

import { assetApi } from '../api/asset.api';

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...assetKeys.lists(), filters] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
};

export const useAssets = (filters: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: () => assetApi.getAll(filters),
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => assetApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssetDto) => assetApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
    onError: (error: AxiosError<{ error: { message: string } }>) => {
      console.error(error?.response?.data?.error?.message || 'Failed to create asset');
    },
  });
};

export const useUpdateAsset = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAssetDto) => assetApi.update(id, data),
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.setQueryData(assetKeys.detail(id), updatedAsset);
    },
    onError: (error: AxiosError<{ error: { message: string } }>) => {
      console.error(error?.response?.data?.error?.message || 'Failed to update asset');
    },
  });
};

export const useChangeAssetStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangeAssetStatusDto) => assetApi.changeStatus(id, data),
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.setQueryData(assetKeys.detail(id), updatedAsset);
    },
    onError: (error: AxiosError<{ error: { message: string } }>) => {
      console.error(error?.response?.data?.error?.message || 'Failed to change asset status');
    },
  });
};
