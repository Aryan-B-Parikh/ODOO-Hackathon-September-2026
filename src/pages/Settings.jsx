import React, { useState } from 'react';

const settingsTabs = [
  { id: 'general', icon: 'tune', label: 'General' },
  { id: 'users', icon: 'group', label: 'Users & Permissions' },
  { id: 'integrations', icon: 'hub', label: 'Integrations' },
  { id: 'notifications', icon: 'notifications_active', label: 'Notifications' },
  { id: 'billing', icon: 'payments', label: 'Billing' },
];

const mockUsers = [
  { name: 'Alex Chen', email: 'alex.chen@assetflow.com', role: 'Admin', status: 'Active', avatarBg: 'bg-blue-100 text-blue-700', initials: 'AC' },
  { name: 'Sarah Jenkins', email: 'sarah.j@assetflow.com', role: 'Manager', status: 'Active', avatarBg: 'bg-purple-100 text-purple-700', initials: 'SJ' },
  { name: 'David Miller', email: 'david.m@assetflow.com', role: 'Auditor', status: 'Active', avatarBg: 'bg-green-100 text-green-700', initials: 'DM' },
  { name: 'Maria Garcia', email: 'maria.g@assetflow.com', role: 'Viewer', status: 'Inactive', avatarBg: 'bg-orange-100 text-orange-700', initials: 'MG' },
];

const integrations = [
  { name: 'Slack', icon: '💬', desc: 'Team notifications and alerts', connected: true },
  { name: 'Google Workspace', icon: '🔵', desc: 'Calendar and drive sync', connected: true },
  { name: 'Jira', icon: '📋', desc: 'Issue tracking and workflows', connected: false },
  { name: 'Salesforce', icon: '☁️', desc: 'CRM asset assignment sync', connected: false },
];

function GeneralPanel() {
  const [orgName, setOrgName] = useState('AssetFlow Corp');
  const [brandColor, setBrandColor] = useState('#004AC6');
  const [timezone, setTimezone] = useState('(GMT-08:00) Pacific Time (US & Canada)');
  const [currency, setCurrency] = useState('USD ($)');

  return (
    <div className="space-y-6">
      {/* Company Branding */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-on-surface mb-6">Company Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Organization Name</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest dark:bg-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface"
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-4 mb-2">Primary Brand Color</label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg border border-outline-variant" style={{ backgroundColor: brandColor }}></div>
                <input
                  className="flex-1 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest dark:bg-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase text-on-surface"
                  type="text"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl p-8 bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <p className="text-sm font-medium mt-4 text-center text-on-surface">Click to upload brand logo</p>
            <p className="text-xs text-on-surface-variant text-center mt-1">PNG, SVG up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-on-surface mb-6">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">System Timezone</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest dark:bg-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface"
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
            >
              <option>(GMT-08:00) Pacific Time (US & Canada)</option>
              <option>(GMT-05:00) Eastern Time (US & Canada)</option>
              <option>(GMT+00:00) London, UTC</option>
              <option>(GMT+01:00) Paris, Berlin</option>
              <option>(GMT+05:30) India Standard Time</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Default Currency</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest dark:bg-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
              <option>INR (₹)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-2">
        <button className="px-8 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all">Discard Changes</button>
        <button className="px-10 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">Save General Settings</button>
      </div>
    </div>
  );
}

function UsersPanel() {
  return (
    <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-on-surface">User Management</h3>
          <p className="text-sm text-on-surface-variant mt-1">Control who can access and manage your assets.</p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Invite User
        </button>
      </div>
      <div className="space-y-3">
        {mockUsers.map((u, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${u.avatarBg}`}>
                {u.initials}
              </div>
              <div>
                <p className="font-semibold text-on-surface">{u.name}</p>
                <p className="text-xs text-on-surface-variant">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{u.role}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.status}</span>
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">more_vert</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsPanel() {
  return (
    <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
      <h3 className="text-xl font-bold text-on-surface mb-2">Integrations</h3>
      <p className="text-sm text-on-surface-variant mb-6">Connect third-party services to streamline your workflow.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((int, i) => (
          <div key={i} className="flex items-center justify-between p-5 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-2xl">{int.icon}</div>
              <div>
                <p className="font-bold text-on-surface">{int.name}</p>
                <p className="text-xs text-on-surface-variant">{int.desc}</p>
              </div>
            </div>
            <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${int.connected ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-primary text-on-primary hover:brightness-110'}`}>
              {int.connected ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const [settings, setSettings] = useState({
    email: true, push: true, sms: false,
    auditAlerts: true, maintenanceDue: true, assetMovement: false, weeklyReport: true,
  });
  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const Toggle = ({ id }) => (
    <button onClick={() => toggle(id)} className={`relative w-12 h-6 rounded-full transition-colors ${settings[id] ? 'bg-primary' : 'bg-outline-variant'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[id] ? 'translate-x-6' : 'translate-x-0'}`}></span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-on-surface mb-6">Notification Channels</h3>
        <div className="space-y-4">
          {[{ id: 'email', label: 'Email Notifications', icon: 'email' }, { id: 'push', label: 'Push Notifications', icon: 'notifications' }, { id: 'sms', label: 'SMS Alerts', icon: 'sms' }].map(ch => (
            <div key={ch.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{ch.icon}</span>
                <span className="font-semibold text-on-surface">{ch.label}</span>
              </div>
              <Toggle id={ch.id} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-on-surface mb-6">Alert Preferences</h3>
        <div className="space-y-4">
          {[
            { id: 'auditAlerts', label: 'Audit Discrepancy Alerts', desc: 'Notify when discrepancies are detected' },
            { id: 'maintenanceDue', label: 'Maintenance Due Reminders', desc: 'Get notified before scheduled maintenance' },
            { id: 'assetMovement', label: 'Asset Movement Events', desc: 'Track when assets change locations' },
            { id: 'weeklyReport', label: 'Weekly Summary Report', desc: 'Receive weekly digest every Monday' },
          ].map(pref => (
            <div key={pref.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/20">
              <div>
                <p className="font-semibold text-on-surface">{pref.label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{pref.desc}</p>
              </div>
              <Toggle id={pref.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Current Plan</p>
            <h3 className="text-3xl font-bold mt-1">Enterprise Pro</h3>
            <p className="text-blue-100 mt-2 text-sm">Unlimited assets · 25 users · Priority support</p>
          </div>
          <span className="material-symbols-outlined text-6xl text-blue-200/30">workspace_premium</span>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-blue-200 text-sm">Next billing date</p>
            <p className="font-bold text-lg">August 1, 2024</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Monthly charge</p>
            <p className="font-bold text-2xl">$499<span className="text-sm font-normal">/mo</span></p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-on-surface mb-6">Payment Method</h3>
        <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 rounded-md bg-blue-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p className="font-semibold text-on-surface">•••• •••• •••• 4242</p>
              <p className="text-xs text-on-surface-variant">Expires 12/2026</p>
            </div>
          </div>
          <button className="text-primary text-sm font-semibold hover:underline">Update</button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralPanel />;
      case 'users': return <UsersPanel />;
      case 'integrations': return <IntegrationsPanel />;
      case 'notifications': return <NotificationsPanel />;
      case 'billing': return <BillingPanel />;
      default: return <GeneralPanel />;
    }
  };

  return (
    <div className="px-8 py-8 max-w-screen-xl mx-auto w-full flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-on-surface">System Settings</h2>
        <p className="text-sm text-on-surface-variant mt-1">Manage your enterprise configurations, user roles, and third-party connections.</p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Vertical Tab Nav */}
        <nav className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto shrink-0">
          {settingsTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all text-left whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
