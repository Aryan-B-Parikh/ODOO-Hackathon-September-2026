import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const CATEGORIES = ['All', 'Maintenance', 'Transfers', 'Audit', 'Assets', 'Bookings', 'Organization'];

const ICON_BY_TYPE = {
  success: { icon: 'check_circle', bg: 'bg-green-100 text-green-600' },
  error: { icon: 'warning', bg: 'bg-red-100 text-red-600' },
  warning: { icon: 'report_problem', bg: 'bg-orange-100 text-orange-600' },
  info: { icon: 'info', bg: 'bg-blue-100 text-blue-600' },
};

export default function Notifications() {
  const {
    notifications,
    markNotificationRead,
    clearNotifications,
    addNotification
  } = useContext(AppContext);

  const [activeCategory, setActiveCategory] = useState('All');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const dismiss = (id) => {
    // Filter from local context
    markNotificationRead(id);
  };

  const filtered = notifications.filter(n =>
    (activeCategory === 'All' || n.category === activeCategory) &&
    (!showUnreadOnly || !n.read)
  );

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto w-full px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-on-surface">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-error text-on-error text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">{unreadCount} new</span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1">Stay updated with all system events and activities</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Unread toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${showUnreadOnly ? 'bg-primary' : 'bg-surface-container-high'}`}
              onClick={() => setShowUnreadOnly(p => !p)}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${showUnreadOnly ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-on-surface-variant font-semibold">Unread only</span>
          </label>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-primary font-semibold hover:underline"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-sm text-red-500 font-semibold hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-primary text-on-primary'
                : 'bg-white dark:bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">notifications_off</span>
            </div>
            <p className="font-semibold text-on-surface">No notifications</p>
            <p className="text-sm text-on-surface-variant mt-1">You're all caught up!</p>
          </div>
        ) : (
          filtered.map((n) => {
            const iconConfig = ICON_BY_TYPE[n.type] || ICON_BY_TYPE.info;
            return (
              <div
                key={n.id}
                className={`bg-white dark:bg-surface-container border rounded-2xl p-4 flex items-start gap-4 transition-all group hover:shadow-sm ${
                  !n.read ? 'border-primary/30 bg-primary/[0.02] dark:bg-primary/5' : 'border-outline-variant/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
                  <span className="material-symbols-outlined text-[20px]">{iconConfig.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold text-on-surface ${!n.read ? '' : 'font-semibold'}`}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse" />}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Mark as read"
                        >
                          <span className="material-symbols-outlined text-[14px]">done</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-on-surface-variant">{n.timestamp}</span>
                    {n.category && (
                      <span className="text-[10px] bg-surface-container dark:bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">{n.category}</span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      n.type === 'success' ? 'bg-green-100 text-green-700' :
                      n.type === 'error' ? 'bg-red-100 text-red-700' :
                      n.type === 'warning' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{n.type?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <div className="text-center">
          <button className="text-sm text-on-surface-variant hover:text-primary font-semibold transition-colors">
            Load older notifications
          </button>
        </div>
      )}
    </div>
  );
}
