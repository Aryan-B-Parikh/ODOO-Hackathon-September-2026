import { useAssets } from '@features/assets/hooks/useAssets';
import { AssetDto, MaintenanceRequestDto } from 'shared/dto';
import { AssetStatus, MaintenanceStatus, MaintenancePriority } from 'shared/enums';

export function DashboardPage() {
  // Fetch assets using React Query for dynamic metrics
  const { data, isLoading } = useAssets({ limit: 10000 });
  
  const assets: AssetDto[] = data?.data || [];
  
  // Mock tickets since maintenance module is pending backend integration
  const tickets: MaintenanceRequestDto[] = [];

  const totalAssetsCount = assets.length;
  const activeAllocationsCount = assets.filter((a: AssetDto) => a.status === AssetStatus.Allocated).length;
  const pendingMaintenanceCount = tickets.filter((t: MaintenanceRequestDto) => t.status !== MaintenanceStatus.Completed).length;
  const criticalAlertsCount = tickets.filter((t: MaintenanceRequestDto) => t.priority === MaintenancePriority.High && t.status !== MaintenanceStatus.Completed).length;

  const categories = {
    "IT Equipment": assets.filter((a: AssetDto) => a.categoryId === "it-equip-id" || (typeof a.categoryId === 'object' && a.categoryId?.name === "IT Equipment")).length,
    "Vehicles": assets.filter((a: AssetDto) => a.categoryId === "vehicles-id" || (typeof a.categoryId === 'object' && a.categoryId?.name === "Vehicles")).length,
    "Office Furniture": assets.filter((a: AssetDto) => a.categoryId === "furniture-id" || (typeof a.categoryId === 'object' && a.categoryId?.name === "Office Furniture")).length,
    "Manufacturing": assets.filter((a: AssetDto) => a.categoryId === "mfg-id" || (typeof a.categoryId === 'object' && a.categoryId?.name === "Manufacturing")).length,
  };

  const recentActivities = [
    {
      id: 1,
      icon: "check_circle",
      iconColor: "text-green-600 bg-green-50 dark:bg-green-900/20",
      title: "MacBook Pro M3 Max Audit Completed",
      desc: "Sarah Jenkins completed weekly self-audit of ASSET-8291.",
      time: "2 hours ago"
    },
    {
      id: 2,
      icon: "warning",
      iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
      title: "Forklift F2 Hydraulic Alert Raised",
      desc: "Automated telemetry reported low pressure in reservoir B.",
      time: "4 hours ago"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Pending Backend Alert */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
        <div className="flex items-center">
          <span className="material-symbols-outlined text-amber-500 mr-2">info</span>
          <p className="text-sm text-amber-700">
            <strong>Backend Pending:</strong> Some dashboard modules (Maintenance, Allocations) are using mock data until backend endpoints are available.
          </p>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Enterprise Overview</h2>
          <p className="text-on-surface-variant text-base">Real-time status of your global asset ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-sm font-medium hover:bg-outline-variant transition-all border border-gray-200 dark:border-gray-800">
            <span className="material-symbols-outlined text-[20px] text-gray-500">calendar_month</span>
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-sm font-medium hover:bg-outline-variant transition-all border border-gray-200 dark:border-gray-800">
            <span className="material-symbols-outlined text-[20px] text-gray-500">download</span>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assets */}
        <div className="bg-white dark:bg-surface-container-lowest p-6 rounded-2xl shadow-sm relative overflow-hidden group border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 rounded-xl">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">+4.2%</span>
          </div>
          <p className="text-gray-500 text-[12px] font-bold uppercase tracking-wider">Total Assets</p>
          <p className="text-3xl text-on-surface mt-1 font-bold">{totalAssetsCount.toLocaleString()}</p>
          <div className="h-8 mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,15 Q25,5 50,15 T100,5" fill="none" stroke="#004ac6" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>

        {/* Active Allocations */}
        <div className="bg-white dark:bg-surface-container-lowest p-6 rounded-2xl shadow-sm relative overflow-hidden group border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 rounded-xl">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_ind</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">+1.8%</span>
          </div>
          <p className="text-gray-500 text-[12px] font-bold uppercase tracking-wider">Active Allocations</p>
          <p className="text-3xl text-on-surface mt-1 font-bold">{activeAllocationsCount.toLocaleString()}</p>
          <div className="h-8 mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 Q25,18 50,10 T100,12" fill="none" stroke="#505f76" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>

        {/* Pending Maintenance */}
        <div className="bg-white dark:bg-surface-container-lowest p-6 rounded-2xl shadow-sm relative overflow-hidden group border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 dark:bg-orange-900/20 rounded-xl">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">-2.4%</span>
          </div>
          <p className="text-gray-500 text-[12px] font-bold uppercase tracking-wider">Pending Maintenance</p>
          <p className="text-3xl text-on-surface mt-1 font-bold">{pendingMaintenanceCount}</p>
          <div className="h-8 mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,5 Q25,15 50,5 T100,10" fill="none" stroke="#943700" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className={`bg-white dark:bg-surface-container-lowest p-6 rounded-2xl shadow-sm relative overflow-hidden group border ${criticalAlertsCount > 0 ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${criticalAlertsCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${criticalAlertsCount > 0 ? 'text-red-600 bg-red-50 border-red-200' : 'text-gray-500 bg-gray-50 border-gray-200 dark:border-gray-700'}`}>
              {criticalAlertsCount > 0 ? 'ACTION REQ.' : 'STABLE'}
            </span>
          </div>
          <p className="text-gray-500 text-[12px] font-bold uppercase tracking-wider">Critical Alerts</p>
          <p className={`text-3xl mt-1 font-bold ${criticalAlertsCount > 0 ? 'text-red-600 animate-pulse' : 'text-on-surface'}`}>{criticalAlertsCount}</p>
          <div className="h-8 mt-4 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,18 L10,15 L20,19 L30,5 L40,15 L50,8 L60,19 L70,3 L80,12 L90,2 L100,10" fill="none" stroke={criticalAlertsCount > 0 ? '#ba1a1a' : '#737686'} strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Distribution Donut */}
        <div className="lg:col-span-4 bg-white dark:bg-surface-container-lowest border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg text-on-surface font-bold mb-4">Distribution by Category</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative py-4">
            {/* Donut Graphic */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="none" r="15.9" stroke="#f3f3fe" strokeWidth="3.8"></circle>
                <circle cx="18" cy="18" fill="none" r="15.9" stroke="#004ac6" strokeDasharray="45 100" strokeLinecap="round" strokeWidth="3.8"></circle>
                <circle cx="18" cy="18" fill="none" r="15.9" stroke="#943700" strokeDasharray="25 100" strokeDashoffset="-45" strokeLinecap="round" strokeWidth="3.8"></circle>
                <circle cx="18" cy="18" fill="none" r="15.9" stroke="#505f76" strokeDasharray="30 100" strokeDashoffset="-70" strokeLinecap="round" strokeWidth="3.8"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-on-surface">{(assets.length).toString()}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Tracking</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="text-gray-600 dark:text-gray-400 truncate">IT: {categories["IT Equipment"]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
              <span className="text-gray-600 dark:text-gray-400 truncate">Vehicles: {categories["Vehicles"]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span className="text-gray-600 dark:text-gray-400 truncate">Furniture: {categories["Office Furniture"]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 border border-gray-400"></span>
              <span className="text-gray-600 dark:text-gray-400 truncate">Mfg: {categories["Manufacturing"]}</span>
            </div>
          </div>
        </div>

        {/* Right Column: System Monitor */}
        <div className="lg:col-span-8 bg-white dark:bg-surface-container-lowest border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
            <h3 className="text-[16px] text-on-surface font-bold">Recent Activity</h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 flex-1 overflow-y-auto max-h-[350px]">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.iconColor} shrink-0`}>
                  <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm text-on-surface font-bold group-hover:text-primary transition-colors leading-tight truncate">{act.title}</h4>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">{act.time}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-[13px] mt-1">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
