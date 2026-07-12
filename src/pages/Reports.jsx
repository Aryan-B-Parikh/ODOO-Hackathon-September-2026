import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumPct = 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="currentColor" strokeWidth="28" className="text-surface-container-low dark:text-surface-container" />
        {data.map((seg, i) => {
          const segLen = (seg.pct / 100) * circumference;
          const rotation = (cumPct / 100) * 360 - 90;
          cumPct += seg.pct;
          return (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="28"
              strokeDasharray={`${segLen} ${circumference}`}
              strokeDashoffset={0}
              transform={`rotate(${rotation} 100 100)`}
              className="transition-all duration-700"
            />
          );
        })}
        <text x="100" y="96" textAnchor="middle" className="fill-on-surface" style={{ fontSize: '28px', fontWeight: '700', fill: 'currentColor' }}>{total}</text>
        <text x="100" y="116" textAnchor="middle" style={{ fill: '#64748b', fontSize: '11px' }}>Total Assets</text>
      </svg>
      <div className="space-y-2 flex-1 min-w-[140px]">
        {data.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-on-surface-variant flex-1 truncate">{seg.name}</span>
            <span className="text-xs font-bold text-on-surface">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.acquired, d.disposed)));
  return (
    <div className="flex items-end gap-1.5 h-[160px] mt-4 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: '130px' }}>
            <div
              className="w-full max-w-[14px] bg-primary rounded-t-sm transition-all duration-700 hover:opacity-80"
              style={{ height: `${(d.acquired / maxVal) * 120}px` }}
              title={`Acquired: ${d.acquired}`}
            />
            <div
              className="w-full max-w-[14px] bg-red-300 dark:bg-red-700 rounded-t-sm transition-all duration-700 hover:opacity-80"
              style={{ height: `${(d.disposed / maxVal) * 120}px` }}
              title={`Disposed: ${d.disposed}`}
            />
          </div>
          <span className="text-[9px] text-on-surface-variant font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const {
    assets,
    tickets,
    allocations,
    departments,
    audits
  } = useContext(AppContext);

  const [dateRange, setDateRange] = useState('This Quarter');
  const [dept, setDept] = useState('All Departments');

  // ---- Live KPI calculations ----
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.purchaseCost) || 0), 0);
  const underMaintenance = tickets.filter(t => t.status !== 'Completed').length;
  const activeAlloc = allocations.filter(a => a.status === 'Active').length;
  const utilizationRate = totalAssets > 0 ? Math.round((activeAlloc / totalAssets) * 100) : 0;

  // ---- Category Distribution ----
  const categoryMap = {};
  assets.forEach(a => {
    const cat = a.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899', '#14B8A6'];
  const categoryTotal = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  const categoryData = Object.entries(categoryMap).map(([name, value], i) => ({
    name,
    value,
    color: COLORS[i % COLORS.length],
    pct: categoryTotal > 0 ? Math.round((value / categoryTotal) * 100) : 0
  }));

  // ---- Monthly Asset Flow (simulated with purchase dates) ----
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMap = {};
  monthNames.forEach(m => { monthlyMap[m] = { acquired: 0, disposed: 0 }; });
  assets.forEach(a => {
    if (a.purchaseDate) {
      const m = new Date(a.purchaseDate).getMonth();
      if (monthNames[m]) monthlyMap[monthNames[m]].acquired++;
    }
    if (a.status === 'Disposed') {
      const m = new Date(a.purchaseDate || new Date()).getMonth();
      if (monthNames[m]) monthlyMap[monthNames[m]].disposed++;
    }
  });
  const monthlyData = monthNames.slice(0, 7).map(month => ({
    month,
    acquired: monthlyMap[month].acquired,
    disposed: monthlyMap[month].disposed
  }));

  // ---- Maintenance Cost per Department ----
  const deptCosts = {};
  const deptBudgets = {};
  departments.forEach(d => {
    deptBudgets[d.name] = parseFloat(d.annualBudget) || 50000;
    deptCosts[d.name] = 0;
  });
  tickets.forEach(t => {
    const assetDept = assets.find(a => a.id === t.assetId)?.department;
    if (assetDept && deptCosts[assetDept] !== undefined) {
      deptCosts[assetDept] += parseFloat(t.actualCost) || parseFloat(t.estimatedCost) || 0;
    }
  });
  const maintenanceCost = Object.entries(deptCosts).slice(0, 5).map(([dept, cost]) => ({
    dept,
    cost,
    budget: deptBudgets[dept] || 50000
  }));

  // ---- Asset Age Distribution ----
  const now = new Date();
  const ageGroups = { '<1yr': 0, '1-2 yrs': 0, '2-3 yrs': 0, '3-5 yrs': 0, '5+ yrs': 0 };
  assets.forEach(a => {
    if (!a.purchaseDate) { ageGroups['<1yr']++; return; }
    const years = (now - new Date(a.purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
    if (years < 1) ageGroups['<1yr']++;
    else if (years < 2) ageGroups['1-2 yrs']++;
    else if (years < 3) ageGroups['2-3 yrs']++;
    else if (years < 5) ageGroups['3-5 yrs']++;
    else ageGroups['5+ yrs']++;
  });
  const ageData = Object.entries(ageGroups);
  const maxAge = Math.max(...Object.values(ageGroups), 1);

  // ---- Dept filter for the name dropdown ----
  const deptNames = ['All Departments', ...departments.map(d => d.name)];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Reports & Analytics</h1>
          <p className="text-sm text-on-surface-variant mt-1">Insights across your entire asset portfolio — live from system data.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="px-3 py-2 rounded-xl border border-outline-variant bg-white dark:bg-surface-container text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            {['This Month', 'This Quarter', 'This Year', 'Custom Range'].map(r => <option key={r}>{r}</option>)}
          </select>
          <select
            className="px-3 py-2 rounded-xl border border-outline-variant bg-white dark:bg-surface-container text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
            value={dept}
            onChange={e => setDept(e.target.value)}
          >
            {deptNames.map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Live KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: totalAssets.toLocaleString(), change: 'across all departments', icon: 'inventory_2', up: true, color: 'text-primary bg-primary/10' },
          { label: 'Portfolio Value', value: `$${(totalValue / 1000).toFixed(0)}K`, change: 'purchase cost total', icon: 'payments', up: true, color: 'text-green-600 bg-green-100' },
          { label: 'Under Maintenance', value: underMaintenance, change: 'open tickets', icon: 'build', up: false, color: 'text-orange-600 bg-orange-100' },
          { label: 'Utilization Rate', value: `${utilizationRate}%`, change: `${activeAlloc} actively allocated`, icon: 'speed', up: utilizationRate >= 50, color: 'text-purple-600 bg-purple-100' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{kpi.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{kpi.label}</p>
            <p className={`text-[10px] font-semibold mt-2 flex items-center gap-1 ${kpi.up ? 'text-green-600' : 'text-orange-500'}`}>
              <span className="material-symbols-outlined text-[12px]">{kpi.up ? 'trending_up' : 'trending_down'}</span>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset by Category Donut */}
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">Assets by Category</h3>
            <span className="text-xs text-on-surface-variant">{dateRange}</span>
          </div>
          {categoryData.length > 0 ? (
            <DonutChart data={categoryData} />
          ) : (
            <p className="text-on-surface-variant text-xs italic p-6 text-center">No assets registered yet.</p>
          )}
        </div>

        {/* Monthly Acquisition Bar Chart */}
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-on-surface">Monthly Asset Flow</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Acquired</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-300 inline-block" /> Disposed</span>
            </div>
          </div>
          <BarChart data={monthlyData} />
        </div>
      </div>

      {/* Maintenance Cost vs Budget */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-on-surface mb-5">Maintenance Cost vs Budget by Department</h3>
        {maintenanceCost.length === 0 ? (
          <p className="text-on-surface-variant text-xs italic text-center py-6">No department budget data available.</p>
        ) : (
          <div className="space-y-4">
            {maintenanceCost.map((item) => {
              const pct = item.budget > 0 ? Math.min((item.cost / item.budget) * 100, 100) : 0;
              const over = item.cost > item.budget * 0.8;
              return (
                <div key={item.dept}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-on-surface">{item.dept}</span>
                    <span className={`text-xs font-bold ${over ? 'text-red-600' : 'text-on-surface-variant'}`}>
                      ${(item.cost / 1000).toFixed(1)}K / ${(item.budget / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${over ? 'bg-red-400' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1">{pct.toFixed(0)}% utilized</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Asset Age Distribution Heatmap */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-on-surface">Asset Age Distribution</h3>
          <span className="text-xs text-on-surface-variant">{totalAssets} total</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {ageData.map(([range, count], i) => {
            const intensity = count / maxAge;
            return (
              <div key={range} className="text-center p-4 rounded-xl border border-outline-variant/20 hover:shadow-md transition-shadow" style={{ background: `rgba(37,99,235,${intensity * 0.15 + 0.04})` }}>
                <p className="text-xl font-bold" style={{ color: `rgba(37,99,235,${intensity * 0.8 + 0.3})` }}>{count}</p>
                <p className="text-[10px] text-on-surface-variant mt-1">{range}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Summary */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-on-surface mb-5">Audit Activity Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Audit Cycles', value: audits.length, icon: 'fact_check', color: 'text-blue-600 bg-blue-100' },
            { label: 'Completed Cycles', value: audits.filter(a => a.status === 'Completed').length, icon: 'check_circle', color: 'text-green-600 bg-green-100' },
            { label: 'Pending Review', value: audits.filter(a => a.status !== 'Completed').length, icon: 'pending', color: 'text-orange-600 bg-orange-100' }
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low dark:bg-surface-container-high/20">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-on-surface">{stat.value}</p>
                <p className="text-xs text-on-surface-variant">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
