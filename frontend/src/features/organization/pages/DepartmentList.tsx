
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
