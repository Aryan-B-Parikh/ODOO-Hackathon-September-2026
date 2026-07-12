import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { departmentApi } from '../api/department.api';

export const useDepartments = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentApi.list(params)
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    }
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof departmentApi.update>[1] }) => departmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    }
  });
};

export const useDeactivateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    }
  });
};
