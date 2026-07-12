import { useAuth } from '@features/auth/hooks/useAuth';
import { NavLink } from 'react-router-dom';
import { Role } from 'shared/enums';

const NavItem = ({ to, icon, label, badge = 0 }: { to: string, icon: string, label: string, badge?: number }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
        isActive
          ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold border-l-4 border-primary'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container'
      }`
    }
  >
    <span className="material-symbols-outlined text-[22px] shrink-0">{icon}</span>
    <span className="flex-1 truncate">{label}</span>
    {badge > 0 && (
      <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </NavLink>
);

export function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const unreadNotifications = 0; // Placeholder until backend support

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface dark:bg-[#111827] border-r border-outline-variant dark:border-[#1E293B] shadow-sm z-50 flex flex-col py-6 transition-colors duration-300">
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>package_2</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-primary dark:text-blue-400 leading-none tracking-tight">AssetFlow</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant dark:text-slate-500 font-bold mt-0.5">Enterprise RMS</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {/* Core section */}
        <div className="pb-1 px-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 dark:text-slate-600">Core</p>
        </div>

        <NavItem to="/app/dashboard" icon="dashboard" label="Dashboard" />
        <NavItem to="/assets" icon="inventory_2" label="Assets" />
        <NavItem to="/maintenance" icon="build" label="Maintenance" />

        {user.role === Role.Admin && (
          <NavItem to="/audit" icon="fact_check" label="Audit" />
        )}

        {user.role === Role.Admin && (
          <NavItem to="/settings" icon="settings" label="Settings" />
        )}

        {/* Management section */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 dark:text-slate-600">Management</p>
        </div>

        {user.role === Role.Admin && (
          <>
            <NavItem to="/app/departments" icon="corporate_fare" label="Departments" />
            <NavItem to="/app/employees" icon="groups" label="Employees" />
          </>
        )}

        <NavItem to="/allocation" icon="swap_horiz" label="Allocation" />
        <NavItem to="/booking" icon="event_available" label="Booking" />
        <NavItem to="/reports" icon="bar_chart" label="Reports" />

        {/* Communication section */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 dark:text-slate-600">System</p>
        </div>

        <NavItem to="/notifications" icon="notifications" label="Notifications" badge={unreadNotifications} />
        <NavItem to="/app/profile" icon="person" label="My Profile" />
      </nav>

      {/* User card at bottom */}
      <div className="mt-auto px-3 pt-4 border-t border-outline-variant dark:border-[#1E293B]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors">
          <div className="shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground`}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate leading-tight">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user.role}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-all shrink-0"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
