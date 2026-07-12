import React from 'react';
import { Link } from 'react-router-dom';

function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed mb-6">{description}</p>
      {action && (
        <Link
          to={action}
          className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

const errorScenarios = [
  {
    type: '404 – Page Not Found',
    code: '404',
    icon: 'search_off',
    color: 'from-blue-50 to-blue-100/50',
    iconColor: 'text-blue-500',
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist or has been moved. Double-check the URL and try again.',
    action: '/dashboard',
    actionLabel: 'Go to Dashboard',
  },
  {
    type: '500 – Server Error',
    code: '500',
    icon: 'cloud_off',
    color: 'from-red-50 to-red-100/50',
    iconColor: 'text-red-500',
    title: 'Internal Server Error',
    description: 'Something went wrong on our end. Our team has been notified. Please try again in a few moments.',
    action: '/dashboard',
    actionLabel: 'Retry',
  },
  {
    type: 'No Data State',
    code: null,
    icon: 'inbox',
    color: 'from-slate-50 to-slate-100/50',
    iconColor: 'text-slate-400',
    title: 'No Assets Found',
    description: 'Your search returned no results. Try adjusting your filters or adding a new asset to get started.',
    action: '/assets',
    actionLabel: 'Add First Asset',
  },
  {
    type: 'No Notifications',
    code: null,
    icon: 'notifications_off',
    color: 'from-green-50 to-green-100/50',
    iconColor: 'text-green-500',
    title: "You're All Caught Up!",
    description: 'No new notifications right now. When something needs your attention, it will appear here.',
    action: null,
    actionLabel: null,
  },
  {
    type: 'Permission Denied',
    code: '403',
    icon: 'lock',
    color: 'from-orange-50 to-orange-100/50',
    iconColor: 'text-orange-500',
    title: 'Access Restricted',
    description: "You don't have permission to view this page. Contact your administrator for access.",
    action: '/dashboard',
    actionLabel: 'Back to Safety',
  },
  {
    type: 'Offline / Network Error',
    code: null,
    icon: 'wifi_off',
    color: 'from-purple-50 to-purple-100/50',
    iconColor: 'text-purple-500',
    title: 'You\'re Offline',
    description: 'Check your internet connection and try again. Changes will be synced when you reconnect.',
    action: null,
    actionLabel: null,
  },
];

export default function ErrorStates() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Error & Empty States</h1>
        <p className="text-sm text-on-surface-variant mt-1">All error pages and empty state designs in one place</p>
      </div>

      {/* Grid of Error/Empty State Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {errorScenarios.map((scenario) => (
          <div key={scenario.type} className={`bg-gradient-to-br ${scenario.color} border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm`}>
            {/* Label */}
            <div className="px-5 pt-4 pb-2 border-b border-outline-variant/20 bg-white/60">
              <div className="flex items-center gap-2">
                {scenario.code && (
                  <span className="text-xs font-mono font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                    HTTP {scenario.code}
                  </span>
                )}
                <span className="text-xs font-semibold text-on-surface-variant">{scenario.type}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className={`material-symbols-outlined text-[32px] ${scenario.iconColor}`}>
                  {scenario.icon}
                </span>
              </div>
              {scenario.code && (
                <p className={`text-5xl font-black mb-2 ${scenario.iconColor} opacity-20`}>{scenario.code}</p>
              )}
              <h3 className="text-base font-bold text-on-surface mb-2">{scenario.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-5 max-w-[220px]">{scenario.description}</p>
              {scenario.action ? (
                <Link
                  to={scenario.action}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95"
                >
                  {scenario.actionLabel}
                </Link>
              ) : (
                <button className="px-4 py-2 bg-white/80 text-on-surface rounded-xl text-xs font-bold border border-outline-variant/30 hover:bg-white transition-all">
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Inline Toast Examples */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-on-surface mb-4">Toast / Alert Variants</h2>
        <div className="space-y-3">
          {[
            { type: 'success', icon: 'check_circle', color: 'bg-green-50 border-green-200 text-green-800', iconColor: 'text-green-600', message: 'Asset successfully transferred to Elena Vance.' },
            { type: 'error', icon: 'error', color: 'bg-red-50 border-red-200 text-red-800', iconColor: 'text-red-600', message: 'Failed to submit transfer request. Please try again.' },
            { type: 'warning', icon: 'warning', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', iconColor: 'text-yellow-600', message: 'Asset is approaching end-of-life. Consider scheduling replacement.' },
            { type: 'info', icon: 'info', color: 'bg-blue-50 border-blue-200 text-blue-800', iconColor: 'text-blue-600', message: 'Scheduled maintenance for HVAC Unit 4 starts tomorrow at 9 AM.' },
          ].map((alert) => (
            <div key={alert.type} className={`flex items-center gap-3 p-4 rounded-xl border ${alert.color}`}>
              <span className={`material-symbols-outlined text-[20px] ${alert.iconColor} shrink-0`}>{alert.icon}</span>
              <p className="text-sm font-semibold flex-1">{alert.message}</p>
              <button className="shrink-0 opacity-60 hover:opacity-100">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
