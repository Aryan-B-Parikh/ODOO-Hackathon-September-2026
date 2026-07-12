import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DepartmentResponse, CreateDepartmentDto } from 'shared/dto';
import { createDepartmentSchema, updateDepartmentSchema } from 'shared/schemas';
import { z } from 'zod';

import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeactivateDepartment } from '../hooks/useDepartments';

type DepartmentFormValues = z.infer<typeof createDepartmentSchema>;

export const DepartmentList = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentResponse | null>(null);

  // Pagination states (client-side for now based on legacy)
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading } = useDepartments({ limit: 1000 });
  const departments = data?.data || [];

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deactivateMutation = useDeactivateDepartment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(editingDept ? updateDepartmentSchema : createDepartmentSchema),
    defaultValues: { name: '', code: '' }
  });

  const handleOpenAddModal = () => {
    setEditingDept(null);
    reset({ name: '', code: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (dept: DepartmentResponse) => {
    setEditingDept(dept);
    reset({ name: dept.name, code: dept.code, managerId: dept.managerId || '' });
    setShowModal(true);
  };

  const handleSave = async (values: DepartmentFormValues) => {
    try {
      if (editingDept) {
        await updateMutation.mutateAsync({ id: editingDept.id, data: values });
      } else {
        await createMutation.mutateAsync(values as CreateDepartmentDto);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save department', error);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (confirm("Are you sure you want to deactivate this department?")) {
      await deactivateMutation.mutateAsync(id);
    }
  };

  const filteredDepts = departments.filter((d: DepartmentResponse) => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedDepts = filteredDepts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredDepts.length / itemsPerPage) || 1;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Departments</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage corporate hierarchy and structure.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Department
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-primary bg-primary/10">
            <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{departments.length}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Total Departments</p>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-green-600 bg-green-100 dark:bg-green-900/20">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{departments.filter((d: DepartmentResponse) => d.isActive).length}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Active Departments</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="relative max-w-md mb-6">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
            placeholder="Search departments..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                <th className="p-4">Department Name</th>
                <th className="p-4">Code</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedDepts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant font-medium">
                    No departments found.
                  </td>
                </tr>
              ) : paginatedDepts.map((dept: DepartmentResponse) => (
                <tr key={dept.id} className="hover:bg-surface-container-low/30 transition-colors group text-on-surface">
                  <td className="p-4 font-bold">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">corporate_fare</span>
                      {dept.name}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono">{dept.code}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${dept.isActive ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'}`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(dept)} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => handleDeactivate(dept.id)} className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors" title="Deactivate">
                        <span className="material-symbols-outlined text-[16px]">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-on-surface-variant font-medium">Page {page} of {totalPages} ({filteredDepts.length} total)</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal with react-hook-form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-xl">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Department Name *</label>
                <input 
                  {...register('name')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-outline-variant'} bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface`}
                  placeholder="e.g. Engineering"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Department Code *</label>
                <input 
                  {...register('code')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.code ? 'border-red-500' : 'border-outline-variant'} bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface font-mono`}
                  placeholder="e.g. ENG"
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
