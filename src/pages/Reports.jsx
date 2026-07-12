import React, { useState, useEffect, useRef } from 'react';

const categoryData = [
  { name: 'IT Equipment', value: 312, color: '#2563EB', pct: 40 },
  { name: 'Vehicles', value: 48, color: '#22C55E', pct: 15 },
  { name: 'Furniture', value: 186, color: '#F59E0B', pct: 24 },
  { name: 'Manufacturing', value: 74, color: '#EF4444', pct: 10 },
  { name: 'Peripherals', value: 524, color: '#06B6D4', pct: 8 },
  { name: 'Other', value: 93, color: '#8B5CF6', pct: 3 },
];

const monthlyData = [
  { month: 'Jan', acquired: 12, disposed: 3 },
  { month: 'Feb', acquired: 8, disposed: 5 },
  { month: 'Mar', acquired: 22, disposed: 2 },
  { month: 'Apr', acquired: 15, disposed: 8 },
  { month: 'May', acquired: 30, disposed: 4 },
  { month: 'Jun', acquired: 18, disposed: 6 },
  { month: 'Jul', acquired: 25, disposed: 1 },
];

const maintenanceCost = [
  { dept: 'IT Infrastructure', cost: 42000, budget: 60000 },
  { dept: 'Fleet Operations', cost: 78000, budget: 90000 },
  { dept: 'Manufacturing', cost: 120000, budget: 150000 },
  { dept: 'Facilities', cost: 31000, budget: 40000 },
];

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumPct = 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="28" />
        {data.map((seg, i) => {
          const dashOffset = circumference - (seg.pct / 100) * circumference;
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
              strokeDasharray={`${(seg.pct / 100) * circumference} ${circumference}`}
              strokeDashoffset={0}
              transform={`rotate(${rotation} 100 100)`}
              className="transition-all duration-700"
            />
          );
        })}
        <text x="100" y="96" textAnchor="middle" className="text-2xl font-bold fill-current" style={{ fill: '#1e293b', fontSize: '28px', fontWeight: '700' }}>{total}</text>
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
    <div className="flex items-end gap-2 h-[160px] mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: '130px' }}>
            <div
              className="w-4 bg-primary rounded-t-sm transition-all duration-700"
              style={{ height: `${(d.acquired / maxVal) * 120}px` }}
              title={`Acquired: ${d.acquired}`}
            />
            <div
              className="w-4 bg-red-300 rounded-t-sm transition-all duration-700"
              style={{ height: `${(d.disposed / maxVal) * 120}px` }}
              title={`Disposed: ${d.disposed}`}
            />
          </div>
          <span className="text-[9px] text-on-surface-variant">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [dateRange, setDateRange] = useState('This Quarter');
  const [dept, setDept] = useState('All Departments');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Reports & Analytics</h1>
          <p className="text-sm text-on-surface-variant mt-1">Insights across your entire asset portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 rounded-xl border border-outline-variant bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            {['This Month', 'This Quarter', 'This Year', 'Custom Range'].map(r => <option key={r}>{r}</option>)}
          </select>
          <select
            className="px-3 py-2 rounded-xl border border-outline-variant bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            value={dept}
            onChange={e => setDept(e.target.value)}
          >
            {['All Departments', 'IT Infrastructure', 'Fleet Operations', 'Manufacturing', 'Facilities'].map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: '1,237', change: '+38 this month', icon: 'inventory_2', up: true, color: 'text-primary bg-primary/10' },
          { label: 'Asset Value', value: '$9.1M', change: '+$240K', icon: 'payments', up: true, color: 'text-green-600 bg-green-100' },
          { label: 'Under Maintenance', value: '24', change: '-3 vs last month', icon: 'build', up: false, color: 'text-orange-600 bg-orange-100' },
          { label: 'Utilization Rate', value: '78%', change: '+5% vs last month', icon: 'speed', up: true, color: 'text-purple-600 bg-purple-100' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{kpi.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{kpi.label}</p>
            <p className={`text-[10px] font-semibold mt-2 flex items-center gap-1 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
              <span className="material-symbols-outlined text-[12px]">{kpi.up ? 'trending_up' : 'trending_down'}</span>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset by Category Donut */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">Assets by Category</h3>
            <span className="text-xs text-on-surface-variant">{dateRange}</span>
          </div>
          <DonutChart data={categoryData} />
        </div>

        {/* Monthly Acquisition Bar Chart */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
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

      {/* Maintenance Cost by Dept */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-on-surface mb-5">Maintenance Cost vs Budget by Department</h3>
        <div className="space-y-4">
          {maintenanceCost.map((item) => {
            const pct = Math.min((item.cost / item.budget) * 100, 100);
            const over = item.cost > item.budget * 0.9;
            return (
              <div key={item.dept}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-on-surface">{item.dept}</span>
                  <span className={`text-xs font-bold ${over ? 'text-red-600' : 'text-on-surface-variant'}`}>
                    ${(item.cost / 1000).toFixed(0)}K / ${(item.budget / 1000).toFixed(0)}K
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
      </div>

      {/* Asset Age Heatmap / Table */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-on-surface">Asset Age Distribution</h3>
          <button className="text-xs text-primary font-semibold hover:underline">View Full Report</button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {['< 1yr', '1–2 yrs', '2–3 yrs', '3–5 yrs', '5+ yrs'].map((range, i) => {
            const counts = [125, 234, 318, 402, 158];
            const maxC = Math.max(...counts);
            const intensity = counts[i] / maxC;
            return (
              <div key={range} className="text-center p-4 rounded-xl border border-outline-variant/20" style={{ background: `rgba(37,99,235,${intensity * 0.15 + 0.04})` }}>
                <p className="text-xl font-bold" style={{ color: `rgba(37,99,235,${intensity * 0.8 + 0.3})` }}>{counts[i]}</p>
                <p className="text-[10px] text-on-surface-variant mt-1">{range}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
