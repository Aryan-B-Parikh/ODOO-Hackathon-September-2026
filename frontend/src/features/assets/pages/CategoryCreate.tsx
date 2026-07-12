import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreateCategoryDto } from 'shared/dto';

import { CategoryForm } from '../components/CategoryForm';
import { useCreateCategory } from '../hooks/useCategories';

export const CategoryCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createCategory, isPending } = useCreateCategory();

  const handleSubmit = (data: CreateCategoryDto) => {
    createCategory(data, {
      onSuccess: () => {
        navigate('/categories');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Asset Category</h1>
        <p className="text-sm text-gray-500 mt-1">Define a new category and its custom fields</p>
      </div>

      <CategoryForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
};
