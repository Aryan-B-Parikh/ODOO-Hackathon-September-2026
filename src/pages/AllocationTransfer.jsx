import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function AllocationTransfer() {
  const {
    allocations,
    addAllocation,
    updateAllocation,
    assets,
    users,
    departments,
    addNotification
  } = useContext(AppContext);

  const [showNewModal, setShowNewModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const [selectedAlloc, setSelectedAlloc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    actualReturn: new Date().toISOString().split('T')[0],
    checkinCondition: 'Good',
    checkinNotes: ''
  });

  // New Allocation Form State
  const [newForm, setNewForm] = useState({
    type: 'Allocation',
    assetId: '',
    employeeId: '',
    department: 'None',
    expectedReturn: '',
    checkoutCondition: 'Excellent',
    checkoutNotes: ''
  });

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Conflict warning calculation (real-time overlap detection)
  const getConflictWarnings = () => {
    const warnings = [];
    const activeAssets = new Set();
    allocations.forEach(a => {
      if (a.status === 'Active' || a.status === 'Overdue' || a.status === 'Pending Approval') {
        if (activeAssets.has(a.assetId)) {
          const assetName = assets.find(as => as.id === a.assetId)?.name || 'Unknown Asset';
          warnings.push({
            asset: assetName,
            id: a.assetId,
            issue: `Multiple active allocation requests found for this asset.`,
            severity: 'high'
          });
        }
        activeAssets.add(a.assetId);
      }
    });
    return warnings;
  };

  const conflicts = getConflictWarnings();

  // Filters
  const filtered = allocations.filter(a => {
    const statusMatches = filterStatus === 'All' || a.status === filterStatus;
    const typeMatches = filterType === 'All' || 
      (filterType === 'Allocation' && a.status !== 'Returned' && !a.actualReturn) || // mock classification
      (filterType === 'Return' && a.status === 'Returned') ||
      (filterType === 'Transfer' && a.status === 'Pending Approval');
    return statusMatches && typeMatches;
  });

  // Form Submit Allocation
  const handleCreateAllocation = (e) => {
    e.preventDefault();
    if (!newForm.assetId) return;

    const selectedAsset = assets.find(as => as.id === newForm.assetId);
    const selectedEmployee = users.find(u => u.email === newForm.employeeId) || { name: newForm.employeeId };

    // Overlap/Conflict Alert check
    const isCurrentlyAllocated = allocations.some(a => 
      a.assetId === newForm.assetId && 
      (a.status === 'Active' || a.status === 'Overdue')
    );

    if (isCurrentlyAllocated) {
      alert(`Conflict Warning: Asset ${newForm.assetId} is already allocated. Request will be submitted as Pending Approval.`);
    }

    const payload = {
      assetId: newForm.assetId,
      assetName: selectedAsset?.name || 'Unknown',
      employeeId: newForm.employeeId,
      employeeName: selectedEmployee.name || 'Unassigned',
      department: newForm.department,
      checkoutDate: new Date().toISOString().split('T')[0],
      expectedReturn: newForm.expectedReturn || null,
      checkoutCondition: newForm.checkoutCondition,
      checkoutNotes: newForm.checkoutNotes,
      status: isCurrentlyAllocated ? 'Pending Approval' : 'Active'
    };

    addAllocation(payload);
    addNotification({
      title: "Allocation Request Created",
      message: `Allocation request for ${selectedAsset?.name || 'Asset'} submitted.`,
      type: isCurrentlyAllocated ? "warning" : "success"
    });

    setShowNewModal(false);
    // Reset Form
    setNewForm({
      type: 'Allocation',
      assetId: '',
      employeeId: '',
      department: 'None',
      expectedReturn: '',
      checkoutCondition: 'Excellent',
      checkoutNotes: ''
    });
  };

  // Return Submit
  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!selectedAlloc) return;

    updateAllocation(selectedAlloc.id, {
      actualReturn: returnForm.actualReturn,
      checkinCondition: returnForm.checkinCondition,
      checkinNotes: returnForm.checkinNotes,
      status: 'Returned'
    });

    addNotification({
      title: "Asset Returned",
      message: `Asset ${selectedAlloc.assetName} was returned in ${returnForm.checkinCondition} condition.`,
      type: "success"
    });

    setShowReturnModal(false);
    setSelectedAlloc(null);
  };

  // Approvals
  const handleApprove = (alloc) => {
    updateAllocation(alloc.id, { status: 'Active' });
    addNotification({
      title: "Allocation Approved",
      message: `Allocation of ${alloc.assetName} to ${alloc.employeeName} approved.`,
      type: "success"
    });
  };

  const handleOpenReject = (alloc) => {
    setSelectedAlloc(alloc);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!selectedAlloc) return;

    updateAllocation(selectedAlloc.id, {
      status: 'Rejected',
      rejectReason: rejectReason
    });

    addNotification({
      title: "Allocation Request Rejected",
      message: `Request for ${selectedAlloc.assetName} rejected. Reason: ${rejectReason}`,
      type: "error"
    });

    setShowRejectModal(false);
    setSelectedAlloc(null);
  };

  const handleOpenTimeline = (alloc) => {
    setSelectedAlloc(alloc);
    setShowTimelineModal(true);
  };

  // Helper check if allocation is overdue
  const isOverdue = (alloc) => {
    if (alloc.status === 'Returned' || !alloc.expectedReturn) return false;
    return new Date(alloc.expectedReturn) < new Date() && !alloc.actualReturn;
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Allocation & Transfer</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage physical asset assignment, transfers across departments, and return workflows.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          New Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Assignments', value: allocations.filter(a => a.status === 'Active').length, icon: 'assignment_turned_in', color: 'text-primary bg-primary/10' },
          { label: 'Pending Approvals', value: allocations.filter(a => a.status === 'Pending Approval').length, icon: 'pending_actions', color: 'text-amber-600 bg-amber-100' },
          { label: 'Returned Assets', value: allocations.filter(a => a.status === 'Returned').length, icon: 'keyboard_return', color: 'text-green-600 bg-green-100' },
          { label: 'Overdue Returns', value: allocations.filter(isOverdue).length, icon: 'warning', color: 'text-red-600 bg-red-100' }
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
              <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conflicts Banner */}
      {conflicts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">⚠ Active Overlap Warnings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conflicts.map((w, i) => (
              <div key={i} className="flex items-start gap-3.5 p-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 animate-fadeIn">
                <span className="material-symbols-outlined text-[24px] text-red-600 shrink-0 mt-0.5">warning</span>
                <div className="flex-1">
                  <p className="font-bold text-on-surface text-sm">{w.asset} <span className="font-mono text-xs text-on-surface-variant">({w.id})</span></p>
                  <p className="text-xs text-on-surface-variant mt-1">{w.issue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and List */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 flex-wrap gap-4 bg-surface-container-low dark:bg-surface-container-high/20">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status:</span>
              <div className="flex gap-1.5">
                {['All', 'Active', 'Returned', 'Pending Approval', 'Rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all ${filterStatus === s ? 'bg-primary text-on-primary shadow-sm' : 'bg-white dark:bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-4">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Type:</span>
              <div className="flex gap-1.5">
                {['All', 'Allocation', 'Return', 'Transfer'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all ${filterType === t ? 'bg-purple-600 text-white shadow-sm' : 'bg-white dark:bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <span className="text-xs font-medium text-on-surface-variant">{filtered.length} records found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                <th className="p-4">ID</th>
                <th className="p-4">Asset Details</th>
                <th className="p-4">Assignee</th>
                <th className="p-4">Location/Dept</th>
                <th className="p-4">Checkout Date</th>
                <th className="p-4">Expected Return</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">swap_horiz</span>
                    No allocation records match the filters.
                  </td>
                </tr>
              ) : filtered.map((item) => {
                const overdue = isOverdue(item);
                return (
                  <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group text-on-surface">
                    <td className="p-4 font-mono text-xs font-bold text-on-surface-variant">{item.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-sm">{item.assetName}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{item.assetId}</p>
                    </td>
                    <td className="p-4 font-medium">{item.employeeName}</td>
                    <td className="p-4">
                      <p className="font-semibold text-xs">{item.department}</p>
                    </td>
                    <td className="p-4 text-xs font-medium text-on-surface-variant">{item.checkoutDate}</td>
                    <td className="p-4 text-xs">
                      {item.expectedReturn ? (
                        <span className={overdue ? 'text-red-500 font-bold' : 'text-on-surface-variant font-medium'}>
                          {item.expectedReturn}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/40 italic">Open assignment</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {overdue && (
                          <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                            OVERDUE
                          </span>
                        )}
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.status === 'Returned' || item.status === 'Completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                            : item.status === 'Pending Approval'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : item.status === 'Rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        {item.status === 'Pending Approval' && (
                          <>
                            <button onClick={() => handleApprove(item)} className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors" title="Approve Request">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </button>
                            <button onClick={() => handleOpenReject(item)} className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors" title="Reject Request">
                              <span className="material-symbols-outlined text-[16px]">cancel</span>
                            </button>
                          </>
                        )}
                        {item.status === 'Active' && (
                          <button 
                            onClick={() => { setSelectedAlloc(item); setReturnForm({ actualReturn: new Date().toISOString().split('T')[0], checkinCondition: item.checkoutCondition, checkinNotes: '' }); setShowReturnModal(true); }} 
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg text-green-600 transition-colors" 
                            title="Process Return Check-in"
                          >
                            <span className="material-symbols-outlined text-[16px]">keyboard_return</span>
                          </button>
                        )}
                        <button onClick={() => handleOpenTimeline(item)} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100" title="View Timeline Lifecycle">
                          <span className="material-symbols-outlined text-[16px]">history</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW ALLOCATION MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-xl">Create New Assignment Request</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAllocation} className="space-y-4">
              {/* Asset Select */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Asset to Allocate *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface font-semibold"
                  value={newForm.assetId}
                  onChange={e => setNewForm(prev => ({ ...prev, assetId: e.target.value }))}
                  required
                >
                  <option value="">Select Asset...</option>
                  {assets.filter(a => a.status === 'Active').map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id}) - {a.location || 'HQ'}</option>
                  ))}
                </select>
              </div>

              {/* Employee & Dept selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Assignee Staff *</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={newForm.employeeId}
                    onChange={e => setNewForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    required
                  >
                    <option value="">Select Employee...</option>
                    {users.map(u => (
                      <option key={u.email} value={u.email}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Target Department</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={newForm.department}
                    onChange={e => setNewForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="None">None</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates & Checkout condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Expected Return Date</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={newForm.expectedReturn}
                    onChange={e => setNewForm(prev => ({ ...prev, expectedReturn: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Checkout Condition</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={newForm.checkoutCondition}
                    onChange={e => setNewForm(prev => ({ ...prev, checkoutCondition: e.target.value }))}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Checkout Notes</label>
                <textarea 
                  rows={3} 
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface resize-none"
                  placeholder="State the usage context or initial setup requirements..."
                  value={newForm.checkoutNotes}
                  onChange={e => setNewForm(prev => ({ ...prev, checkoutNotes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10"
                >
                  Submit Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN CHECK-IN DIALOG */}
      {showReturnModal && selectedAlloc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReturnModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-lg">Process Return Check-in</h3>
              <button onClick={() => setShowReturnModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low dark:bg-surface-container p-3.5 rounded-xl border border-outline-variant/20 mb-4 text-xs space-y-1 text-on-surface-variant">
              <p>Asset: <strong className="text-on-surface">{selectedAlloc.assetName}</strong></p>
              <p>Assignee: <strong className="text-on-surface">{selectedAlloc.employeeName}</strong></p>
              <p>Checkout Condition: <strong className="text-on-surface">{selectedAlloc.checkoutCondition}</strong></p>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Return Date *</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={returnForm.actualReturn}
                  onChange={e => setReturnForm(prev => ({ ...prev, actualReturn: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Check-in Condition *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={returnForm.checkinCondition}
                  onChange={e => setReturnForm(prev => ({ ...prev, checkinCondition: e.target.value }))}
                  required
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Check-in Notes</label>
                <textarea 
                  rows={3} 
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface resize-none"
                  placeholder="Record any damage, repairs, or return state comments..."
                  value={returnForm.checkinNotes}
                  onChange={e => setReturnForm(prev => ({ ...prev, checkinNotes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowReturnModal(false)}
                  className="px-4.5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  Complete Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT REQUEST REASON MODAL */}
      {showRejectModal && selectedAlloc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-lg">Reject Assignment Request</h3>
              <button onClick={() => setShowRejectModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Reason for Rejection *</label>
                <textarea 
                  rows={3} 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface resize-none"
                  placeholder="Provide the reason for rejection (e.g. Asset scheduled for maintenance)..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  className="px-4.5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED LIFE TIMELINE MODAL */}
      {showTimelineModal && selectedAlloc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTimelineModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-lg">Asset Lifecycle Timeline</h3>
              <button onClick={() => setShowTimelineModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6 pb-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">1</div>
                  <div className="w-0.5 h-12 bg-outline-variant"></div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Assignment Initiated</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Checked out by {selectedAlloc.employeeName} on {selectedAlloc.checkoutDate}</p>
                  <p className="text-xs text-on-surface-variant italic mt-1">"{selectedAlloc.checkoutNotes || 'No checkout notes provided'}"</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    selectedAlloc.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>2</div>
                  <div className="w-0.5 h-12 bg-outline-variant"></div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Approval Review</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {selectedAlloc.status === 'Pending Approval' 
                      ? 'Waiting for Department Head or Asset Manager review.' 
                      : `Request Approved. Status marked as ${selectedAlloc.status}.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    selectedAlloc.status === 'Returned' ? 'bg-green-100 text-green-700' : 'bg-surface-container text-on-surface-variant'
                  }`}>3</div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Asset Return Check-in</h4>
                  {selectedAlloc.status === 'Returned' ? (
                    <div className="space-y-1 mt-1 text-xs text-on-surface-variant">
                      <p>Returned on: <strong>{selectedAlloc.actualReturn}</strong></p>
                      <p>Condition: <strong>{selectedAlloc.checkinCondition}</strong></p>
                      <p className="italic">"{selectedAlloc.checkinNotes || 'No notes'}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant mt-0.5">Asset has not been returned yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/30 mt-4">
              <button onClick={() => setShowTimelineModal(false)} className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
