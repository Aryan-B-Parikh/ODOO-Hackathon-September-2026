import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CreateCategoryDto, CategoryDto } from 'shared/dto';
import { createCategorySchema } from 'shared/schemas';

interface CategoryFormProps {
  initialData?: CategoryDto;
  onSubmit: (data: CreateCategoryDto) => void;
  isLoading: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateCategoryDto>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      status: initialData.status,
      customFields: initialData.customFields || [],
    } : {
      name: '',
      description: '',
      status: 'Active',
      customFields: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customFields'
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Details</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Category Name *</label>
          <input
            {...register('name')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g. Laptops"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="Optional description"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('status')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
          <button
            type="button"
            onClick={() => append({ name: '', type: 'text', required: false })}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Field
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Field Name</label>
                  <input
                    {...register(`customFields.${index}.name`)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. Warranty Expiry"
                  />
                  {errors.customFields?.[index]?.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.customFields[index]?.name?.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Data Type</label>
                  <select
                    {...register(`customFields.${index}.type`)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Yes/No</option>
                  </select>
                </div>
                <div className="flex items-center h-full pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`customFields.${index}.required`)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Required Field</span>
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-6 p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove field"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-gray-500 italic py-4 text-center">No custom fields defined.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Link
          to="/categories"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
};
