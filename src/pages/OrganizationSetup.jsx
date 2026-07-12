import React, { useState } from 'react';

const departments = [
  { id: 'DEPT-001', name: 'Logistics & Assets', head: 'Elena Vance', employees: 24, assets: 142, budget: '$480,000', status: 'Active' },
  { id: 'DEPT-002', name: 'IT Infrastructure', head: 'Alex Chen', employees: 18, assets: 318, budget: '$920,000', status: 'Active' },
  { id: 'DEPT-003', name: 'Facilities Management', head: 'Sarah Jenkins', employees: 31, assets: 89, budget: '$310,000', status: 'Active' },
  { id: 'DEPT-004', name: 'Fleet Operations', head: 'David Miller', employees: 12, assets: 56, budget: '$640,000', status: 'Active' },
  { id: 'DEPT-005', name: 'Manufacturing', head: 'Jordan S.', employees: 45, assets: 204, budget: '$1,200,000', status: 'Active' },
];

const categories = [
  { id: 'CAT-001', name: 'IT Equipment', icon: 'computer', count: 312, value: '$2.4M', color: 'bg-blue-100 text-blue-700' },
  { id: 'CAT-002', name: 'Vehicles', icon: 'directions_car', count: 48, value: '$1.8M', color: 'bg-green-100 text-green-700' },
  { id: 'CAT-003', name: 'Office Furniture', icon: 'chair', count: 186, value: '$320K', color: 'bg-purple-100 text-purple-700' },
  { id: 'CAT-004', name: 'Manufacturing Equipment', icon: 'precision_manufacturing', count: 74, value: '$4.1M', color: 'bg-orange-100 text-orange-700' },
  { id: 'CAT-005', name: 'Peripherals', icon: 'keyboard', count: 524, value: '$180K', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'CAT-006', name: 'Audio / Media', icon: 'headphones', count: 93, value: '$95K', color: 'bg-pink-100 text-pink-700' },
];

const employees = [
  { id: 'EMP-001', name: 'Elena Vance', department: 'Logistics & Assets', role: 'Senior Operations Manager', assets: 4, email: 'e.vance@assetflow.corp', status: 'Active', avatar: 'EV' },
  { id: 'EMP-002', name: 'Alex Chen', department: 'IT Infrastructure', role: 'Admin Level 4', assets: 6, email: 'a.chen@assetflow.corp', status: 'Active', avatar: 'AC' },
  { id: 'EMP-003', name: 'Sarah Jenkins', department: 'Facilities Management', role: 'Facilities Director', assets: 2, email: 's.jenkins@assetflow.corp', status: 'Active', avatar: 'SJ' },
  { id: 'EMP-004', name: 'David Miller', department: 'Fleet Operations', role: 'Fleet Manager', assets: 8, email: 'd.miller@assetflow.corp', status: 'Active', avatar: 'DM' },
  { id: 'EMP-005', name: 'Jordan S.', department: 'Manufacturing', role: 'Production Supervisor', assets: 3, email: 'j.smith@assetflow.corp', status: 'On Leave', avatar: 'JS' },
  { id: 'EMP-006', name: 'Maria G.', department: 'IT Infrastructure', role: 'Network Engineer', assets: 5, email: 'm.garcia@assetflow.corp', status: 'Active', avatar: 'MG' },
];

export default function OrganizationSetup() {
  const [activeTab, setActiveTab] = useState('departments');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const tabs = [
    { id: 'departments', label: 'Departments', icon: 'business', count: departments.length },
    { id: 'categories', label: 'Asset Categories', icon: 'category', count: categories.length },
    { id: 'employees', label: 'Employees', icon: 'group', count: employees.length },
  ];

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Organization Setup</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage departments, asset categories, and employee records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: '5', icon: 'business', color: 'text-primary bg-primary/10' },
          { label: 'Total Employees', value: '130', icon: 'group', color: 'text-green-600 bg-green-100' },
          { label: 'Asset Categories', value: '6', icon: 'category', color: 'text-purple-600 bg-purple-100' },
          { label: 'Total Asset Value', value: '$9.1M', icon: 'payments', color: 'text-orange-600 bg-orange-100' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-outline-variant/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'departments' && (
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-low/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">business</span>
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{dept.name}</p>
                      <p className="text-xs text-on-surface-variant">Head: {dept.head} · ID: {dept.id}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
                    <div className="text-center">
                      <p className="font-bold text-on-surface">{dept.employees}</p>
                      <p className="text-[10px]">Employees</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-on-surface">{dept.assets}</p>
                      <p className="text-[10px]">Assets</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-on-surface">{dept.budget}</p>
                      <p className="text-[10px]">Budget</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{dept.status}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button className="p-1.5 hover:bg-surface-container rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
                    </button>
                    <button className="p-1.5 hover:bg-error-container/20 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-error">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-5 rounded-xl border border-outline-variant/20 hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                      <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                    </div>
                    <button className="p-1 hover:bg-surface-container rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">edit</span>
                    </button>
                  </div>
                  <h3 className="font-bold text-on-surface">{cat.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-1">ID: {cat.id}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/20">
                    <div>
                      <p className="text-xl font-bold text-on-surface">{cat.count}</p>
                      <p className="text-[10px] text-on-surface-variant">Total Assets</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{cat.value}</p>
                      <p className="text-[10px] text-on-surface-variant">Total Value</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <div className="mb-4 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Search employees..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-outline-variant/30">
                      <th className="pb-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Employee</th>
                      <th className="pb-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Department</th>
                      <th className="pb-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider hidden md:table-cell">Role</th>
                      <th className="pb-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider hidden md:table-cell">Assets</th>
                      <th className="pb-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Status</th>
                      <th className="pb-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-surface-container-low/50 transition-colors group">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {emp.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface">{emp.name}</p>
                              <p className="text-[10px] text-on-surface-variant">{emp.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-on-surface-variant text-xs">{emp.department}</td>
                        <td className="py-3 text-on-surface-variant text-xs hidden md:table-cell">{emp.role}</td>
                        <td className="py-3 hidden md:table-cell">
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{emp.assets} assets</span>
                        </td>
                        <td className="py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1 hover:bg-surface-container rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">edit</span>
                            </button>
                            <button className="p-1 hover:bg-surface-container rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface text-lg">
                Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Name</label>
                <input className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter name..." />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Description</label>
                <textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Optional description..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-all">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
