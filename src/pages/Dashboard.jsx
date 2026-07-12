import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function Dashboard() {
  const { assets, tickets, apiCall } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(null); // null = all-time, 30 = last 30 days

  const [monitorTab, setMonitorTab] = useState('activity');
  const [alertTab, setAlertTab] = useState('overdue');

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const url = daysFilter ? `/dashboard?days=${daysFilter}` : '/dashboard';
        const data = await apiCall(url);
        if (active) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };
    fetchStats();

    // 30 seconds polling for real-time updates
    const interval = setInterval(fetchStats, 30000);

    return () => { 
      active = false; 
      clearInterval(interval);
    };
  }, [assets, tickets, daysFilter]);

  // Dynamic calculations based on state + API metrics
  const totalAssetsCount = stats ? stats.totalAssets : assets.length;
  const activeAllocationsCount = stats ? stats.activeAllocations : assets.filter(a => a.status === 'Active').length;
  const pendingMaintenanceCount = stats ? stats.pendingMaintenance : tickets.filter(t => t.status !== 'Completed').length;
  const criticalAlertsCount = tickets.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

  // Distribution calculations
  const categories = {
    "IT Equipment": assets.filter(a => a.category === "IT Equipment").length,
    "Vehicles": assets.filter(a => a.category === "Vehicles").length,
    "Office Furniture": assets.filter(a => a.category === "Office Furniture").length,
    "Manufacturing": assets.filter(a => a.category === "Manufacturing").length,
  };

  const recentActivities = stats && stats.recentActivity && stats.recentActivity.length > 0
    ? stats.recentActivity.map((act, index) => {
        let icon = "check_circle";
        let iconColor = "text-green-600 bg-green-50 dark:bg-green-900/20";
        if (act.action === 'Checkout') {
          icon = "assignment_ind";
          iconColor = "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
        } else if (act.action === 'Return') {
          icon = "keyboard_return";
          iconColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
        } else if (act.action === 'Log Request') {
          icon = "build";
          iconColor = "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
        }
        return {
          id: act.id || index,
          icon,
          iconColor,
          title: act.details,
          desc: `Action performed by ${act.user}`,
          time: act.timestamp
        };
      })
    : [
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
          <button
            onClick={() => setDaysFilter(prev => prev === 30 ? null : 30)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-body-md hover:bg-outline-variant transition-all border ${
              daysFilter === 30
                ? 'bg-primary text-on-primary border-primary/30 shadow-sm shadow-primary/20'
                : 'bg-surface-container-high text-on-surface border-outline-variant/30'
            }`}
            title={daysFilter === 30 ? 'Showing last 30 days — click to reset' : 'Filter to last 30 days'}
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span>{daysFilter === 30 ? 'Last 30 Days ✓' : 'Last 30 Days'}</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-body-md hover:opacity-90 transition-all border border-primary/30 shadow-sm shadow-primary/20"
            onClick={() => window.open('http://localhost:5050/api/reports/export/csv', '_blank')}
            title="Download full asset registry as CSV"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export CSV</span>
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

      {/* Secondary Stats Chips */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/30">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-emerald-700">assignment_returned</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700/80">Upcoming Returns</p>
              <p className="text-lg font-extrabold text-emerald-800">{stats.upcomingReturns ? stats.upcomingReturns.length : 0} <span className="text-xs font-semibold text-emerald-600">in next 7 days</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-purple-50 border border-purple-200 dark:bg-purple-900/10 dark:border-purple-800/30">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-purple-700">move_up</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700/80">Pending Transfers</p>
              <p className="text-lg font-extrabold text-purple-800">{stats.pendingTransfers ? stats.pendingTransfers.length : 0} <span className="text-xs font-semibold text-purple-600">awaiting approval</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/30">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-blue-700">event_available</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700/80">Active Bookings</p>
              <p className="text-lg font-extrabold text-blue-800">{stats.activeBookings ? stats.activeBookings.length : 0} <span className="text-xs font-semibold text-blue-600">resources reserved</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Operations Actions Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="text-on-surface font-bold text-sm tracking-wide uppercase font-label-caps mb-4">Quick Operations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <a href="/assets?action=add" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low hover:bg-primary-container/20 border border-outline-variant/30 hover:border-primary/30 transition-all text-center group">
            <span className="material-symbols-outlined text-[28px] text-primary group-hover:scale-110 transition-transform">add_circle</span>
            <span className="text-xs font-bold text-on-surface">Register Asset</span>
          </a>
          <a href="/allocation?action=checkout" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low hover:bg-secondary-container/20 border border-outline-variant/30 hover:border-secondary/30 transition-all text-center group">
            <span className="material-symbols-outlined text-[28px] text-secondary group-hover:scale-110 transition-transform">assignment_turned_in</span>
            <span className="text-xs font-bold text-on-surface">Checkout Asset</span>
          </a>
          <a href="/booking" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low hover:bg-tertiary-container/20 border border-outline-variant/30 hover:border-tertiary/30 transition-all text-center group">
            <span className="material-symbols-outlined text-[28px] text-tertiary group-hover:scale-110 transition-transform">calendar_month</span>
            <span className="text-xs font-bold text-on-surface">Book Resource</span>
          </a>
          <a href="/maintenance" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low hover:bg-error-container/20 border border-outline-variant/30 hover:border-error/30 transition-all text-center group">
            <span className="material-symbols-outlined text-[28px] text-error group-hover:scale-110 transition-transform">build_circle</span>
            <span className="text-xs font-bold text-on-surface">Log Repair</span>
          </a>
          <a href="/organization?tab=employees" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low hover:bg-primary-container/20 border border-outline-variant/30 hover:border-primary/30 transition-all text-center group col-span-2 sm:col-span-1">
            <span className="material-symbols-outlined text-[28px] text-on-surface-variant group-hover:scale-110 transition-transform">person_add</span>
            <span className="text-xs font-bold text-on-surface">Invite Employee</span>
          </a>
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

      {/* Bottom Grid: Tabbed Activities, Bookings, Overdue, Upcoming, and Transfers Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: System Monitor */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
            <h3 className="font-headline-md text-[16px] text-on-surface font-bold">System Monitor</h3>
            <div className="flex bg-surface-container rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setMonitorTab('activity')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${monitorTab === 'activity' ? 'bg-white dark:bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant'}`}
              >
                Recent Activity
              </button>
              <button
                onClick={() => setMonitorTab('bookings')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${monitorTab === 'bookings' ? 'bg-white dark:bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant'}`}
              >
                Active Bookings
              </button>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/30 flex-1 overflow-y-auto max-h-[350px]">
            {monitorTab === 'activity' ? (
              recentActivities.map((act) => (
                <div key={act.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.iconColor} shrink-0`}>
                    <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-body-md text-body-md text-on-surface font-bold group-hover:text-primary transition-colors leading-tight truncate">{act.title}</h4>
                      <span className="text-[11px] text-on-surface-variant whitespace-nowrap">{act.time}</span>
                    </div>
                    <p className="text-on-surface-variant font-body-md text-[13px] mt-1">{act.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              stats && stats.activeBookings && stats.activeBookings.length > 0 ? (
                stats.activeBookings.map((b, idx) => (
                  <div key={b.id || idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-800 dark:bg-blue-900/20 shrink-0">
                      <span className="material-symbols-outlined text-[20px]">event_available</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-body-md text-body-md text-on-surface font-bold truncate">{b.asset.name}</h4>
                        <span className="text-[10px] text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Booked
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-body-md text-[13px] mt-1">
                        Reserved by: <strong>{b.bookedBy ? b.bookedBy.name : 'Unknown Staff'}</strong>
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 font-mono mt-0.5">
                        {new Date(b.startTime).toLocaleDateString()} at {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-on-surface-variant font-medium text-sm">
                  📅 No active resource bookings found.
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Column: Alert Center */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
            <h3 className="font-headline-md text-[16px] text-on-surface font-bold">Alert Center</h3>
            <div className="flex bg-surface-container rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setAlertTab('overdue')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${alertTab === 'overdue' ? 'bg-white dark:bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant'}`}
              >
                Overdue
              </button>
              <button
                onClick={() => setAlertTab('upcoming')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${alertTab === 'upcoming' ? 'bg-white dark:bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant'}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setAlertTab('transfers')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${alertTab === 'transfers' ? 'bg-white dark:bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant'}`}
              >
                Transfers
              </button>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/30 flex-1 overflow-y-auto max-h-[350px]">
            {alertTab === 'overdue' && (
              !stats || !stats.overdueAllocations || stats.overdueAllocations.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant font-medium text-sm">
                  🎉 Excellent! No overdue asset checkouts detected.
                </div>
              ) : (
                stats.overdueAllocations.map((alloc) => (
                  <div key={alloc.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-error-container text-error shrink-0 animate-pulse">
                      <span className="material-symbols-outlined text-[20px]">assignment_late</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-body-md text-body-md text-on-surface font-bold truncate">{alloc.asset.name}</h4>
                        <span className="text-[10px] text-error font-bold whitespace-nowrap bg-error-container/20 px-2 py-0.5 rounded">
                          Overdue
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-body-md text-[13px] mt-1">
                        Held by: <strong>{alloc.employee ? alloc.employee.name : 'Unknown Staff'}</strong>
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 font-mono mt-0.5">
                        Expected Return: {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )
            )}

            {alertTab === 'upcoming' && (
              !stats || !stats.upcomingReturns || stats.upcomingReturns.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant font-medium text-sm">
                  🎉 No upcoming return deadlines in the next 7 days.
                </div>
              ) : (
                stats.upcomingReturns.map((alloc) => (
                  <div key={alloc.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 shrink-0">
                      <span className="material-symbols-outlined text-[20px]">assignment_returned</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-body-md text-body-md text-on-surface font-bold truncate">{alloc.asset.name}</h4>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          Returning
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-body-md text-[13px] mt-1">
                        Held by: <strong>{alloc.employee ? alloc.employee.name : 'Unknown Staff'}</strong>
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 font-mono mt-0.5">
                        Expected Return: {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )
            )}

            {alertTab === 'transfers' && (
              !stats || !stats.pendingTransfers || stats.pendingTransfers.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant font-medium text-sm">
                  📋 No pending transfer requests detected.
                </div>
              ) : (
                stats.pendingTransfers.map((req) => (
                  <div key={req.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 text-purple-800 dark:bg-purple-900/20 shrink-0">
                      <span className="material-symbols-outlined text-[20px]">move_up</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-body-md text-body-md text-on-surface font-bold truncate">{req.asset.name}</h4>
                        <span className="text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          Transfer
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-body-md text-[13px] mt-1">
                        From: <strong>{req.requestor.name}</strong> ➔ To: <strong>{req.targetEmployee ? req.targetEmployee.name : 'Department'}</strong>
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 font-mono mt-0.5">
                        Requested: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
