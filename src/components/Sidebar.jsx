import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Sidebar() {
  const { user, logout } = useContext(AppContext);

  if (!user) return null;

  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline shadow-sm z-50 flex flex-col py-6">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>package_2</span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed leading-none">AssetFlow</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Enterprise RMS</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </NavLink>

        {/* Assets */}
        <NavLink
          to="/assets"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Assets</span>
        </NavLink>

        {/* Maintenance */}
        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">build</span>
          <span>Maintenance</span>
        </NavLink>

        {/* Audit */}
        <NavLink
          to="/audit"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">fact_check</span>
          <span>Audit</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </NavLink>

        {/* --- Management Section --- */}
        <div className="pt-3 pb-1 px-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Management</p>
        </div>

        {/* Organization Setup */}
        <NavLink
          to="/organization"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">corporate_fare</span>
          <span>Organization</span>
        </NavLink>

        {/* Allocation & Transfer */}
        <NavLink
          to="/allocation"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">swap_horiz</span>
          <span>Allocation</span>
        </NavLink>

        {/* Resource Booking */}
        <NavLink
          to="/booking"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">event_available</span>
          <span>Booking</span>
        </NavLink>

        {/* Reports */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">bar_chart</span>
          <span>Reports</span>
        </NavLink>

        {/* Notifications */}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sidebar-item text-sidebar-item transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">notifications</span>
          <span>Notifications</span>
        </NavLink>

      </nav>

      {/* User profile section */}
      <div className="mt-auto px-4 pt-6 border-t border-outline-variant flex items-center justify-between">
        <NavLink to="/profile" end className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            className="w-10 h-10 rounded-full border border-outline-variant object-cover"
            alt={user.name}
            src={user.avatar}
          />
          <div className="flex flex-col">
            <span className="font-sidebar-item text-sidebar-item text-on-surface leading-tight font-semibold">{user.name}</span>
            <span className="text-[10px] text-on-surface-variant mt-0.5">{user.level}</span>
          </div>
        </NavLink>
        
        <button
          onClick={logout}
          className="p-1.5 rounded-lg hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-all"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>

    </aside>
  );
}
