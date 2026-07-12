import { useAuth } from '@features/auth/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';


export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = 0;

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowUserDropdown(false);
    setShowNotifDropdown(false);
  }, [location]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setTimeout(() => {
          const el = document.getElementById('global-search-input');
          if (el) el.focus();
        }, 50);
      }
      if (e.key === 'Escape') {
        setShowUserDropdown(false);
        setShowNotifDropdown(false);
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

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/80 dark:bg-surface-container/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-8 transition-colors duration-300">
      {/* Left: Search */}
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md group" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
          <input
            id="global-search-input"
            className="w-full bg-surface-container-low dark:bg-surface-container border-none rounded-full pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface placeholder:text-gray-500"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => {
              if (e.target.value) {
                searchParams.set('q', e.target.value);
              } else {
                searchParams.delete('q');
              }
              setSearchParams(searchParams);
            }}
            type="text"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 bg-surface-container border border-gray-300 dark:border-gray-700 px-1.5 py-0.5 rounded-md hidden md:block pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors text-gray-500 hover:text-on-surface"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined transition-transform duration-300">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {/* Notification Bell with live count badge */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowUserDropdown(false); }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors relative text-gray-500 hover:text-on-surface"
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-surface animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Help */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors text-gray-500 hover:text-on-surface" title="Help & Shortcuts">
          <span className="material-symbols-outlined">help</span>
        </button>

        {/* Profile Avatar with dropdown */}
        <div 
          className="relative" 
          ref={dropdownRef}
        >
          <button
            onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifDropdown(false); }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-200 focus:outline-none"
          >
            <div className={`w-full h-full flex items-center justify-center text-sm font-bold bg-primary text-white`}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </button>
          
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-surface dark:bg-surface-container border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-bold text-on-surface leading-tight">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{user?.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wide">{user?.role}</span>
              </div>
              <Link 
                to="/app/profile" 
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                My Profile
              </Link>
              <Link 
                to="/settings" 
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Settings
              </Link>
              <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                <button
                  onClick={() => { logout(); setShowUserDropdown(false); }}
                  className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
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
