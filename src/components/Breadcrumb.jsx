import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/assets': 'Asset Directory',
  '/maintenance': 'Maintenance Board',
  '/audit': 'System Audit',
  '/settings': 'Settings',
  '/profile': 'My Profile',
  '/organization': 'Organization Setup',
  '/allocation': 'Allocation & Transfer',
  '/booking': 'Resource Booking',
  '/reports': 'Reports & Analytics',
  '/notifications': 'Notifications',
  '/error-states': 'Error States',
};

export default function Breadcrumb() {
  const location = useLocation();
  const label = ROUTE_LABELS[location.pathname];

  if (!label || location.pathname === '/dashboard') return null;

  return (
    <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-4 select-none">
      <Link 
        to="/dashboard" 
        className="hover:text-primary transition-colors font-semibold flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[14px]">home</span>
        <span>Home</span>
      </Link>
      <span className="text-outline-variant">
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      </span>
      <span className="font-bold text-on-surface">{label}</span>
    </nav>
  );
}
