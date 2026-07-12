import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { UpdateAssetDto, CategoryDto, DepartmentResponse } from 'shared/dto';
import { updateAssetSchema } from 'shared/schemas';

import { AssetForm } from '../components/AssetForm';
import { useAsset, useUpdateAsset } from '../hooks/useAssets';


export const AssetEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: asset, isLoading } = useAsset(id!);
  const updateMutation = useUpdateAsset(id!);

  const methods = useForm<UpdateAssetDto>({
    resolver: zodResolver(updateAssetSchema),
  });

  useEffect(() => {
    if (asset) {
      methods.reset({
        name: asset.name,
        categoryId: typeof asset.categoryId === 'string' ? asset.categoryId : (asset.categoryId as CategoryDto).id,
        departmentId: typeof asset.departmentId === 'string' ? asset.departmentId : (asset.departmentId as DepartmentResponse).id,
        condition: asset.condition,
        serialNumber: asset.serialNumber,
        location: asset.location,
        acquisitionDate: asset.acquisitionDate ? asset.acquisitionDate.split('T')[0] : '',
        acquisitionCost: asset.acquisitionCost,
        isShared: asset.isShared,
      });
    }
  }, [asset, methods]);

  const onSubmit = (data: UpdateAssetDto) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        navigate('/assets');
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Asset: {asset?.assetTag}
          </h2>
        </div>
      </div>
      
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <AssetForm />
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/assets')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Update Asset'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
