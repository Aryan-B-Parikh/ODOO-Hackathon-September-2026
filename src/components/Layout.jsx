import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  return (
      <div className="min-h-screen bg-background dark:bg-inverse-surface text-on-surface flex">
      {/* Sidebar - fixed width */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-sidebar-width flex-1 flex flex-col min-h-screen">
        {/* Header - sticky top */}
        <Header />

        {/* Dynamic page contents */}
        <main className="flex-1 w-full max-w-container-max mx-auto p-gutter space-y-stack-gap">
          {children}
        </main>
      </div>
    </div>
  );
}
