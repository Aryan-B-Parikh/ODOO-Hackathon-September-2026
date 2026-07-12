import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function SystemAudit() {
  const {
    audits,
    assets,
    departments,
    addAuditCycle,
    updateAuditCycle,
    updateAsset,
    addNotification
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('tasks');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
  const [showReconcileModal, setShowReconcileModal] = useState(false);

  // New Audit Cycle Form
  const [newAuditForm, setNewAuditForm] = useState({
    cycleName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    department: 'IT Infrastructure'
  });

  // Calculate stats
  const activeAudits = audits.filter(a => a.status !== 'Completed');
  const completedAudits = audits.filter(a => a.status === 'Completed');
  
  // Calculate health score: percentage of Excellent/Good assets
  const totalAssets = assets.length;
  const healthyAssets = assets.filter(a => a.condition === 'Excellent' || a.condition === 'Good').length;
  const healthScore = totalAssets > 0 ? ((healthyAssets / totalAssets) * 100).toFixed(1) : '100.0';

  // Gather discrepancies: verified assets with mismatching conditions or marked as Damaged/Poor
  const getDiscrepancies = () => {
    const list = [];
    audits.forEach(audit => {
      if (audit.status === 'Completed') return; // resolved
      audit.items.forEach(item => {
        const registeredAsset = assets.find(a => a.id === item.assetId);
        if (item.verified) {
          // Condition mismatch or bad condition
          const hasMismatch = registeredAsset && registeredAsset.condition !== item.condition;
          const isDamaged = item.condition === 'Damaged' || item.condition === 'Poor';
          if (hasMismatch || isDamaged) {
            list.push({
              auditId: audit.id,
              auditName: audit.cycleName,
              assetId: item.assetId,
              assetName: item.assetName,
              expectedCondition: registeredAsset?.condition || 'Excellent',
              actualCondition: item.condition,
              remarks: item.remarks,
              reason: hasMismatch ? 'Condition Mismatch' : 'Asset Damaged'
            });
          }
        }
      });
    });
    return list;
  };

  const discrepancies = getDiscrepancies();

  const handleStartAuditSubmit = (e) => {
    e.preventDefault();
    if (!newAuditForm.cycleName) return;

    // Auto populate checklist items with all assets belonging to selected department
    const deptAssets = assets.filter(a => a.department === newAuditForm.department);
    const auditItems = deptAssets.map(a => ({
      assetId: a.id,
      assetName: a.name,
      verified: false,
      condition: a.condition || 'Excellent',
      remarks: ''
    }));

    addAuditCycle({
      cycleName: newAuditForm.cycleName,
      startDate: newAuditForm.startDate,
      endDate: newAuditForm.endDate,
      department: newAuditForm.department,
      status: 'In Progress',
      items: auditItems
    });

    addNotification({
      title: "Audit Cycle Started",
      message: `Audit cycle "${newAuditForm.cycleName}" initiated for ${newAuditForm.department}.`,
      type: "success"
    });

    setShowNewModal(false);
    setNewAuditForm({
      cycleName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      department: departments[0]?.name || 'IT Infrastructure'
    });
  };

  // Checklist updates
  const handleChecklistChange = (assetId, field, value) => {
    if (!selectedAudit) return;
    const updatedItems = selectedAudit.items.map(item => 
      item.assetId === assetId ? { ...item, [field]: value } : item
    );
    setSelectedAudit(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSaveChecklist = () => {
    if (!selectedAudit) return;
    
    // Check if all items are verified to auto-close or advance the audit status
    const allVerified = selectedAudit.items.every(item => item.verified);
    const nextStatus = allVerified ? 'Completed' : 'In Progress';
    
    const timelineEvent = allVerified 
      ? { date: new Date().toISOString().split('T')[0], event: "Audit Completed & Signed Off" }
      : { date: new Date().toISOString().split('T')[0], event: "Audit Checklist Updated" };

    const updatedTimeline = [...(selectedAudit.timeline || []), timelineEvent];

    updateAuditCycle(selectedAudit.id, {
      items: selectedAudit.items,
      status: nextStatus,
      timeline: updatedTimeline
    });

    addNotification({
      title: allVerified ? "Audit Completed" : "Audit Progress Saved",
      message: allVerified 
        ? `Audit cycle "${selectedAudit.cycleName}" has been signed off.` 
        : `Checklist progress updated for "${selectedAudit.cycleName}".`,
      type: "success"
    });

    setShowChecklistModal(false);
    setSelectedAudit(null);
  };

  // Reconcile Discrepancy (Phase 7 - Resolve discrepancy)
  const handleReconcileSubmit = (e) => {
    e.preventDefault();
    if (!selectedDiscrepancy) return;

    // Update the registered asset's condition in context to match actual audited condition
    updateAsset(selectedDiscrepancy.assetId, {
      condition: selectedDiscrepancy.actualCondition,
      lastAudit: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    });

    // Remove or resolve discrepancy by updating audit checklist item remarks
    const targetAudit = audits.find(a => a.id === selectedDiscrepancy.auditId);
    if (targetAudit) {
      const updatedItems = targetAudit.items.map(item => 
        item.assetId === selectedDiscrepancy.assetId 
          ? { ...item, remarks: `Reconciled: Condition updated to ${selectedDiscrepancy.actualCondition}.` }
          : item
      );
      updateAuditCycle(selectedDiscrepancy.auditId, { items: updatedItems });
    }

    addNotification({
      title: "Discrepancy Reconciled",
      message: `Asset ${selectedDiscrepancy.assetId} configuration updated.`,
      type: "success"
    });

    setShowReconcileModal(false);
    setSelectedDiscrepancy(null);
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">System Audit</h2>
          <p className="text-sm text-on-surface-variant mt-1">Conduct inventory compliance reviews, reconcile physical asset counts, and view log timelines.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          Start New Audit
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{healthScore}%</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Asset Health Index</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{activeAudits.length}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Active Audits</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0 text-green-700">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{completedAudits.length}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Completed Cycles</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 text-red-700">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{discrepancies.length}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Discrepancy Alerts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Part: Active Cycles */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-on-surface">Active Audit Cycles</h3>
          
          <div className="space-y-3.5">
            {activeAudits.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-outline-variant/30 rounded-2xl bg-white dark:bg-surface-container text-on-surface-variant font-medium">
                No active audit cycles. Start one using the button above.
              </div>
            ) : (
              activeAudits.map((audit) => {
                const verifiedCount = audit.items.filter(i => i.verified).length;
                const totalCount = audit.items.length;
                const progressPct = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 100;
                
                return (
                  <div key={audit.id} className="bg-white dark:bg-surface-container border border-outline-variant/30 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4 hover:border-primary/50 transition-colors">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary">fact_check</span>
                        <h4 className="font-bold text-on-surface text-sm sm:text-base">{audit.cycleName}</h4>
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{audit.status}</span>
                      </div>
                      
                      <div className="text-xs text-on-surface-variant flex items-center gap-4">
                        <span>Dept: <strong>{audit.department}</strong></span>
                        <span>Due: <strong>{audit.endDate || 'No Date'}</strong></span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1.5 max-w-sm">
                        <div className="flex justify-between text-[10px] text-on-surface-variant font-bold">
                          <span>{verifiedCount} of {totalCount} assets verified</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => { setSelectedAudit(audit); setShowChecklistModal(true); }}
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                    >
                      Audit Checklist
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Part: Discrepancy Alerts */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface">Discrepancy Alerts</h3>
          <div className="space-y-3.5">
            {discrepancies.length === 0 ? (
              <div className="p-6 text-center border border-outline-variant/30 rounded-2xl bg-white dark:bg-surface-container text-on-surface-variant text-xs italic">
                No discrepancies found in active audits.
              </div>
            ) : (
              discrepancies.map((disc, idx) => (
                <div key={idx} className="bg-white dark:bg-surface-container p-4.5 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 rounded-full uppercase tracking-wider">{disc.reason}</span>
                    <span className="font-mono text-[10px] font-bold text-on-surface-variant">{disc.assetId}</span>
                  </div>

                  <h4 className="font-bold text-sm text-on-surface">{disc.assetName}</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 bg-surface-container-low dark:bg-surface-container p-2.5 rounded-xl border border-outline-variant/20 text-xs">
                    <div>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase">Expected</p>
                      <p className="font-semibold text-on-surface">{disc.expectedCondition}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase text-red-500">Audited</p>
                      <p className="font-bold text-red-600">{disc.actualCondition}</p>
                    </div>
                  </div>

                  {disc.remarks && <p className="text-xs text-on-surface-variant mt-2.5 italic">"{disc.remarks}"</p>}

                  <button 
                    onClick={() => { setSelectedDiscrepancy(disc); setShowReconcileModal(true); }}
                    className="w-full mt-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 text-xs font-bold py-2 rounded-xl border border-red-200 dark:border-red-900/50 transition-colors"
                  >
                    Resolve Discrepancy
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* START NEW AUDIT MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-xl">Create Audit Cycle</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleStartAuditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Audit Cycle Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Q3 2026 IT Equipment Review"
                  className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={newAuditForm.cycleName}
                  onChange={e => setNewAuditForm(prev => ({ ...prev, cycleName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Start Date *</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={newAuditForm.startDate}
                    onChange={e => setNewAuditForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">End Date *</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={newAuditForm.endDate}
                    onChange={e => setNewAuditForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Select Department Scope *</label>
                <select 
                  className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={newAuditForm.department}
                  onChange={e => setNewAuditForm(prev => ({ ...prev, department: e.target.value }))}
                  required
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
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
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFICATION CHECKLIST MODAL */}
      {showChecklistModal && selectedAudit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowChecklistModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <div>
                <h3 className="font-bold text-on-surface text-lg">{selectedAudit.cycleName}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Department: {selectedAudit.department}</p>
              </div>
              <button onClick={() => setShowChecklistModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 my-4">
              {selectedAudit.items.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic text-center py-6">No assets registered in this department currently.</p>
              ) : (
                <div className="space-y-3.5">
                  {selectedAudit.items.map((item) => (
                    <div key={item.assetId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low dark:bg-surface-container">
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-on-surface text-sm">{item.assetName}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">{item.assetId}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        {/* Verified toggle */}
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-on-surface">
                          <input 
                            type="checkbox" 
                            checked={item.verified}
                            onChange={e => handleChecklistChange(item.assetId, 'verified', e.target.checked)}
                            className="rounded border-outline-variant text-primary w-4 h-4 cursor-pointer"
                          />
                          <span>Verified</span>
                        </label>

                        {/* Condition selector */}
                        <select 
                          className="px-2 py-1.5 border border-outline-variant rounded-lg text-xs bg-white dark:bg-surface-container-high text-on-surface outline-none cursor-pointer"
                          value={item.condition}
                          onChange={e => handleChecklistChange(item.assetId, 'condition', e.target.value)}
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                          <option value="Damaged">Damaged</option>
                        </select>

                        {/* Remarks */}
                        <input 
                          type="text" 
                          placeholder="Audit remarks..."
                          className="flex-1 sm:flex-none px-3 py-1.5 border border-outline-variant rounded-lg text-xs bg-white dark:bg-surface-container-high text-on-surface outline-none"
                          value={item.remarks || ''}
                          onChange={e => handleChecklistChange(item.assetId, 'remarks', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
              <button 
                type="button" 
                onClick={() => setShowChecklistModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveChecklist}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCREPANCY RECONCILIATION DIALOG */}
      {showReconcileModal && selectedDiscrepancy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDiscrepancy(null)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-lg">Reconcile Asset Discrepancy</h3>
              <button onClick={() => setSelectedDiscrepancy(null)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-on-surface-variant mb-4">
              You are resolving a condition discrepancy flagged during the <strong>{selectedDiscrepancy.auditName}</strong> cycle.
            </p>

            <div className="bg-surface-container-low dark:bg-surface-container p-4 rounded-xl border border-outline-variant/20 text-xs space-y-2 text-on-surface-variant mb-5">
              <p>Asset ID: <strong className="text-on-surface font-mono">{selectedDiscrepancy.assetId}</strong></p>
              <p>Asset Name: <strong className="text-on-surface">{selectedDiscrepancy.assetName}</strong></p>
              <div className="flex gap-4 pt-1.5">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Expected Condition</p>
                  <p className="font-semibold text-on-surface text-sm">{selectedDiscrepancy.expectedCondition}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-red-500 uppercase">Audited Condition</p>
                  <p className="font-bold text-red-600 text-sm">{selectedDiscrepancy.actualCondition}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleReconcileSubmit} className="space-y-4">
              <p className="text-xs font-semibold text-on-surface">
                Clicking Confirm will update the primary asset record's condition to <strong>{selectedDiscrepancy.actualCondition}</strong> and sign off the discrepancy.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button" 
                  onClick={() => setSelectedDiscrepancy(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10"
                >
                  Confirm Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
