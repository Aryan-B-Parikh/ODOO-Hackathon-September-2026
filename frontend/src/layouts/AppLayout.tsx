/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation (Layouts)
 *
 * Responsibility:
 * The main application shell (Sidebar, Header, Main Content Area).
 */
import { Outlet } from 'react-router-dom';

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
          <nav>Navigation Placeholder</nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
