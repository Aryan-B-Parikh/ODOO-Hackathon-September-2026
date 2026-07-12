import React, { useState } from 'react';

const auditTasks = [
  {
    id: 1,
    icon: 'corporate_fare',
    iconBg: 'bg-blue-100 text-blue-600',
    borderColor: 'border-primary',
    title: 'Regional DC - Silicon Valley North',
    lead: 'Sarah M.',
    due: 'Due Sept 28',
    dueIcon: 'calendar_today',
    status: 'In Progress',
    statusBg: 'bg-blue-100 text-blue-700',
    actionIcon: 'chevron_right',
    actionClass: 'text-on-surface',
  },
  {
    id: 2,
    icon: 'devices',
    iconBg: 'bg-yellow-100 text-yellow-700',
    borderColor: 'border-yellow-500',
    title: 'Executive Laptop Fleet Refresh',
    lead: 'Mike T.',
    due: 'Due Oct 05',
    dueIcon: 'calendar_today',
    status: 'Pending',
    statusBg: 'bg-gray-100 text-gray-600',
    actionIcon: 'chevron_right',
    actionClass: 'text-on-surface',
  },
  {
    id: 3,
    icon: 'router',
    iconBg: 'bg-gray-100 text-gray-600',
    borderColor: 'border-green-500',
    title: 'Network Infrastructure Hub B',
    lead: 'David L.',
    due: 'Finished Sept 15',
    dueIcon: 'history',
    status: 'Completed',
    statusBg: 'bg-green-100 text-green-700',
    actionIcon: 'check_circle',
    actionClass: 'text-green-500',
  },
  {
    id: 4,
    icon: 'inventory',
    iconBg: 'bg-gray-50 text-gray-400',
    borderColor: 'border-gray-200',
    title: 'Offsite Storage Archive - Phase 4',
    lead: 'Unassigned',
    due: 'Oct 20',
    dueIcon: 'calendar_today',
    status: 'Scheduled',
    statusBg: 'bg-gray-100 text-gray-500',
    actionIcon: 'more_vert',
    actionClass: 'text-on-surface',
    faded: true,
  },
];

const discrepancies = [
  {
    id: 1,
    urgency: 'URGENT',
    urgencyBg: 'bg-red-100 text-red-600',
    icon: 'warning',
    iconBg: 'bg-red-100 text-red-600',
    assetId: 'ASSET-2A · MBP-14 · 4',
    title: 'M3 Max MacBook Pro (16-inch)',
    countLabel1: 'EXPECTED',
    count1: 42,
    countLabel2: 'PHYSICAL',
    count2: 39,
    note: '*Inventory mismatch detected in South Wing Locker D4*',
    borderColor: 'border-red-200',
  },
  {
    id: 2,
    urgency: 'MEDIUM',
    urgencyBg: 'bg-blue-100 text-blue-600',
    icon: 'info',
    iconBg: 'bg-blue-100 text-blue-600',
    assetId: 'ASSET-1B · 1401L · 12',
    title: 'Cisco Nexus 9300 Switches',
    countLabel1: 'EXPECTED',
    count1: 15,
    countLabel2: 'PHYSICAL',
    count2: 13,
    note: '*Process hardware identified in Storage Area A.*',
    borderColor: 'border-blue-200',
  },
];

const historyItems = [
  { ref: '#A20-2024-991', date: 'Sept 12, 2024', site: 'Audit HQ - Floor 8', auditor: 'Janet Doe', avatarBg: 'bg-blue-200 text-blue-800', result: 'VERIFIED', resultBg: 'bg-green-100 text-green-700' },
  { ref: '#A20-2024-003', date: 'Sept 05, 2024', site: 'London Edge', auditor: 'Marcus K.', avatarBg: 'bg-green-200 text-green-800', result: 'IRREGULAR', resultBg: 'bg-red-100 text-red-700' },
  { ref: '#A20-2024-003', date: 'Aug 28, 2024', site: 'Tokyo Branch', auditor: 'Yi-Ki S.', avatarBg: 'bg-purple-200 text-purple-800', result: 'VERIFIED', resultBg: 'bg-green-100 text-green-700' },
];

