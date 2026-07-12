import React, { useState } from 'react';

const allocationHistory = [
  { id: 'ALT-001', asset: 'MacBook Pro M3 Max', assetId: 'ASSET-8291', from: 'Sarah Jenkins', to: 'Elena Vance', dept: 'Logistics & Assets', date: 'Jul 10, 2026', status: 'Completed', type: 'Transfer' },
  { id: 'ALT-002', asset: 'Tesla Model 3 - Fleet 44', assetId: 'ASSET-9003', from: 'Fleet Pool', to: 'David Miller', dept: 'Fleet Operations', date: 'Jul 09, 2026', status: 'Pending Approval', type: 'Allocation' },
  { id: 'ALT-003', asset: 'Dell UltraSharp 32"', assetId: 'ASSET-4412', from: 'Main Office R4', to: 'IT Infrastructure', dept: 'IT Infrastructure', date: 'Jul 08, 2026', status: 'In Review', type: 'Transfer' },
  { id: 'ALT-004', asset: 'Ergonomic Chair V2', assetId: 'ASSET-1224', from: 'Maria G.', to: 'Unassigned', dept: 'Facilities', date: 'Jul 07, 2026', status: 'Completed', type: 'Return' },
  { id: 'ALT-005', asset: 'Network Switch Cisco', assetId: 'ASSET-5561', from: 'IT Stock', to: 'Server Room 2', dept: 'IT Infrastructure', date: 'Jul 06, 2026', status: 'Completed', type: 'Allocation' },
];

const statusColors = {
  'Completed': 'bg-green-100 text-green-700',
  'Pending Approval': 'bg-yellow-100 text-yellow-700',
  'In Review': 'bg-blue-100 text-blue-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const typeColors = {
  'Transfer': 'bg-purple-100 text-purple-700',
  'Allocation': 'bg-blue-100 text-blue-700',
  'Return': 'bg-orange-100 text-orange-700',
};

const conflictWarnings = [
  { asset: 'Dell XPS 15', id: 'ASSET-2209', issue: 'Double-allocated to 2 departments', severity: 'high' },
  { asset: 'Conference Room AV Kit', id: 'ASSET-7810', issue: 'Scheduled maintenance overlaps with booking', severity: 'medium' },
];

export default function AllocationTransfer() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const filtered = allocationHistory.filter(a =>
    (filterStatus === 'All' || a.status === filterStatus) &&
    (filterType === 'All' || a.type === filterType)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Allocation & Transfer</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage asset allocation, transfers, and approval workflows</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          New Transfer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Allocations', value: '842', icon: 'assignment_turned_in', color: 'text-primary bg-primary/10' },
          { label: 'Pending Approval', value: '12', icon: 'pending_actions', color: 'text-yellow-600 bg-yellow-100' },
          { label: 'Transfers This Month', value: '38', icon: 'swap_horiz', color: 'text-purple-600 bg-purple-100' },
          { label: 'Conflict Alerts', value: conflictWarnings.length.toString(), icon: 'warning', color: 'text-red-600 bg-red-100' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Conflict Warnings */}
      {conflictWarnings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">⚠ Conflict Warnings</h2>
          {conflictWarnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${w.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <span className={`material-symbols-outlined text-[20px] mt-0.5 ${w.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>warning</span>
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">{w.asset} <span className="text-on-surface-variant font-normal">({w.id})</span></p>
                <p className="text-xs text-on-surface-variant mt-0.5">{w.issue}</p>
              </div>
              <button className="text-xs font-semibold text-primary hover:underline shrink-0">Resolve</button>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Table */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-on-surface">Filter by:</span>
            <div className="flex gap-2 flex-wrap">
              {['All', 'Completed', 'Pending Approval', 'In Review'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${filterStatus === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {['All', 'Transfer', 'Allocation', 'Return'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${filterType === t ? 'bg-purple-600 text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-on-surface-variant">{filtered.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-outline-variant/20 bg-surface-container-low/50">
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Asset</th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider hidden md:table-cell">From → To</th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{item.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-on-surface text-xs">{item.asset}</p>
                    <p className="text-[10px] text-on-surface-variant">{item.assetId}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span>{item.from}</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      <span className="text-on-surface font-semibold">{item.to}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant hidden lg:table-cell">{item.dept}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${typeColors[item.type]}`}>{item.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant hidden md:table-cell">{item.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {item.status === 'Pending Approval' && (
                        <>
                          <button className="p-1 hover:bg-green-100 rounded-lg text-green-600 transition-colors" title="Approve">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          </button>
                          <button className="p-1 hover:bg-red-100 rounded-lg text-red-600 transition-colors" title="Reject">
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                          </button>
                        </>
                      )}
                      <button className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors opacity-0 group-hover:opacity-100" title="View">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transfer Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface text-lg">New Allocation / Transfer</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Type</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option>Allocation</option>
                  <option>Transfer</option>
                  <option>Return</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Asset</label>
                <input className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Search asset ID or name..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">From</label>
                  <input className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Current holder..." />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">To</label>
                  <input className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="New holder..." />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Notes</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-all">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
