import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function OrganizationSetup() {
  const {
    users,
    departments,
    categories,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addCategory,
    updateCategory,
    deleteCategory,
    signup,
    updateUser,
    deleteUser
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('departments');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // to edit existing records
  const [search, setSearch] = useState('');

  // Table pagination and sorting states
  const [deptPage, setDeptPage] = useState(1);
  const [catPage, setCatPage] = useState(1);
  const [empPage, setEmpPage] = useState(1);
  const itemsPerPage = 5;

  const [sortField, setSortField] = useState({ field: '', order: 'asc' });

  // Column visibility states
  const [deptCols, setDeptCols] = useState({ id: true, name: true, code: true, parent: true, head: true, status: true });
  const [catCols, setCatCols] = useState({ id: true, name: true, code: true, fields: true });
  const [empCols, setEmpCols] = useState({ name: true, email: true, role: true, phone: true, status: true });

  const [showColMenu, setShowColMenu] = useState(false);

  // Form states for Modal
  const [deptForm, setDeptForm] = useState({ name: '', code: '', parentDepartment: 'None', manager: '', status: 'Active' });
  const [catForm, setCatForm] = useState({ name: '', code: '', customFields: [] });
  const [empForm, setEmpForm] = useState({ name: '', email: '', password: 'password123', role: 'Employee', phone: '', status: 'Active', department: 'None', manager: 'None' });

  // Temp state for Category custom field builder
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldReq, setNewFieldReq] = useState(false);

  // Sort & Filter
  const handleSort = (field) => {
    const order = sortField.field === field && sortField.order === 'asc' ? 'desc' : 'asc';
    setSortField({ field, order });
  };

  const getSortedData = (data, field, order) => {
    if (!field) return data;
    return [...data].sort((a, b) => {
      let valA = a[field] || '';
      let valB = b[field] || '';
      if (typeof valA === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });
  };

  // Departments Processing
  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    (d.manager && d.manager.toLowerCase().includes(search.toLowerCase()))
  );
  const sortedDepts = getSortedData(filteredDepts, sortField.field, sortField.order);
  const paginatedDepts = sortedDepts.slice((deptPage - 1) * itemsPerPage, deptPage * itemsPerPage);
  const totalDeptPages = Math.ceil(sortedDepts.length / itemsPerPage) || 1;

  // Categories Processing
  const filteredCats = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  const sortedCats = getSortedData(filteredCats, sortField.field, sortField.order);
  const paginatedCats = sortedCats.slice((catPage - 1) * itemsPerPage, catPage * itemsPerPage);
  const totalCatPages = Math.ceil(sortedCats.length / itemsPerPage) || 1;

  // Employees (Users) Processing
  const filteredEmps = users.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );
  const sortedEmps = getSortedData(filteredEmps, sortField.field, sortField.order);
  const paginatedEmps = sortedEmps.slice((empPage - 1) * itemsPerPage, empPage * itemsPerPage);
  const totalEmpPages = Math.ceil(sortedEmps.length / itemsPerPage) || 1;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setDeptForm({ name: '', code: '', parentDepartment: 'None', manager: '', status: 'Active' });
    setCatForm({ name: '', code: '', customFields: [] });
    setEmpForm({ name: '', email: '', password: 'password123', role: 'Employee', phone: '', status: 'Active', department: 'None', manager: 'None' });
    setShowModal(true);
  };

  const handleOpenEditModal = (item, type) => {
    setEditingItem(item);
    if (type === 'departments') {
      setDeptForm({ name: item.name, code: item.code, parentDepartment: item.parentDepartment || 'None', manager: item.manager || '', status: item.status || 'Active' });
    } else if (type === 'categories') {
      setCatForm({ name: item.name, code: item.code, customFields: item.customFields || [] });
    } else if (type === 'employees') {
      setEmpForm({ name: item.name, email: item.email, password: item.password || 'password123', role: item.role || 'Employee', phone: item.phone || '', status: item.status || 'Active', department: item.department || 'None', manager: item.manager || 'None' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (activeTab === 'departments') {
      if (!deptForm.name || !deptForm.code) return;
      if (editingItem) {
        updateDepartment(editingItem.id, deptForm);
      } else {
        addDepartment(deptForm);
      }
    } else if (activeTab === 'categories') {
      if (!catForm.name || !catForm.code) return;
      if (editingItem) {
        updateCategory(editingItem.id, catForm);
      } else {
        addCategory(catForm);
      }
    } else if (activeTab === 'employees') {
      if (!empForm.name || !empForm.email) return;
      if (editingItem) {
        updateUser(editingItem.email, empForm);
      } else {
        signup(empForm);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id, type) => {
    if (confirm("Are you sure you want to delete this record?")) {
      if (type === 'departments') deleteDepartment(id);
      else if (type === 'categories') deleteCategory(id);
      else if (type === 'employees') deleteUser(id); // id is email
    }
  };

  // Custom field actions
  const addCustomField = () => {
    if (!newFieldName.trim()) return;
    setCatForm(prev => ({
      ...prev,
      customFields: [...prev.customFields, { name: newFieldName.trim(), type: newFieldType, required: newFieldReq }]
    }));
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldReq(false);
  };

  const removeCustomField = (index) => {
    setCatForm(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'departments', label: 'Departments', icon: 'business', count: departments.length },
    { id: 'categories', label: 'Asset Categories', icon: 'category', count: categories.length },
    { id: 'employees', label: 'Employees', icon: 'group', count: users.length },
  ];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Organization Setup</h1>
          <p className="text-sm text-on-surface-variant mt-1">Configure your corporate hierarchy, asset classification model, and employee registry.</p>
        </div>
        <div className="flex gap-2">
          {/* Column Visibility Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowColMenu(!showColMenu)}
              className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-white dark:bg-surface-container-high rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">view_column</span>
              Columns
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-container-high border border-outline-variant shadow-xl rounded-xl p-4 z-50 animate-fadeIn">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">Visible Columns</h4>
                <div className="space-y-2.5">
                  {activeTab === 'departments' && Object.keys(deptCols).map(col => (
                    <label key={col} className="flex items-center gap-3 text-sm text-on-surface cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={deptCols[col]} 
                        onChange={() => setDeptCols(prev => ({ ...prev, [col]: !prev[col] }))} 
                        className="rounded border-outline-variant text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                      />
                      <span className="capitalize">{col}</span>
                    </label>
                  ))}
                  {activeTab === 'categories' && Object.keys(catCols).map(col => (
                    <label key={col} className="flex items-center gap-3 text-sm text-on-surface cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={catCols[col]} 
                        onChange={() => setCatCols(prev => ({ ...prev, [col]: !prev[col] }))} 
                        className="rounded border-outline-variant text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                      />
                      <span className="capitalize">{col}</span>
                    </label>
                  ))}
                  {activeTab === 'employees' && Object.keys(empCols).map(col => (
                    <label key={col} className="flex items-center gap-3 text-sm text-on-surface cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={empCols[col]} 
                        onChange={() => setEmpCols(prev => ({ ...prev, [col]: !prev[col] }))} 
                        className="rounded border-outline-variant text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                      />
                      <span className="capitalize">{col}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: departments.length, icon: 'business', color: 'text-primary bg-primary/10' },
          { label: 'Registered Employees', value: users.length, icon: 'group', color: 'text-green-600 bg-green-100' },
          { label: 'Asset Categories', value: categories.length, icon: 'category', color: 'text-purple-600 bg-purple-100' },
          { label: 'Active Organization', value: 'Live Mocks', icon: 'workspace_premium', color: 'text-orange-600 bg-orange-100' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Layout */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-outline-variant/30 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSortField({ field: '', order: 'asc' }); setSearch(''); }}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {/* Real-time search */}
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setDeptPage(1);
                setCatPage(1);
                setEmpPage(1);
              }}
            />
          </div>

          {/* TAB 1: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                      {deptCols.id && <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:text-primary transition-colors">ID</th>}
                      {deptCols.name && <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-primary transition-colors">Department Name</th>}
                      {deptCols.code && <th onClick={() => handleSort('code')} className="p-4 cursor-pointer hover:text-primary transition-colors">Code</th>}
                      {deptCols.parent && <th onClick={() => handleSort('parentDepartment')} className="p-4 cursor-pointer hover:text-primary transition-colors">Parent</th>}
                      {deptCols.head && <th onClick={() => handleSort('manager')} className="p-4 cursor-pointer hover:text-primary transition-colors">Dept Head</th>}
                      {deptCols.status && <th onClick={() => handleSort('status')} className="p-4 cursor-pointer hover:text-primary transition-colors">Status</th>}
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {paginatedDepts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-on-surface-variant font-medium">
                          No departments found matching your search.
                        </td>
                      </tr>
                    ) : paginatedDepts.map((dept) => (
                      <tr key={dept.id} className="hover:bg-surface-container-low/30 transition-colors group text-on-surface">
                        {deptCols.id && <td className="p-4 font-semibold text-xs">{dept.id}</td>}
                        {deptCols.name && (
                          <td className="p-4 font-bold">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary text-[20px]">corporate_fare</span>
                              {dept.name}
                            </div>
                          </td>
                        )}
                        {deptCols.code && <td className="p-4 text-xs font-mono">{dept.code}</td>}
                        {deptCols.parent && <td className="p-4 text-on-surface-variant">{dept.parentDepartment}</td>}
                        {deptCols.head && <td className="p-4 font-medium">{dept.manager || 'Unassigned'}</td>}
                        {deptCols.status && (
                          <td className="p-4">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${dept.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'}`}>
                              {dept.status}
                            </span>
                          </td>
                        )}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEditModal(dept, 'departments')} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button onClick={() => handleDelete(dept.id, 'departments')} className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-on-surface-variant font-medium">Page {deptPage} of {totalDeptPages} ({filteredDepts.length} departments)</span>
                <div className="flex gap-2">
                  <button 
                    disabled={deptPage === 1} 
                    onClick={() => setDeptPage(p => p - 1)}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={deptPage === totalDeptPages} 
                    onClick={() => setDeptPage(p => p + 1)}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSET CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                      {catCols.id && <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:text-primary transition-colors">ID</th>}
                      {catCols.name && <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-primary transition-colors">Category Name</th>}
                      {catCols.code && <th onClick={() => handleSort('code')} className="p-4 cursor-pointer hover:text-primary transition-colors">Code</th>}
                      {catCols.fields && <th className="p-4">Custom Schema Fields</th>}
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {paginatedCats.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-on-surface-variant font-medium">
                          No asset categories found matching your search.
                        </td>
                      </tr>
                    ) : paginatedCats.map((cat) => (
                      <tr key={cat.id} className="hover:bg-surface-container-low/30 transition-colors group text-on-surface">
                        {catCols.id && <td className="p-4 font-semibold text-xs">{cat.id}</td>}
                        {catCols.name && (
                          <td className="p-4 font-bold">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                              {cat.name}
                            </div>
                          </td>
                        )}
                        {catCols.code && <td className="p-4 text-xs font-mono">{cat.code}</td>}
                        {catCols.fields && (
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1.5">
                              {cat.customFields && cat.customFields.length > 0 ? (
                                cat.customFields.map((f, idx) => (
                                  <span key={idx} className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] font-medium text-on-surface-variant border border-outline-variant/20">
                                    {f.name} ({f.type}){f.required && '*'}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-on-surface-variant italic">No custom fields</span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEditModal(cat, 'categories')} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button onClick={() => handleDelete(cat.id, 'categories')} className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-on-surface-variant font-medium">Page {catPage} of {totalCatPages} ({filteredCats.length} categories)</span>
                <div className="flex gap-2">
                  <button 
                    disabled={catPage === 1} 
                    onClick={() => setCatPage(p => p - 1)}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={catPage === totalCatPages} 
                    onClick={() => setCatPage(p => p + 1)}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMPLOYEES */}
          {activeTab === 'employees' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                      {empCols.name && <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-primary transition-colors">Employee</th>}
                      {empCols.email && <th onClick={() => handleSort('email')} className="p-4 cursor-pointer hover:text-primary transition-colors">Email</th>}
                      {empCols.role && <th onClick={() => handleSort('role')} className="p-4 cursor-pointer hover:text-primary transition-colors">Role</th>}
                      {empCols.phone && <th className="p-4">Phone</th>}
                      {empCols.status && <th onClick={() => handleSort('status')} className="p-4 cursor-pointer hover:text-primary transition-colors">Status</th>}
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {paginatedEmps.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant font-medium">
                          No employees found matching your search.
                        </td>
                      </tr>
                    ) : paginatedEmps.map((emp) => (
                      <tr key={emp.email} className="hover:bg-surface-container-low/30 transition-colors group text-on-surface">
                        {empCols.name && (
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-outline-variant/30" />
                              <div className="flex flex-col">
                                <span className="font-bold">{emp.name}</span>
                                <span className="text-[10px] text-on-surface-variant">{emp.department || 'No Department'}</span>
                              </div>
                            </div>
                          </td>
                        )}
                        {empCols.email && <td className="p-4 font-mono text-xs">{emp.email}</td>}
                        {empCols.role && (
                          <td className="p-4">
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                              {emp.role}
                            </span>
                          </td>
                        )}
                        {empCols.phone && <td className="p-4 text-on-surface-variant text-xs">{emp.phone || '-'}</td>}
                        {empCols.status && (
                          <td className="p-4">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${emp.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'}`}>
                              {emp.status}
                            </span>
                          </td>
                        )}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEditModal(emp, 'employees')} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button onClick={() => handleDelete(emp.email, 'employees')} className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-on-surface-variant font-medium">Page {empPage} of {totalEmpPages} ({filteredEmps.length} employees)</span>
                <div className="flex gap-2">
                  <button 
                    disabled={empPage === 1} 
                    onClick={() => setEmpPage(p => p - 1)}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={empPage === totalEmpPages} 
                    onClick={() => setEmpPage(p => p + 1)}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-xl">
                {editingItem ? 'Edit' : 'Add New'} {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Asset Category' : 'Employee'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Department Form Fields */}
            {activeTab === 'departments' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Department Name *</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface" 
                    placeholder="e.g. Engineering"
                    value={deptForm.name}
                    onChange={e => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Department Code *</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface font-mono" 
                    placeholder="e.g. ENG"
                    value={deptForm.code}
                    onChange={e => setDeptForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Parent Department</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    value={deptForm.parentDepartment}
                    onChange={e => setDeptForm(prev => ({ ...prev, parentDepartment: e.target.value }))}
                  >
                    <option value="None">None</option>
                    {departments.filter(d => d.id !== (editingItem?.id)).map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Department Head</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    value={deptForm.manager}
                    onChange={e => setDeptForm(prev => ({ ...prev, manager: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.email} value={u.name}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Status</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    value={deptForm.status}
                    onChange={e => setDeptForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}

            {/* Category Form Fields (including Custom Field Builder) */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Category Name *</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface" 
                    placeholder="e.g. IT Hardware"
                    value={catForm.name}
                    onChange={e => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Category Code *</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface font-mono" 
                    placeholder="e.g. ITH"
                    value={catForm.code}
                    onChange={e => setCatForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                </div>

                {/* DYNAMIC CUSTOM FIELD BUILDER */}
                <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-low dark:bg-surface-container-high/40">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Dynamic Custom Field Builder</h4>
                  
                  {/* Fields list */}
                  <div className="space-y-2 mb-4">
                    {catForm.customFields.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic text-center py-2">No custom fields defined yet.</p>
                    ) : (
                      catForm.customFields.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-surface-container p-2.5 rounded-lg border border-outline-variant/20">
                          <div className="text-xs text-on-surface font-medium">
                            <span className="font-bold">{field.name}</span> <span className="text-on-surface-variant">({field.type})</span>
                            {field.required && <span className="text-red-500 font-bold ml-1">Required</span>}
                          </div>
                          <button onClick={() => removeCustomField(idx)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950 text-red-500 rounded transition-colors">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Field Inline Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Field Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. RAM" 
                        value={newFieldName}
                        onChange={e => setNewFieldName(e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border border-outline-variant bg-white dark:bg-surface-container text-xs text-on-surface outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Type</label>
                      <select 
                        value={newFieldType}
                        onChange={e => setNewFieldType(e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border border-outline-variant bg-white dark:bg-surface-container text-xs text-on-surface outline-none"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean (Checkbox)</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 h-9">
                      <label className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={newFieldReq} 
                          onChange={e => setNewFieldReq(e.target.checked)}
                          className="rounded border-outline-variant text-primary"
                        />
                        <span>Req?</span>
                      </label>
                      <button 
                        type="button"
                        onClick={addCustomField}
                        className="ml-auto bg-primary text-on-primary px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                      >
                        Add Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employee Form Fields */}
            {activeTab === 'employees' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Full Name *</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface" 
                    placeholder="e.g. John Doe"
                    value={empForm.name}
                    onChange={e => setEmpForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Work Email *</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface font-mono" 
                    placeholder="e.g. john.doe@company.com"
                    value={empForm.email}
                    disabled={!!editingItem} // Cannot edit email because it serves as ID in mocks
                    onChange={e => setEmpForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Requested Role</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    value={empForm.role}
                    onChange={e => setEmpForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Employee">Employee</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Phone Number</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface" 
                    placeholder="e.g. +1 (555) 012-3456"
                    value={empForm.phone}
                    onChange={e => setEmpForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Department</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    value={empForm.department}
                    onChange={e => setEmpForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="None">None</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Manager</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    value={empForm.manager}
                    onChange={e => setEmpForm(prev => ({ ...prev, manager: e.target.value }))}
                  >
                    <option value="None">None</option>
                    {users.map(u => (
                      <option key={u.email} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Status</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    value={empForm.status}
                    onChange={e => setEmpForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 border-t border-outline-variant/30 pt-4">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
                {editingItem ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
