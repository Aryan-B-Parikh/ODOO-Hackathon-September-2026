/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation (Layouts)
 *
 * Responsibility:
 * The main application shell (Sidebar, Header, Main Content Area).
 */
import { Outlet, Link } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Placeholder */}
      <header className="h-16 border-b flex items-center px-6">
        <h1 className="text-xl font-bold">AssetFlow ERP</h1>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar Placeholder */}
        <aside className="w-64 border-r p-4 hidden md:block">
          <nav className="space-y-2 flex flex-col">
            <Link to="/app/dashboard" className="p-2 hover:bg-slate-100 rounded">Dashboard</Link>
            <Link to="/app/departments" className="p-2 hover:bg-slate-100 rounded">Departments</Link>
            <Link to="/app/employees" className="p-2 hover:bg-slate-100 rounded">Employees</Link>
            <Link to="/categories" className="p-2 hover:bg-slate-100 rounded">Asset Categories</Link>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