export default function SystemAudit() {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="p-8 max-w-screen-xl mx-auto w-full flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">System Audit</h2>
          <p className="text-base text-on-surface-variant">Q3 2024 Inventory &amp; Compliance Lifecycle</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface-container-high text-on-surface text-sm font-semibold py-2.5 px-5 rounded-xl border border-outline-variant flex items-center gap-2 hover:bg-surface-container-highest transition-all active:scale-95">
            <span className="material-symbols-outlined text-xl">file_download</span>
            <span>Export Report</span>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          <button className="bg-primary text-on-primary text-sm font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-xl">add_task</span>
            <span>Start New Audit</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Health Score */}
        <div className="md:col-span-2 bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-8xl text-primary">health_and_safety</span>
          </div>
          <div className="z-10">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Audit Health Score</span>
            <h3 className="text-4xl font-bold text-primary mt-1">94.2%</h3>
            <p className="text-sm text-on-surface-variant mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-green-500">trending_up</span>
              <span className="font-semibold text-green-600">+2.4%</span> from last quarter
            </p>
          </div>
          <div className="mt-8 flex gap-4 z-10">
            <div className="flex-1 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">Verified Assets</p>
              <p className="text-lg font-bold text-on-surface">12,482</p>
            </div>
            <div className="flex-1 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">Compliance Gap</p>
              <p className="text-lg font-bold text-red-500">0.8%</p>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Quarterly Progress</span>
            <div className="mt-4 flex items-center justify-between">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-outline-variant/20" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-primary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="62.8" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-on-surface">75%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-on-surface">15/20</p>
                <p className="text-xs text-on-surface-variant">Nodes Audited</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">Estimated finish: <span className="font-bold text-on-surface">Oct 12</span></p>
          </div>
        </div>

        {/* Pending Discrepancies */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Pending Discrepancies</span>
            <h3 className="text-4xl font-bold mt-2">08</h3>
            <p className="text-sm mt-2 font-medium text-blue-100">Require immediate reconciliation</p>
          </div>
          <button className="mt-4 w-full bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-colors active:scale-95">
            Review Now
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Tasks */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-on-surface">Active Audit Tasks</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
              </button>
              <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">sort</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {auditTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white dark:bg-surface-container border border-outline-variant/20 shadow-sm p-4 rounded-xl flex items-center gap-4 hover:shadow-md transition-all border-l-4 ${task.borderColor} ${task.faded ? 'opacity-75' : ''}`}
              >
                <div className={`w-12 h-12 ${task.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined">{task.icon}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold truncate ${task.faded ? 'text-on-surface-variant' : 'text-on-surface'}`}>{task.title}</h4>
                    <span className={`px-3 py-1 ${task.statusBg} text-[10px] font-extrabold rounded-full uppercase shrink-0`}>{task.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      Lead: {task.lead}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">{task.dueIcon}</span>
                      {task.due}
                    </span>
                  </div>
                </div>
                <button className={`p-2 hover:bg-surface-container-highest rounded-full transition-colors shrink-0 ${task.actionClass}`}>
                  <span className="material-symbols-outlined">{task.actionIcon}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Discrepancy Cards */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-on-surface">Discrepancies</h3>
            <a className="text-xs font-bold text-primary hover:underline uppercase tracking-wider" href="#">View All</a>
          </div>
          <div className="flex flex-col gap-4">
            {discrepancies.map((disc) => (
              <div key={disc.id} className={`bg-white dark:bg-surface-container p-5 rounded-2xl relative overflow-hidden group border ${disc.borderColor} shadow-sm`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 ${disc.iconBg} rounded-lg`}>
                    <span className="material-symbols-outlined">{disc.icon}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${disc.urgencyBg}`}>{disc.urgency}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">{disc.assetId}</p>
                <h4 className="font-bold text-on-surface mt-1">{disc.title}</h4>
                <div className="mt-3 flex gap-6">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">{disc.countLabel1}</p>
                    <p className="text-xl font-bold text-on-surface">{disc.count1}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">{disc.countLabel2}</p>
                    <p className="text-xl font-bold text-red-500">{disc.count2}</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-3 italic">{disc.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reconciliation History */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface">Audit Reconciliation History</h3>
          <a className="text-xs font-bold text-primary hover:underline uppercase tracking-wider" href="#">Full History ↓</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left pb-3 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Reference</th>
                <th className="text-left pb-3 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Date</th>
                <th className="text-left pb-3 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Site</th>
                <th className="text-left pb-3 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Auditor</th>
                <th className="text-left pb-3 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((item, idx) => (
                <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="py-3">
                    <a href="#" className="text-primary font-semibold hover:underline">{item.ref}</a>
                  </td>
                  <td className="py-3 text-on-surface-variant">{item.date}</td>
                  <td className="py-3 text-on-surface">{item.site}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.avatarBg}`}>
                        {item.auditor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-on-surface">{item.auditor}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${item.resultBg}`}>{item.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
