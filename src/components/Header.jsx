import React, { useContext, useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Header() {
  const { searchQuery, setSearchQuery, user, logout } = useContext(AppContext);
  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored === 'dark';
    }
    // No stored preference, use system preference
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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showUserDropdown) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  // Close dropdown on route change
  useEffect(() => {
    setShowUserDropdown(false);
  }, [location]);

  // Apply dark/light mode class based on state
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Set placeholder based on route
  const getSearchPlaceholder = () => {
    switch (location.pathname) {
      case '/assets':
        return "Search assets, IDs, or locations...";
      case '/maintenance':
        return "Search tasks, assets, or technicians...";
      default:
        return "Search anything...";
    }
  };

  const getPageTabs = () => {
    if (location.pathname === '/assets') {
      return (
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-all" href="#overview">Overview</a>
          <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" href="#allocations">Allocations</a>
          <a className="text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-all" href="#reports">Reports</a>
        </nav>
      );
    } else if (location.pathname === '/maintenance') {
      return (
        <nav className="hidden md:flex gap-6">
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-all" href="#overview">Overview</a>
          <a className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1" href="#board">Board</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-all" href="#reports">Reports</a>
        </nav>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-gutter transition-colors duration-300">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
          />
        </div>
        {getPageTabs()}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification button */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors relative text-on-surface-variant">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border border-surface"></span>
        </button>

        {/* Help button */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">help</span>
        </button>
        {/* Dark/Light mode toggle */}
        <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">{isDark ? 'dark_mode' : 'light_mode'}</span>
        </button>

        {/* Profile Avatar with dropdown */}
        <div 
          className="relative" 
          ref={dropdownRef}
          onMouseLeave={() => setShowUserDropdown(false)}
        >
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline-variant hover:border-primary transition-all duration-200 focus:outline-none"
          >
            <img className="w-full h-full object-cover" alt="User Profile" src={user?.avatar} />
          </button>
          
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-outline-variant">
                <p className="text-body-md font-bold text-on-surface leading-tight">{user?.name}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{user?.email}</p>
              </div>
              <Link to="/profile" className="block px-4 py-2 text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                My Profile
              </Link>
              <Link to="/settings" className="block px-4 py-2 text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                Settings
              </Link>
              <button
                onClick={logout}
                className="w-full text-left block px-4 py-2 text-body-md text-error hover:bg-error-container/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
