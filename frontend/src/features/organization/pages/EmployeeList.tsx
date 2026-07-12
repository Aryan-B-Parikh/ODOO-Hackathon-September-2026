import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EmployeeResponse } from 'shared/dto';
import { Role } from 'shared/enums';
import { createEmployeeSchema, updateEmployeeSchema } from 'shared/schemas';
import { z } from 'zod';

import { useEmployees, useCreateEmployee, useUpdateEmployee, usePromoteEmployee } from '../hooks/useEmployees';

type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;

export const EmployeeList = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeResponse | null>(null);

  // Pagination states (client-side for now based on legacy)
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading } = useEmployees({ limit: 1000 });
  const employees = data?.data || [];

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const promoteMutation = usePromoteEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateEmployeeFormValues & UpdateEmployeeFormValues>({
    resolver: zodResolver(editingEmp ? updateEmployeeSchema : createEmployeeSchema)
  });

  const handleOpenAddModal = () => {
    setEditingEmp(null);
    reset({ email: '', firstName: '', lastName: '', role: Role.Employee, departmentId: '', password: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (emp: EmployeeResponse) => {
    setEditingEmp(emp);
    reset({ firstName: emp.firstName, lastName: emp.lastName, departmentId: emp.departmentId || '', isActive: emp.isActive });
    setShowModal(true);
  };

  const handleSave = async (values: unknown) => {
    try {
      if (editingEmp) {
        await updateMutation.mutateAsync({ id: editingEmp.id, data: values as UpdateEmployeeFormValues });
      } else {
        await createMutation.mutateAsync(values as CreateEmployeeFormValues);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save employee', error);
    }
  };

  const handlePromote = async (id: string, role: Role) => {
    if (confirm(`Change this employee's role to ${role}?`)) {
      await promoteMutation.mutateAsync({ id, data: { role } });
    }
  };

  const filteredEmps = employees.filter((e: EmployeeResponse) => 
    e.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    e.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedEmps = filteredEmps.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredEmps.length / itemsPerPage) || 1;

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
          <h1 className="text-3xl font-bold text-on-surface">Employees</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage system access, roles, and employee directory.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Employee
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-green-600 bg-green-100 dark:bg-green-900/20">
            <span className="material-symbols-outlined text-[24px]">groups</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{employees.length}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Total Employees</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="relative max-w-md mb-6">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
            placeholder="Search employees..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                <th className="p-4">Employee Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedEmps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant font-medium">
                    No employees found.
                  </td>
                </tr>
              ) : paginatedEmps.map((emp: EmployeeResponse) => (
                <tr key={emp.id} className="hover:bg-surface-container-low/30 transition-colors group text-on-surface">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{emp.firstName} {emp.lastName}</span>
                        <span className="text-[10px] text-on-surface-variant">{emp.departmentId || 'No Dept'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">{emp.email}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${emp.isActive ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'}`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {emp.role !== Role.Admin && (
                        <button onClick={() => handlePromote(emp.id, Role.Admin)} className="p-2 hover:bg-surface-container rounded-lg text-blue-500 transition-colors" title="Make Admin">
                          <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                        </button>
                      )}
                      <button onClick={() => handleOpenEditModal(emp)} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
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
          <span className="text-xs text-on-surface-variant font-medium">Page {page} of {totalPages} ({filteredEmps.length} total)</span>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-xl">
                {editingEmp ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              {!editingEmp && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Email Address *</label>
                  <input 
                    {...register('email')}
                    type="email"
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-outline-variant'} bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface`}
                    placeholder="john.doe@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email?.message as string}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">First Name *</label>
                  <input 
                    {...register('firstName')}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-outline-variant'} bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName?.message as string}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Last Name *</label>
                  <input 
                    {...register('lastName')}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.lastName ? 'border-red-500' : 'border-outline-variant'} bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName?.message as string}</p>}
                </div>
              </div>

              {!editingEmp && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Temporary Password *</label>
                  <input 
                    {...register('password')}
                    type="password"
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-outline-variant'} bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface`}
                    placeholder="********"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password?.message as string}</p>}
                </div>
              )}
              
              {editingEmp && (
                <div className="flex items-center gap-3 mt-2">
                  <input type="checkbox" id="isActive" {...register('isActive')} className="rounded text-primary" />
                  <label htmlFor="isActive" className="text-sm text-on-surface">Account is Active</label>
                </div>
              )}

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
                  {editingEmp ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
