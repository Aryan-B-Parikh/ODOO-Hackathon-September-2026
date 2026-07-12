import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CategoryDto, DepartmentResponse } from 'shared/dto';
import { AssetCondition } from 'shared/enums';

import { useDepartments } from '../../organization/hooks/useDepartments';
import { useCategories } from '../hooks/useCategories';

export const AssetForm: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();
  const { data: categoriesData } = useCategories();
  const { data: departmentsData } = useDepartments();

  const categories = categoriesData?.data || [];
  const departments = departmentsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Serial Number</label>
          <input
            {...register('serialNumber')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.serialNumber && <p className="mt-1 text-sm text-red-600">{errors.serialNumber.message as string}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            {...register('categoryId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Category</option>
            {categories.map((category: CategoryDto) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message as string}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            {...register('departmentId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Department</option>
            {departments.map((department: DepartmentResponse) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
          {errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId.message as string}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <select
            {...register('condition')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Condition</option>
            {Object.values(AssetCondition).map(condition => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
          {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition.message as string}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            {...register('location')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message as string}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Acquisition Date</label>
          <input
            type="date"
            {...register('acquisitionDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Acquisition Cost</label>
          <input
            type="number"
            {...register('acquisitionCost', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.acquisitionCost && <p className="mt-1 text-sm text-red-600">{errors.acquisitionCost.message as string}</p>}
        </div>

        <div className="col-span-2">
          <div className="flex items-center h-5">
            <input
              id="isShared"
              type="checkbox"
              {...register('isShared')}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="isShared" className="ml-2 block text-sm text-gray-900">
              Is Shared Asset
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
