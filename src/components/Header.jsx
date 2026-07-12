import React, { useContext, useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Header() {
  const { searchQuery, setSearchQuery, user, logout, notifications, markNotificationRead, clearNotifications } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowUserDropdown(false);
    setShowNotifDropdown(false);
  }, [location]);

  // Apply dark/light mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          const el = document.getElementById('global-search-input');
          if (el) el.focus();
        }, 50);
      }
      if (e.key === 'Escape') {
        setShowUserDropdown(false);
        setShowNotifDropdown(false);
        setShowSearch(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getSearchPlaceholder = () => {
    switch (location.pathname) {
      case '/assets': return 'Search assets, IDs, or locations...';
      case '/maintenance': return 'Search tasks, assets, or technicians...';
      default: return 'Search anything... (Ctrl+K)';
    }
  };

  // ---- Live notification count ----
  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifs = notifications.slice(0, 5);

  const ICON_BY_TYPE = {
    success: { icon: 'check_circle', color: 'text-green-500' },
    error: { icon: 'warning', color: 'text-red-500' },
    warning: { icon: 'report_problem', color: 'text-orange-500' },
    info: { icon: 'info', color: 'text-blue-500' },
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/80 dark:bg-surface-container/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-gutter transition-colors duration-300">
      {/* Left: Search */}
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md group" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            id="global-search-input"
            className="w-full bg-surface-container-low dark:bg-surface-container border-none rounded-full pl-10 pr-10 py-2 text-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/60"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant bg-surface-container border border-outline-variant/30 px-1.5 py-0.5 rounded-md hidden md:block pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined transition-transform duration-300">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {/* Notification Bell with live count badge */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowUserDropdown(false); }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors relative text-on-surface-variant hover:text-on-surface"
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-on-error text-[9px] font-bold rounded-full flex items-center justify-center border border-surface animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Mini Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-surface dark:bg-surface-container border border-outline-variant rounded-2xl shadow-xl py-2 z-50 animate-fadeIn overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/30">
                <h3 className="font-bold text-on-surface text-sm">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={() => notifications.forEach(n => markNotificationRead(n.id))} className="text-xs text-primary font-semibold hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {recentNotifs.length === 0 ? (
                <div className="px-4 py-6 text-center text-on-surface-variant text-xs italic">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10 max-h-[300px] overflow-y-auto">
                  {recentNotifs.map(n => {
                    const iconInfo = ICON_BY_TYPE[n.type] || ICON_BY_TYPE.info;
                    return (
                      <div 
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`px-4 py-3 flex items-start gap-3 hover:bg-surface-container-low dark:hover:bg-surface-container cursor-pointer transition-colors ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                      >
                        <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${iconInfo.color}`}>{iconInfo.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-on-surface truncate">{n.title}</p>
                            {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
                          </div>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">{n.message}</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{n.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="px-4 pt-2 pb-1 border-t border-outline-variant/20 mt-1">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifDropdown(false)}
                  className="block text-center text-xs text-primary font-semibold hover:underline py-1"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface" title="Help & Shortcuts">
          <span className="material-symbols-outlined">help</span>
        </button>

        {/* Profile Avatar with dropdown */}
        <div 
          className="relative" 
          ref={dropdownRef}
        >
          <button
            onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifDropdown(false); }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline-variant hover:border-primary transition-all duration-200 focus:outline-none"
          >
            {user?.avatar ? (
              <img className="w-full h-full object-cover" alt="User Profile" src={user.avatar} />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-sm font-bold ${user?.avatarBg || 'bg-primary text-on-primary'}`}>
                {user?.initials || user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
            )}
          </button>
          
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-surface dark:bg-surface-container border border-outline-variant rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-outline-variant/30">
                <p className="text-sm font-bold text-on-surface leading-tight">{user?.name}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{user?.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wide">{user?.role}</span>
              </div>
              <Link 
                to="/profile" 
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                My Profile
              </Link>
              <Link 
                to="/settings" 
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Settings
              </Link>
              <div className="border-t border-outline-variant/20 mt-1 pt-1">
                <button
                  onClick={() => { logout(); setShowUserDropdown(false); }}
                  className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-error hover:bg-error-container/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
