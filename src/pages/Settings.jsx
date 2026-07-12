import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';


const settingsTabs = [
  { id: 'general', icon: 'tune', label: 'General' },
  { id: 'users', icon: 'group', label: 'Users & Permissions' },
  { id: 'integrations', icon: 'hub', label: 'Integrations' },
  { id: 'notifications', icon: 'notifications_active', label: 'Notifications' },
  { id: 'billing', icon: 'payments', label: 'Billing' },
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
  const { users, signup, deleteUser, updateUser } = useContext(AppContext);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Employee',
    phone: '',
    status: 'Active',
    secondAdminSignature: ''
  });

  const handleOpenInvite = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', role: 'Employee', phone: '', status: 'Active', secondAdminSignature: '' });
    setError('');
    setShowInviteModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, phone: u.phone || '', status: u.status || 'Active', secondAdminSignature: '' });
    setError('');
    setShowInviteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setError('');

    try {
      if (editingUser) {
        await updateUser(editingUser.email, form);
      } else {
        await signup({
          name: form.name,
          email: form.email,
          password: 'password123',
          role: form.role,
          phone: form.phone,
          status: form.status
        });
      }
      setShowInviteModal(false);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const handleDelete = (email) => {
    if (confirm(`Are you sure you want to remove user ${email}?`)) {
      deleteUser(email);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-on-surface">User Management</h3>
          <p className="text-sm text-on-surface-variant mt-1">Control who can access and manage your assets.</p>
        </div>
        <button 
          onClick={handleOpenInvite}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Invite User
        </button>
      </div>
      <div className="space-y-3">
        {users.map((u, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low dark:hover:bg-surface-container/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${u.avatarBg || 'bg-primary/10 text-primary'}`}>
                {u.initials || u.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-on-surface">{u.name}</p>
                <p className="text-xs text-on-surface-variant">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-3 py-1 rounded-full">{u.role}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-gray-100 text-gray-500'}`}>{u.status}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(u)} className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors" title="Edit User">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button onClick={() => handleDelete(u.email)} className="p-1.5 hover:bg-error-container/20 rounded-lg text-error transition-colors" title="Remove User">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-lg">
                {editingUser ? 'Edit User Configuration' : 'Invite New Team Member'}
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-error-container text-error rounded-xl text-xs font-semibold border border-error/20 flex items-start gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Work Email *</label>
                <input 
                  type="email" 
                  required
                  disabled={!!editingUser}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface disabled:opacity-50"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Assigned Role</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface cursor-pointer"
                  value={form.role}
                  onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="Admin">Admin</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Employee">Employee</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              {form.role === 'Admin' && editingUser?.role !== 'Admin' && (
                <div className="p-3.5 bg-error-container/5 rounded-xl border border-error/20 space-y-2 animate-fadeIn">
                  <label className="text-xs font-bold uppercase tracking-wider text-error block">Co-signing Admin Email *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="secondary-admin@company.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-error/50 bg-white dark:bg-surface-container text-sm focus:ring-2 focus:ring-error/20 outline-none text-on-surface"
                    value={form.secondAdminSignature || ''}
                    onChange={e => setForm(prev => ({ ...prev, secondAdminSignature: e.target.value }))}
                  />
                  <p className="text-[10px] leading-relaxed text-on-surface-variant">
                    ⚠️ <strong>Dual-Authorization Policy:</strong> Promoting any member to Administrator requires co-signature verification from an active secondary Administrator. An email audit notification will be dispatched.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">User Status</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface cursor-pointer"
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10"
                >
                  {editingUser ? 'Save Changes' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  const { apiCall } = useContext(AppContext);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPrefs = async () => {
      try {
        const data = await apiCall('/auth/preferences');
        if (active) {
          setPreferences(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch preferences:', err);
      }
    };
    fetchPrefs();
    return () => { active = false; };
  }, []);

  const toggleChannel = async (type, channel) => {
    const updated = preferences.map(p => {
      if (p.notificationType === type) {
        return { ...p, [channel]: !p[channel] };
      }
      return p;
    });
    setPreferences(updated);

    try {
      await apiCall('/auth/preferences', {
        method: 'POST',
        body: JSON.stringify({
          preferences: updated.map(p => ({
            type: p.notificationType,
            channelEmail: p.channelEmail,
            channelPush: p.channelPush,
            channelInApp: p.channelInApp
          }))
        })
      });
    } catch (err) {
      console.error('Failed to update preference:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-on-surface mb-2">Notification Preferences</h3>
        <p className="text-sm text-on-surface-variant mb-6">Manage notification delivery channels across system modules.</p>
        <div className="space-y-4">
          {preferences.map(pref => (
            <div key={pref.id} className="p-5 rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-on-surface text-sm uppercase tracking-wider">{pref.notificationType}</p>
                <p className="text-xs text-on-surface-variant mt-1">Configure notification channels for this type.</p>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Email</span>
                  <button 
                    onClick={() => toggleChannel(pref.notificationType, 'channelEmail')} 
                    className={`relative w-10 h-5 rounded-full transition-colors ${pref.channelEmail ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.channelEmail ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Push</span>
                  <button 
                    onClick={() => toggleChannel(pref.notificationType, 'channelPush')} 
                    className={`relative w-10 h-5 rounded-full transition-colors ${pref.channelPush ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.channelPush ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">In-App</span>
                  <button 
                    onClick={() => toggleChannel(pref.notificationType, 'channelInApp')} 
                    className={`relative w-10 h-5 rounded-full transition-colors ${pref.channelInApp ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.channelInApp ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>
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
