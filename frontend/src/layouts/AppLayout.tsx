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

import { Breadcrumb } from './components/Breadcrumb';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background dark:bg-[#0F172A] text-foreground flex transition-colors duration-300">
      {/* Sidebar - fixed width */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen w-[calc(100%-260px)]">
        {/* Header - sticky top */}
        <Header />

        {/* Dynamic page contents */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
