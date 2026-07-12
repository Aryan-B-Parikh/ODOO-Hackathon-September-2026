import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { UpdateCategoryDto } from 'shared/dto';

import { CategoryForm } from '../components/CategoryForm';
import { useCategory, useUpdateCategory } from '../hooks/useCategories';

export const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: categoryData, isLoading } = useCategory(id!);
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  const handleSubmit = (data: UpdateCategoryDto) => {
    updateCategory({ id: id!, data }, {
      onSuccess: () => {
        navigate('/categories');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!categoryData?.data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Category not found</h3>
        <Link to="/categories" className="text-blue-600 hover:underline mt-2 inline-block">Return to Categories</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Asset Category</h1>
        <p className="text-sm text-gray-500 mt-1">Modify {categoryData.data.name} configuration</p>
      </div>

      <CategoryForm 
        initialData={categoryData.data} 
        onSubmit={handleSubmit} 
        isLoading={isPending} 
      />
    </div>
  );
};
