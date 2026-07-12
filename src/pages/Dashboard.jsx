import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Dashboard() {
  const { assets, tickets } = useContext(AppContext);

  // Dynamic calculations based on state + design base numbers
  const totalAssetsCount = 12477 + assets.length;
  const activeAllocationsCount = 8899 + assets.filter(a => a.status === 'Active').length;
  const pendingMaintenanceCount = tickets.filter(t => t.status !== 'Completed').length;
  const criticalAlertsCount = tickets.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

  // Distribution calculations
  const categories = {
    "IT Equipment": assets.filter(a => a.category === "IT Equipment").length,
    "Vehicles": assets.filter(a => a.category === "Vehicles").length,
    "Office Furniture": assets.filter(a => a.category === "Office Furniture").length,
    "Manufacturing": assets.filter(a => a.category === "Manufacturing").length,
  };

  const recentActivities = [
    {
      id: 1,
      icon: "check_circle",
      iconColor: "text-green-600 bg-green-50 dark:bg-green-900/20",
      title: "MacBook Pro M3 Max Audit Completed",
      desc: "Sarah Jenkins completed weekly self-audit of ASSET-8291.",
      time: "2 hours ago"
    },
    {
      id: 2,
      icon: "warning",
      iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
      title: "Forklift F2 Hydraulic Alert Raised",
      desc: "Automated telemetry reported low pressure in reservoir B.",
      time: "4 hours ago"
    },
    {
      id: 3,
      icon: "add_circle",
      iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
      title: "New Network Switch Registered",
      desc: "Cisco 48-port switch added to Server Room 2 inventory.",
      time: "1 day ago"
    },
    {
      id: 4,
      icon: "build",
      iconColor: "text-red-600 bg-red-50 dark:bg-red-900/20",
      title: "Server Power Ticket Dispatched",
      desc: "Ticket #AX-1988 assigned to Alex Rivera for Rack 12 power issues.",
      time: "1 day ago"
    }
  ];

  return (
    <div className="space-y-stack-gap animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Enterprise Overview</h2>
          <p className="text-on-surface-variant font-body-lg text-body-lg">Real-time status of your global asset ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-body-md hover:bg-outline-variant transition-all border border-outline-variant/30">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">calendar_month</span>
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-body-md hover:bg-outline-variant transition-all border border-outline-variant/30">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">download</span>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assets */}
        <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-primary-container/10 text-primary rounded-xl">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">+4.2%</span>
          </div>
          <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-wider font-label-caps">Total Assets</p>
          <p className="text-headline-md font-headline-md text-on-surface mt-1 font-bold">{totalAssetsCount.toLocaleString()}</p>
          <div className="h-8 mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,15 Q25,5 50,15 T100,5" fill="none" stroke="#004ac6" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>

        {/* Active Allocations */}
        <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-secondary-container/30 text-secondary rounded-xl">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_ind</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">+1.8%</span>
          </div>
          <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-wider font-label-caps">Active Allocations</p>
          <p className="text-headline-md font-headline-md text-on-surface mt-1 font-bold">{activeAllocationsCount.toLocaleString()}</p>
          <div className="h-8 mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 Q25,18 50,10 T100,12" fill="none" stroke="#505f76" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>

        {/* Pending Maintenance */}
        <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-tertiary-container/10 text-tertiary rounded-xl">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
            </div>
            <span className="text-xs font-bold text-tertiary bg-tertiary-fixed px-2.5 py-1 rounded-full border border-tertiary-container/20">-2.4%</span>
          </div>
          <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-wider font-label-caps">Pending Maintenance</p>
          <p className="text-headline-md font-headline-md text-on-surface mt-1 font-bold">{pendingMaintenanceCount}</p>
          <div className="h-8 mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,5 Q25,15 50,5 T100,10" fill="none" stroke="#943700" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className={`glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group ${criticalAlertsCount > 0 ? 'border-error/20 bg-error-container/5' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${criticalAlertsCount > 0 ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${criticalAlertsCount > 0 ? 'text-error bg-error-container border-error/20' : 'text-on-surface-variant bg-surface-container border-outline-variant/30'}`}>
              {criticalAlertsCount > 0 ? 'ACTION REQ.' : 'STABLE'}
            </span>
          </div>
          <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-wider font-label-caps">Critical Alerts</p>
          <p className={`text-headline-md font-headline-md mt-1 font-bold ${criticalAlertsCount > 0 ? 'text-error animate-pulse' : 'text-on-surface'}`}>{criticalAlertsCount}</p>
          <div className="h-8 mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,18 L10,15 L20,19 L30,5 L40,15 L50,8 L60,19 L70,3 L80,12 L90,2 L100,10" fill="none" stroke={criticalAlertsCount > 0 ? '#ba1a1a' : '#737686'} strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Utilization Area Chart */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline-md text-[18px] text-on-surface font-bold">Asset Utilization Over Time</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs text-on-surface-variant font-bold">Physical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="text-xs text-on-surface-variant font-bold">Digital</span>
              </div>
            </div>
          </div>
          <div className="relative h-[250px] w-full flex items-end">
            {/* SVG Area Chart */}
            <div className="absolute inset-0 flex items-end pb-6">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#004ac6" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#004ac6" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,100 L0,60 Q100,20 200,50 T400,30 T600,70 T800,20 T1000,40 L1000,100 Z" fill="url(#chartGradient)"></path>
                <path d="M0,60 Q100,20 200,50 T400,30 T600,70 T800,20 T1000,40" fill="none" stroke="#004ac6" strokeWidth="3"></path>
              </svg>
            </div>
            {/* Axis Labels */}
            <div className="w-full flex justify-between pt-2 border-t border-outline-variant/30 text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-wider">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </div>
        </div>

        {/* Asset Distribution Donut */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-headline-md text-[18px] text-on-surface font-bold mb-4">Distribution by Category</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative py-4">
            {/* Donut Graphic */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="none" r="15.9" stroke="#f3f3fe" strokeWidth="3.8"></circle>
                <circle cx="18" cy="18" fill="none" r="15.9" stroke="#004ac6" strokeDasharray="45 100" strokeLinecap="round" strokeWidth="3.8"></circle>
                <circle cx="18" cy="18" fill="none" r="15.9" stroke="#943700" strokeDasharray="25 100" strokeDashoffset="-45" strokeLinecap="round" strokeWidth="3.8"></circle>
                <circle cx="18" cy="18" fill="none" r="15.9" stroke="#505f76" strokeDasharray="30 100" strokeDashoffset="-70" strokeLinecap="round" strokeWidth="3.8"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-on-surface">{(assets.length).toString()}</span>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Tracking</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant/30 text-body-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span className="text-on-surface-variant truncate">IT: {categories["IT Equipment"]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
              <span className="text-on-surface-variant truncate">Vehicles: {categories["Vehicles"]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span className="text-on-surface-variant truncate">Furniture: {categories["Office Furniture"]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest border border-outline"></span>
              <span className="text-on-surface-variant truncate">Mfg: {categories["Manufacturing"]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
        <h3 className="font-headline-md text-[18px] text-on-surface font-bold mb-6">Recent System Activity</h3>
        <div className="divide-y divide-outline-variant/30">
          {recentActivities.map((act) => (
            <div key={act.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.iconColor}`}>
                <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-body-md text-body-md text-on-surface font-bold group-hover:text-primary transition-colors leading-tight">{act.title}</h4>
                  <span className="text-[11px] text-on-surface-variant whitespace-nowrap">{act.time}</span>
                </div>
                <p className="text-on-surface-variant font-body-md text-[13px] mt-1">{act.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
