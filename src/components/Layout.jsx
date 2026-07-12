import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background dark:bg-[#0F172A] text-on-surface flex transition-colors duration-300">
      {/* Sidebar - fixed width */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-sidebar-width flex-1 flex flex-col min-h-screen">
        {/* Header - sticky top */}
        <Header />

        {/* Dynamic page contents */}
        <main className="flex-1 w-full max-w-container-max mx-auto p-gutter space-y-stack-gap">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
