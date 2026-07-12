import fs from 'fs';
import path from 'path';

const files = {
  'frontend/src/features/organization/api/department.api.ts': `import { apiClient } from '../../../services/api-client';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponse } from 'shared/dto';

export const departmentApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: DepartmentResponse[]; meta: any }>('/departments', { params });
    return res.data;
  },
  create: async (data: CreateDepartmentDto) => {
    const res = await apiClient.post<{ success: boolean; data: DepartmentResponse }>('/departments', data);
    return res.data;
  },
  update: async (id: string, data: UpdateDepartmentDto) => {
    const res = await apiClient.put<{ success: boolean; data: DepartmentResponse }>(\`/departments/\${id}\`, data);
    return res.data;
  },
  deactivate: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: DepartmentResponse }>(\`/departments/\${id}/deactivate\`);
    return res.data;
  }
};
`,
  'frontend/src/features/organization/api/employee.api.ts': `import { apiClient } from '../../../services/api-client';
import { CreateEmployeeDto, UpdateEmployeeDto, PromoteEmployeeDto, EmployeeResponse } from 'shared/dto';

export const employeeApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: EmployeeResponse[]; meta: any }>('/employees', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: EmployeeResponse }>(\`/employees/\${id}\`);
    return res.data;
  },
  create: async (data: CreateEmployeeDto) => {
    const res = await apiClient.post<{ success: boolean; data: EmployeeResponse }>('/employees', data);
    return res.data;
  },
  update: async (id: string, data: UpdateEmployeeDto) => {
    const res = await apiClient.put<{ success: boolean; data: EmployeeResponse }>(\`/employees/\${id}\`, data);
    return res.data;
  },
  promote: async (id: string, data: PromoteEmployeeDto) => {
    const res = await apiClient.post<{ success: boolean; data: EmployeeResponse }>(\`/employees/\${id}/role\`, data);
    return res.data;
  }
};
`,
  'frontend/src/features/organization/hooks/useDepartments.ts': `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
`,
  'frontend/src/features/organization/hooks/useEmployees.ts': `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';

export const useEmployees = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeApi.list(params)
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeApi.getById(id),
    enabled: !!id
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof employeeApi.update>[1] }) => employeeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

export const usePromoteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof employeeApi.promote>[1] }) => employeeApi.promote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};
`,
  'frontend/src/features/organization/pages/DepartmentList.tsx': `import React from 'react';
import { useDepartments } from '../hooks/useDepartments';

export const DepartmentList = () => {
  const { data, isLoading, error } = useDepartments({ page: 1, limit: 50 });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading departments...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading departments</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Departments</h1>
        <button className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors">
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.data.map((dept) => (
              <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-700 font-medium">{dept.name}</td>
                <td className="p-4 text-slate-500">{dept.code}</td>
                <td className="p-4">
                  <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                </td>
              </tr>
            ))}
            {(!data?.data || data.data.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No departments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
`,
  'frontend/src/features/organization/pages/EmployeeList.tsx': `import React from 'react';
import { useEmployees } from '../hooks/useEmployees';

export const EmployeeList = () => {
  const { data, isLoading, error } = useEmployees({ page: 1, limit: 50 });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading employees...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading employees</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Employees</h1>
        <button className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors">
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.data.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-700 font-medium">{emp.firstName} {emp.lastName}</td>
                <td className="p-4 text-slate-500">{emp.email}</td>
                <td className="p-4 text-slate-500">{emp.role}</td>
                <td className="p-4">
                  <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button className="text-slate-600 hover:text-slate-800 text-sm font-medium">Role</button>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                </td>
              </tr>
            ))}
            {(!data?.data || data.data.length === 0) && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No employees found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

// 2. Add Routes to frontend/src/router/index.tsx
const routerPath = 'frontend/src/router/index.tsx';
let routerContent = fs.readFileSync(routerPath, 'utf8');

if (!routerContent.includes('DepartmentList')) {
  // Add imports
  routerContent = routerContent.replace(
    "import { LoginPage } from '@features/auth/pages/LoginPage';",
    "import { LoginPage } from '@features/auth/pages/LoginPage';\\nimport { DepartmentList } from '@features/organization/pages/DepartmentList';\\nimport { EmployeeList } from '@features/organization/pages/EmployeeList';"
  );

  // Add routes inside AppLayout
  routerContent = routerContent.replace(
    'path: \'dashboard\',',
    `path: 'dashboard',
      },
      {
        path: 'departments',
        element: <DepartmentList />
      },
      {
        path: 'employees',
        element: <EmployeeList />`
  );
  fs.writeFileSync(routerPath, routerContent);
}

console.log('Frontend files generated');
