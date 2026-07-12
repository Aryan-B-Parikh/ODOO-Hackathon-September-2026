import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const assignedAssets = [
  {
    id: 'EL-INV-5423',
    model: 'MacBook Pro M3 Max',
    assetCode: 'EL-INV-5423',
    category: 'IT Equipment',
    status: 'IN USE',
    statusBg: 'bg-green-100 text-green-700',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQCEJZ_t_uWP7pTvdWsDXTxu5coFrnNC0NOoyyV40Pv24D-HML9_JJAQVdudsfcBbqhbpagRElC4FO8z5Z2y-PBL-wtWYsUGEjmFRYGujoAZYrp70dr6-K8IGzJPelNNzxWU9pJnyeDR9so7j6IGZVrW-iygliCtknMFdfveLkiSuABAyGlZpqi4uAItsfm171F9i1uWUu8fo8Aj-_1-9LeWQ69vlkxSefgN6FX-3pKiJaeXZjQD9uGb1Z3cZ7POodIaF2uW7GuHeu',
  },
  {
    id: 'EL-AUD-1190',
    model: 'Sony WH-1000XM5',
    assetCode: 'EL-AUD-1190',
    category: 'Peripherals',
    status: 'IN USE',
    statusBg: 'bg-green-100 text-green-700',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvcxSu8csAbk__qE1BoDdSs2YFHC6AHgmung7MxlwOHQWilTBFc6aDlZd-JgGVMDXJV9fTBQzh90C7P3W3jYGt33BzVlirlwABSCQRYHK9z07Wce2586uTfDuVpw4qhEC1oAZB9gT8uSOys3Xwiu6egSv75jnLkTHyOTUbKwiGLUaQjQbgaLkmXkT9ACgkh1HL-rUByXeDeCLJqYxmrwYuwRsmFRk2_knFT2iYWraKnfu6mWh0vEVyA-AcCj2tUvc3OoIhFNKofOKUn',
  },
  {
    id: 'EL-MOB-ME',
    model: 'Shure SM7B Mic',
    assetCode: 'EL-MOB-ME',
    category: 'Audio',
    status: 'IN USE',
    statusBg: 'bg-green-100 text-green-700',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBweA6PiS5AXIJ8Et1UyCMN41SnB6bl3OPVNvJt6o0MY16aSSl-4BWoeSnEhQgMJ3f8GINfHKReDt4Gq8LLxhRhdR2_0kGnXML--ecDDPtn36TpIapvSz822d5XGjCj80m2yoFOrabw2lC98QaXRx5dL5icpzW4ezWVoNdJmtiMCJa3bvQS13QSdhHnl7ztDrqvCh3LFNLX6bsJuXVSMZSQyhXU23LBJMuqsdmg9NqTLzxzsa6MKzYANPi0zG-SP_D-lfqkJcrpuu3e',
  },
  {
    id: 'EL-FUN-CH6',
    model: 'Herman Miller Aeron',
    assetCode: 'EL-FUN-CH6',
    category: 'Furniture',
    status: 'IN USE',
    statusBg: 'bg-green-100 text-green-700',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD48KO0D4VAPfLXArC6JB7hwCA2eW1i6iaFcyAFcWX72joMxvJaV6sHaClw2O4RlKlqZn0FLT-9Q2YnmqdFg8rOOwmyVvLcBK-0BJkYO5XiUsdfjaWX2_I18rCLD0T-X05aW1h9fgA2zUo7t-k1pFQXz4mNQwWvErtPIxJywAXofueOfgqlryWzd_2CrKmScobDbLTa6KIal2vAIoQJeGu-8xFLrhL_CgQircS3Sz_xCIXM9_IT4bkSf3IU_oSO1PbQDH5UWNr0QjZp',
  },
];

const activityItems = [
  { icon: 'inventory_2', iconBg: 'bg-blue-100 text-blue-600', title: 'New Asset Registered', desc: "Added 'Logitech MX Master 3S' to department inventory.", time: 'Today, 11:32 AM' },
  { icon: 'fact_check', iconBg: 'bg-green-100 text-green-600', title: 'Audit Completed', desc: 'Annual Q3 infrastructure audit finalized and signed.', time: 'Today, 09:45 AM' },
  { icon: 'build', iconBg: 'bg-yellow-100 text-yellow-600', title: 'Maintenance Flagged', desc: "Reported battery issues for 'Dell XPS 15 - ID: 21258'.", time: 'Oct 18, 2023' },
  { icon: 'manage_accounts', iconBg: 'bg-purple-100 text-purple-600', title: 'Profile Updated', desc: 'Modified contact phone number and emergency contact.', time: 'Oct 14, 2023' },
];

