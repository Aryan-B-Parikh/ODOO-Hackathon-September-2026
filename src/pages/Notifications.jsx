import React, { useState } from 'react';

const allNotifications = [
  {
    id: 1, type: 'alert', icon: 'warning', iconBg: 'bg-red-100 text-red-600',
    title: 'Maintenance Overdue', body: 'Generator weekly test on ASSET-5561 is 3 days overdue.',
    time: '10 mins ago', read: false, category: 'Maintenance',
  },
  {
    id: 2, type: 'info', icon: 'swap_horiz', iconBg: 'bg-blue-100 text-blue-600',
    title: 'Transfer Approved', body: 'Your request ALT-002 for Tesla Model 3 has been approved by admin.',
    time: '1 hour ago', read: false, category: 'Transfers',
  },
  {
    id: 3, type: 'success', icon: 'fact_check', iconBg: 'bg-green-100 text-green-600',
    title: 'Audit Complete', body: 'Q3 Infrastructure audit has been finalized and signed by Elena Vance.',
    time: '3 hours ago', read: false, category: 'Audit',
  },
  {
    id: 4, type: 'info', icon: 'inventory_2', iconBg: 'bg-purple-100 text-purple-600',
    title: 'New Asset Registered', body: 'Logitech MX Master 3S (ID: PER-MOU-2934) added to IT inventory.',
    time: 'Yesterday, 4:20 PM', read: true, category: 'Assets',
  },
  {
    id: 5, type: 'alert', icon: 'calendar_month', iconBg: 'bg-orange-100 text-orange-600',
    title: 'Booking Conflict Detected', body: 'Conference Room A has overlapping bookings on Jul 16.',
    time: 'Yesterday, 2:10 PM', read: true, category: 'Bookings',
  },
  {
    id: 6, type: 'success', icon: 'person_add', iconBg: 'bg-cyan-100 text-cyan-600',
    title: 'New Employee Onboarded', body: 'Jordan Smith joined Manufacturing dept. 3 assets auto-allocated.',
    time: 'Jul 10, 2026', read: true, category: 'Organization',
  },
  {
    id: 7, type: 'info', icon: 'build', iconBg: 'bg-yellow-100 text-yellow-600',
    title: 'Scheduled Maintenance', body: 'HVAC Unit 4 filter replacement scheduled for Jul 18, 2026.',
    time: 'Jul 9, 2026', read: true, category: 'Maintenance',
  },
  {
    id: 8, type: 'alert', icon: 'report', iconBg: 'bg-red-100 text-red-600',
    title: 'Asset Malfunction Reported', body: 'Battery failure on Dell XPS 15 – ID: ASSET-2209, flagged for repair.',
    time: 'Jul 8, 2026', read: true, category: 'Maintenance',
  },
];

const CATEGORIES = ['All', 'Maintenance', 'Transfers', 'Audit', 'Assets', 'Bookings', 'Organization'];

export default function Notifications() {
  const [notifications, setNotifications] = useState(allNotifications);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filtered = notifications.filter(n =>
    (activeCategory === 'All' || n.category === activeCategory) &&
    (!showUnreadOnly || !n.read)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-error text-on-error text-xs font-bold px-2.5 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1">Stay updated with all system events and activities</p>
        </div>
        <div className="flex items-center gap-3">
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
                : 'bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
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
          filtered.map((n) => (
            <div
              key={n.id}
              className={`bg-white border rounded-2xl p-4 flex items-start gap-4 transition-all group ${
                !n.read ? 'border-primary/30 bg-primary/[0.02]' : 'border-outline-variant/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.iconBg}`}>
                <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold text-on-surface ${!n.read ? '' : 'font-semibold'}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">{n.body}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mark as read"
                      >
                        <span className="material-symbols-outlined text-[14px]">done</span>
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(n.id)}
                      className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Dismiss"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-on-surface-variant">{n.time}</span>
                  <span className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">{n.category}</span>
                </div>
              </div>
            </div>
          ))
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
