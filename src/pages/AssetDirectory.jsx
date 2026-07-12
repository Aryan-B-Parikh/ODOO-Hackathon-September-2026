import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function AssetDirectory() {
  const { assets, addAsset, searchQuery } = useContext(AppContext);
  
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("Operational Status");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Form states for new asset
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("IT Equipment");
  const [newStatus, setNewStatus] = useState("Active");
  const [newAssigned, setNewAssigned] = useState("");

  const handleRegisterAsset = (e) => {
    e.preventDefault();
    if (!newName) return;

    addAsset({
      name: newName,
      category: newCategory,
      status: newStatus,
      assignedTo: newAssigned || "Unassigned",
      avatar: newAssigned ? "" : "" // MT or IT helper in rendering
    });

    // Reset form
    setNewName("");
    setNewCategory("IT Equipment");
    setNewStatus("Active");
    setNewAssigned("");
    setShowAddModal(false);
  };

  // Simulating a QR Scanner flow
  const handleQRScan = () => {
    setShowScanModal(true);
    setScanResult(null);
    setTimeout(() => {
      // Simulate successful scan after 2 seconds
      const randomAsset = assets[Math.floor(Math.random() * assets.length)];
      setScanResult(randomAsset);
    }, 1800);
  };

  // Apply filters and search query
  const filteredAssets = assets.filter(asset => {
    // Search query match
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter match
    const matchesCategory = 
      selectedCategory === "All Categories" || 
      asset.category === selectedCategory;

    // Status filter match
    const matchesStatus = 
      selectedStatus === "Operational Status" || 
      asset.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-green-100 text-green-700 border border-green-200">Active</span>;
      case 'Maintenance':
        return <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-amber-100 text-amber-700 border border-amber-200">Maintenance</span>;
      case 'Decommissioned':
        return <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Decommissioned</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  const getAvatarColumn = (asset) => {
    if (asset.assignedTo === 'Unassigned') {
      return <span className="text-on-surface-variant italic font-body-md text-body-md">Unassigned</span>;
    }

    if (asset.avatar && asset.avatar.startsWith('http')) {
      return (
        <div className="flex items-center gap-2">
          <img className="w-8 h-8 rounded-full border border-outline-variant object-cover" alt={asset.assignedTo} src={asset.avatar} />
          <span className="font-body-md text-body-md text-on-surface">{asset.assignedTo}</span>
        </div>
      );
    }

    // Default placeholder
    const initials = asset.assignedTo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const bgColor = asset.avatar === 'MT' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container/20 text-primary';
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border border-outline-variant ${bgColor}`}>
          {initials || 'AS'}
        </div>
        <span className="font-body-md text-body-md text-on-surface">{asset.assignedTo}</span>
      </div>
    );
  };

  return (
    <div className="space-y-stack-gap animate-fadeIn relative">
      {/* Hero Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Asset Directory</h2>
          <p className="text-on-surface-variant font-body-md text-body-md">Manage and track your corporate assets across all regions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleQRScan}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-highest text-on-surface rounded-xl font-body-md text-body-md hover:bg-outline-variant transition-all border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>QR Scan</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-body-md text-body-md hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Bento Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 glass-panel p-1.5 rounded-xl flex items-center">
          <select 
            className="w-full bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface focus:outline-none cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option className="bg-surface text-on-surface">All Categories</option>
            <option className="bg-surface text-on-surface">IT Equipment</option>
            <option className="bg-surface text-on-surface">Office Furniture</option>
            <option className="bg-surface text-on-surface">Vehicles</option>
            <option className="bg-surface text-on-surface">Manufacturing</option>
          </select>
        </div>
        <div className="md:col-span-1 glass-panel p-1.5 rounded-xl flex items-center">
          <select 
            className="w-full bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface focus:outline-none cursor-pointer"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option className="bg-surface text-on-surface">Operational Status</option>
            <option className="bg-surface text-on-surface">Active</option>
            <option className="bg-surface text-on-surface">Maintenance</option>
            <option className="bg-surface text-on-surface">Decommissioned</option>
          </select>
        </div>
        <div className="md:col-span-1 glass-panel p-1.5 rounded-xl flex items-center px-4 gap-2">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_today</span>
          <span className="text-body-md text-on-surface-variant whitespace-nowrap">Last 30 Days</span>
        </div>
        <div className="md:col-span-1 flex items-center justify-end gap-2">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Asset ID</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Last Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="px-6 py-4 font-body-md text-body-md text-primary font-bold">{asset.id}</td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface font-semibold">{asset.name}</td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">{asset.category}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(asset.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getAvatarColumn(asset)}
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">{asset.lastAudit}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant text-body-md">
                    No assets match the search query or active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-outline-variant max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-[18px] text-on-surface font-bold">Register New Asset</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleRegisterAsset} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-body-md font-semibold text-on-surface block">Asset Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. MacBook Pro, Conference Desk"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-body-md font-semibold text-on-surface block">Category</label>
                <select 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer text-on-surface"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option>IT Equipment</option>
                  <option>Office Furniture</option>
                  <option>Vehicles</option>
                  <option>Manufacturing</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-body-md font-semibold text-on-surface block">Operational Status</label>
                <select 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer text-on-surface"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option>Active</option>
                  <option>Maintenance</option>
                  <option>Decommissioned</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-body-md font-semibold text-on-surface block">Assigned Staff/Location (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sarah Jenkins, Server Room 1"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newAssigned}
                  onChange={(e) => setNewAssigned(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-surface-container-high rounded-xl text-body-md text-on-surface-variant hover:bg-outline-variant transition-all font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl text-body-md hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 font-semibold"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Scanner Simulation Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-outline-variant max-w-sm w-full rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-[18px] text-on-surface font-bold">QR Code Scanner</h3>
              <button 
                onClick={() => setShowScanModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center text-center">
              {!scanResult ? (
                <>
                  <div className="w-48 h-48 border-4 border-primary rounded-xl relative flex items-center justify-center overflow-hidden mb-6 bg-surface-container-low">
                    {/* Simulated laser scan bar */}
                    <div className="absolute w-full h-1 bg-primary left-0 animate-bounce top-1/2 shadow-lg shadow-primary"></div>
                    <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40">qr_code_2</span>
                  </div>
                  <p className="text-body-md text-on-surface font-bold">Scanning Asset QR Tag...</p>
                  <p className="text-on-surface-variant text-[12px] mt-1">Align barcode or QR inside the camera frame.</p>
                </>
              ) : (
                <div className="animate-scaleIn">
                  <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center border border-green-200 mb-4 mx-auto">
                    <span className="material-symbols-outlined text-[36px]">check_circle</span>
                  </div>
                  <h4 className="font-headline-md text-[18px] text-on-surface font-bold mb-2">Scan Successful</h4>
                  
                  <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 mb-6 text-left max-w-xs mx-auto">
                    <p className="text-primary font-bold text-body-md">{scanResult.id}</p>
                    <p className="text-on-surface font-bold text-body-md mt-1">{scanResult.name}</p>
                    <p className="text-on-surface-variant text-[12px] mt-0.5">{scanResult.category}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-[12px] text-on-surface-variant">Status:</span>
                      {getStatusBadge(scanResult.status)}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowScanModal(false)}
                    className="px-6 py-2 bg-primary text-on-primary rounded-xl text-body-md hover:opacity-90 font-semibold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