export default function UserProfile() {
  const { user } = useContext(AppContext);
  const [showAll, setShowAll] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [avatarError, setAvatarError] = useState(false);

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const displayedActivity = showAll ? activityItems : activityItems.slice(0, 3);

  // Use the current user from context, fall back to Elena Vance from the stitch design
  const profileUser = {
    name: user?.name || 'Elena Vance',
    title: 'Senior Operations Manager',
    department: 'Logistics & Assets',
    email: user?.email || 'e.vance@assetflow.corp',
    phone: '+1 (555) 234-8901',
    employeeId: 'AF-9022-LOG',
    avatar: user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUjKLwVTZfQKi3zCZSGsqLNawBVSS-dnT-PfikohHJsyGjoekoqwD6SDCoosY_0WJy8e5JDEOT9e15b6nfBpUhEvEn90p35G_FoLGQqjT-dLDCK25OcMxFdNM0Q5jHuxNqpWAQS5d7TSqfyYnFouV9uAH19qO5P9ChkIo2zmfLnpB2hhrCsDE9J7QuVdNbLwyoXBhWTegBbQ9-ioda4OEXO6iVeEXyYxZiPUw1ICYlx23oIO95n6Dt1RX5U9ySu-v34Lg1lX3R0-_Q',
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-8 max-w-screen-xl mx-auto w-full">
        {/* Profile Header Banner */}
        <section className="mb-10 relative">
          <div className="h-48 w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 mb-[-4rem]"></div>
          <div className="flex flex-col md:flex-row items-end gap-6 px-8">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-surface-container flex items-center justify-center">
                {avatarError ? (
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant">person</span>
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    src={profileUser.avatar}
                    alt={profileUser.name}
                    onError={() => setAvatarError(true)}
                  />
                )}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-primary text-on-primary rounded-full shadow-lg border-2 border-white active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>

            {/* Name and Info */}
            <div className="pb-4 flex-1">
              <h2 className="text-3xl font-bold text-on-surface">{profileUser.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{profileUser.title}</span>
                <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold">Department: {profileUser.department}</span>
                <span className="flex items-center gap-1 text-primary text-sm font-semibold">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Verified Employee
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pb-4 flex gap-3 shrink-0">
              <button className="px-6 py-2.5 bg-surface-container-high text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-highest transition-colors active:scale-95">
                Edit Profile
              </button>
              <button className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
                Share Profile
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-on-surface">Personal Information</h3>
                <span className="material-symbols-outlined text-on-surface-variant">badge</span>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Full Name</label>
                  <p className="text-base font-medium text-on-surface">{profileUser.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Email Address</label>
                  <p className="text-base font-medium text-on-surface">{profileUser.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Phone Number</label>
                  <p className="text-base font-medium text-on-surface">{profileUser.phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Employee ID</label>
                  <div className="flex items-center gap-2">
                    <span className="bg-surface-container-low px-3 py-1 rounded-lg text-primary font-mono text-sm border border-outline-variant/30">{profileUser.employeeId}</span>
                    <button className="p-1 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-blue-50 dark:bg-primary/5 border border-blue-100 dark:border-primary/10 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">security</span>
                <h3 className="text-lg font-bold text-on-surface">Security</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-surface rounded-2xl hover:bg-primary-container hover:text-on-primary transition-all group active:scale-[0.98] shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-primary">password</span>
                    <span className="text-sm font-semibold text-on-surface group-hover:text-on-primary">Change Password</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-on-primary">chevron_right</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-surface rounded-2xl hover:bg-primary-container hover:text-on-primary transition-all group active:scale-[0.98] shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-primary">vibration</span>
                    <span className="text-sm font-semibold text-on-surface group-hover:text-on-primary">Enable 2FA Auth</span>
                  </div>
                  <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold group-hover:bg-on-primary/20 group-hover:text-on-primary">Disabled</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Assigned Assets */}
            <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Assigned Assets</h3>
                  <p className="text-sm text-on-surface-variant">4 items currently in your possession</p>
                </div>
                <button className="text-primary text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-16 h-16 rounded-xl bg-surface-container-low flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/20">
                      {imageErrors[asset.id] ? (
                        <span className="material-symbols-outlined text-2xl text-on-surface-variant">devices</span>
                      ) : (
                        <img 
                          src={asset.image} 
                          alt={asset.model} 
                          className="w-full h-full object-cover" 
                          onError={() => handleImageError(asset.id)} 
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider truncate">{asset.assetCode}</p>
                      <p className="font-bold text-on-surface truncate">{asset.model}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${asset.statusBg}`}>{asset.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-on-surface">Recent Activity</h3>
                <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">more_horiz</span>
                </button>
              </div>
              <div className="space-y-4">
                {displayedActivity.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.iconBg} mt-0.5`}>
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-sm">{item.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-xs text-on-surface-variant whitespace-nowrap shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
              {!showAll && activityItems.length > 3 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mt-6 w-full py-3 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  Load More Activity
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 py-4 px-8 flex items-center justify-between text-xs text-on-surface-variant">
        <span className="font-bold text-primary">AssetFlow</span>
        <span>© 2023 Enterprise Resource Management</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Cookie Settings</a>
        </div>
      </footer>
    </div>
  );
}
