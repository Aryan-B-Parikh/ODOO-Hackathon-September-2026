import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function AssetDirectory() {
  const {
    assets,
    categories,
    departments,
    addAsset,
    updateAsset,
    deleteAsset,
    updateAssetStatus,
    toggleFavoriteAsset,
    favorites
  } = useContext(AppContext);

  // Search & Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    category: 'All',
    status: 'All',
    condition: 'All',
    location: 'All',
    minCost: '',
    maxCost: ''
  });

  // Sorting
  const [sortField, setSortField] = useState({ field: 'id', order: 'asc' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selection
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  // Column Visibility
  const [visibleCols, setVisibleCols] = useState({
    id: true,
    name: true,
    category: true,
    status: true,
    assignedTo: true,
    location: true,
    condition: true,
    cost: false,
    serialNumber: false,
    lastAudit: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null); // supports editing too!
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Register Asset Form states
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'IT Equipment',
    status: 'Active',
    assignedTo: 'Unassigned',
    serialNumber: '',
    barcode: '',
    qrCode: '',
    purchaseDate: '',
    purchaseCost: '',
    vendor: '',
    warranty: '',
    location: '',
    department: 'None',
    condition: 'Excellent',
    bookable: false,
    customValues: {}
  });

  // File Upload states
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Change category helper to pre-fill dynamic values
  const handleCategoryChange = (catName) => {
    const selectedCat = categories.find(c => c.name === catName);
    const initialCustoms = {};
    if (selectedCat && selectedCat.customFields) {
      selectedCat.customFields.forEach(f => {
        initialCustoms[f.name] = f.type === 'boolean' ? false : '';
      });
    }
    setAssetForm(prev => ({
      ...prev,
      category: catName,
      customValues: initialCustoms
    }));
  };

  // Submit Handler
  const handleSaveAsset = (e) => {
    e.preventDefault();
    if (!assetForm.name) return;

    const payload = {
      ...assetForm,
      avatar: assetForm.assignedTo !== 'Unassigned' ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAb3JSNRiEJXx4US2QdyP_t6zJ1IHL-M2I52CZ-a6sQX_XxRl-OlAQJznE_VNZ-Zf6nUCJUJ2R4yx3g1naGO0UAAJF6HTFekb2H6qPzYhcc9blXxsUI1zuaCRJ0jpzz8NzCRJ1LZAsGSX2ex6x3qcBpfID0i-wLkA8XbyNBTDDJJXlzhD16Wthm_m0UNcpIEEiyhiCr-9zXRjKLItZkpIqnYwpmzlNxTIHOzq0hzxekvOdFlDYDqCuac_XZU4z2uDYUjQDxCJh2Ayq' : '',
      photos: uploadedPhotos,
      documents: uploadedDocs
    };

    if (editingAsset) {
      updateAsset(editingAsset.id, payload);
    } else {
      addAsset(payload);
    }

    // Reset & Close
    setShowAddModal(false);
    setEditingAsset(null);
    setUploadedPhotos([]);
    setUploadedDocs([]);
  };

  // Open Edit Modal
  const handleOpenEdit = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      category: asset.category,
      status: asset.status,
      assignedTo: asset.assignedTo || 'Unassigned',
      serialNumber: asset.serialNumber || '',
      barcode: asset.barcode || '',
      qrCode: asset.qrCode || '',
      purchaseDate: asset.purchaseDate || '',
      purchaseCost: asset.purchaseCost || '',
      vendor: asset.vendor || '',
      warranty: asset.warranty || '',
      location: asset.location || '',
      department: asset.department || 'None',
      condition: asset.condition || 'Excellent',
      bookable: asset.bookable || false,
      customValues: asset.customValues || {}
    });
    setUploadedPhotos(asset.photos || []);
    setUploadedDocs(asset.documents || []);
    setShowAddModal(true);
  };

  const handleOpenAdd = () => {
    setEditingAsset(null);
    setAssetForm({
      name: '',
      category: categories[0]?.name || 'IT Equipment',
      status: 'Active',
      assignedTo: 'Unassigned',
      serialNumber: '',
      barcode: '',
      qrCode: '',
      purchaseDate: '',
      purchaseCost: '',
      vendor: '',
      warranty: '',
      location: '',
      department: 'None',
      condition: 'Excellent',
      bookable: false,
      customValues: {}
    });
    setUploadedPhotos([]);
    setUploadedDocs([]);
    setShowAddModal(true);
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete these ${selectedAssetIds.length} assets?`)) {
      selectedAssetIds.forEach(id => deleteAsset(id));
      setSelectedAssetIds([]);
    }
  };

  const handleBulkStatusChange = (status) => {
    selectedAssetIds.forEach(id => updateAssetStatus(id, status));
    setSelectedAssetIds([]);
  };

  const handleBulkExportCSV = () => {
    const selectedAssets = assets.filter(a => selectedAssetIds.includes(a.id));
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Asset ID,Name,Category,Status,Location,Cost,Serial"].join(",") + "\n"
      + selectedAssets.map(a => `"${a.id}","${a.name}","${a.category}","${a.status}","${a.location || ''}","${a.purchaseCost || ''}","${a.serialNumber || ''}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `assetflow_bulk_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // QR scanner mockup logic
  const handleQRScanClick = () => {
    setShowScanModal(true);
    setScanResult(null);
    setTimeout(() => {
      // Choose a random asset to simulate scan match
      const matched = assets[Math.floor(Math.random() * assets.length)];
      setScanResult(matched);
    }, 2000);
  };

  // Sorting
  const handleSort = (field) => {
    const order = sortField.field === field && sortField.order === 'asc' ? 'desc' : 'asc';
    setSortField({ field, order });
  };

  const getSortedData = (data) => {
    if (!sortField.field) return data;
    return [...data].sort((a, b) => {
      let valA = a[sortField.field] || '';
      let valB = b[sortField.field] || '';
      if (typeof valA === 'string') {
        return sortField.order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortField.order === 'asc' ? valA - valB : valB - valA;
    });
  };

  // Filters & Search
  const getFilteredAssets = () => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        asset.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = advFilters.category === 'All' || asset.category === advFilters.category;
      const matchesStatus = advFilters.status === 'All' || asset.status === advFilters.status;
      const matchesCond = advFilters.condition === 'All' || asset.condition === advFilters.condition;
      const matchesLoc = advFilters.location === 'All' || (asset.location && asset.location.toLowerCase().includes(advFilters.location.toLowerCase()));

      let matchesCost = true;
      const cost = parseFloat(asset.purchaseCost) || 0;
      if (advFilters.minCost && cost < parseFloat(advFilters.minCost)) matchesCost = false;
      if (advFilters.maxCost && cost > parseFloat(advFilters.maxCost)) matchesCost = false;

      return matchesSearch && matchesCat && matchesStatus && matchesCond && matchesLoc && matchesCost;
    });
  };

  const filteredAssets = getFilteredAssets();
  const sortedAssets = getSortedData(filteredAssets);
  const paginatedAssets = sortedAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage) || 1;

  // File Upload Handlers (Simulation)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (type === 'photos') {
      setUploadedPhotos(prev => [...prev, ...files.map(f => f.name)]);
    } else {
      setUploadedDocs(prev => [...prev, ...files.map(f => f.name)]);
    }
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'photos') {
      setUploadedPhotos(prev => [...prev, ...files.map(f => f.name)]);
    } else {
      setUploadedDocs(prev => [...prev, ...files.map(f => f.name)]);
    }
  };

  const selectedCategoryFields = categories.find(c => c.name === assetForm.category)?.customFields || [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Asset Directory</h2>
          <p className="text-sm text-on-surface-variant mt-1">Register, allocate, trace, and manage physical assets globally.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleQRScanClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-container-high border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            QR Scan
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/15 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Register Asset
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Text search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
              placeholder="Search assets by ID, name, serial or assignee..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex gap-2">
            {/* Advanced Toggle */}
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all ${showAdvancedFilters ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant bg-surface-container-low dark:bg-surface-container-high text-on-surface hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
            </button>

            {/* Column visibility */}
            <div className="relative">
              <button 
                onClick={() => setShowColMenu(!showColMenu)}
                className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-surface-container-low dark:bg-surface-container-high rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">view_column</span>
                Columns
              </button>
              {showColMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-surface-container-high border border-outline-variant shadow-xl rounded-xl p-4 z-50 animate-fadeIn">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">Visible Columns</h4>
                  <div className="space-y-2">
                    {Object.keys(visibleCols).map(col => (
                      <label key={col} className="flex items-center gap-3 text-sm text-on-surface cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={visibleCols[col]} 
                          onChange={() => setVisibleCols(prev => ({ ...prev, [col]: !prev[col] }))} 
                          className="rounded border-outline-variant text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                        />
                        <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-3 border-t border-outline-variant/20 animate-slideDown">
            {/* Category */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Category</label>
              <select 
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                value={advFilters.category}
                onChange={e => setAdvFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Status</label>
              <select 
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                value={advFilters.status}
                onChange={e => setAdvFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Decommissioned">Decommissioned</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Condition</label>
              <select 
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                value={advFilters.condition}
                onChange={e => setAdvFilters(prev => ({ ...prev, condition: e.target.value }))}
              >
                <option value="All">All Conditions</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Location</label>
              <input 
                type="text" 
                placeholder="e.g. San Francisco" 
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                value={advFilters.location}
                onChange={e => setAdvFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Price range */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Min Cost ($)</label>
              <input 
                type="number" 
                placeholder="0" 
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                value={advFilters.minCost}
                onChange={e => setAdvFilters(prev => ({ ...prev, minCost: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Max Cost ($)</label>
              <input 
                type="number" 
                placeholder="10000" 
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                value={advFilters.maxCost}
                onChange={e => setAdvFilters(prev => ({ ...prev, maxCost: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions bar (shows only when items are selected) */}
      {selectedAssetIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-primary-container text-on-primary-container rounded-2xl shadow-lg border border-primary/20 animate-scaleUp">
          <span className="font-semibold text-sm mb-2 sm:mb-0">
            {selectedAssetIds.length} assets selected
          </span>
          <div className="flex flex-wrap gap-2.5">
            <button 
              onClick={handleBulkExportCSV}
              className="px-4.5 py-2 bg-white dark:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all"
            >
              Export CSV
            </button>
            
            {/* Quick Status Change */}
            <select 
              onChange={e => handleBulkStatusChange(e.target.value)}
              value=""
              className="px-4.5 py-2 bg-white dark:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface-variant outline-none border border-outline-variant cursor-pointer"
            >
              <option value="" disabled>Change Status...</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>

            <button 
              onClick={handleBulkDelete}
              className="px-4.5 py-2 bg-error text-on-error rounded-xl text-xs font-bold hover:opacity-90 transition-all"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Assets Grid / Table */}
      <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={paginatedAssets.length > 0 && paginatedAssets.every(a => selectedAssetIds.includes(a.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssetIds(prev => [...new Set([...prev, ...paginatedAssets.map(a => a.id)])]);
                      } else {
                        setSelectedAssetIds(prev => prev.filter(id => !paginatedAssets.map(a => a.id).includes(id)));
                      }
                    }}
                    className="rounded border-outline-variant text-primary w-4 h-4 cursor-pointer"
                  />
                </th>
                {visibleCols.id && <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:text-primary transition-colors">Asset ID</th>}
                {visibleCols.name && <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-primary transition-colors">Asset Name</th>}
                {visibleCols.category && <th onClick={() => handleSort('category')} className="p-4 cursor-pointer hover:text-primary transition-colors">Category</th>}
                {visibleCols.status && <th onClick={() => handleSort('status')} className="p-4 cursor-pointer hover:text-primary transition-colors">Status</th>}
                {visibleCols.assignedTo && <th onClick={() => handleSort('assignedTo')} className="p-4 cursor-pointer hover:text-primary transition-colors">Assigned To</th>}
                {visibleCols.location && <th onClick={() => handleSort('location')} className="p-4 cursor-pointer hover:text-primary transition-colors">Location</th>}
                {visibleCols.condition && <th onClick={() => handleSort('condition')} className="p-4 cursor-pointer hover:text-primary transition-colors">Condition</th>}
                {visibleCols.cost && <th onClick={() => handleSort('purchaseCost')} className="p-4 cursor-pointer hover:text-primary transition-colors">Cost</th>}
                {visibleCols.serialNumber && <th onClick={() => handleSort('serialNumber')} className="p-4 cursor-pointer hover:text-primary transition-colors">Serial</th>}
                {visibleCols.lastAudit && <th className="p-4">Last Audit</th>}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">inventory_2</span>
                    No assets found matching the filter criteria.
                  </td>
                </tr>
              ) : paginatedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-surface-container-low/30 transition-colors group text-on-surface">
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedAssetIds.includes(asset.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssetIds(prev => [...prev, asset.id]);
                        } else {
                          setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                        }
                      }}
                      className="rounded border-outline-variant text-primary w-4 h-4 cursor-pointer"
                    />
                  </td>
                  {visibleCols.id && (
                    <td className="p-4 font-bold text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleFavoriteAsset(asset.id)} className="focus:outline-none">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: favorites.includes(asset.id) ? "'FILL' 1" : "'FILL' 0" }}>
                            {favorites.includes(asset.id) ? 'star' : 'star_outline'}
                          </span>
                        </button>
                        {asset.id}
                      </div>
                    </td>
                  )}
                  {visibleCols.name && <td className="p-4 font-semibold">{asset.name}</td>}
                  {visibleCols.category && <td className="p-4 text-xs font-medium text-on-surface-variant">{asset.category}</td>}
                  {visibleCols.status && (
                    <td className="p-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        asset.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' 
                          : asset.status === 'Maintenance'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                  )}
                  {visibleCols.assignedTo && <td className="p-4 font-medium">{asset.assignedTo || 'Unassigned'}</td>}
                  {visibleCols.location && <td className="p-4 text-on-surface-variant">{asset.location || '-'}</td>}
                  {visibleCols.condition && <td className="p-4 text-xs font-medium">{asset.condition || 'Good'}</td>}
                  {visibleCols.cost && <td className="p-4 font-semibold text-xs">${asset.purchaseCost || '0.00'}</td>}
                  {visibleCols.serialNumber && <td className="p-4 text-xs font-mono">{asset.serialNumber || '-'}</td>}
                  {visibleCols.lastAudit && <td className="p-4 text-xs text-on-surface-variant">{asset.lastAudit}</td>}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(asset)} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(asset.id, 'assets')} className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t border-outline-variant/30">
          <span className="text-xs text-on-surface-variant font-medium">Page {currentPage} of {totalPages} ({filteredAssets.length} assets total)</span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3.5 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3.5 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* REGISTER/EDIT ASSET WIZARD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-xl">
                {editingAsset ? 'Edit Asset Configuration' : 'Register New Enterprise Asset'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-6">
              {/* Primary Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Asset Name *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface font-semibold"
                    placeholder="e.g. MacBook Pro M3 Max"
                    value={assetForm.name}
                    onChange={e => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Category *</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={assetForm.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Serial Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface font-mono"
                    placeholder="e.g. SN20938102"
                    value={assetForm.serialNumber}
                    onChange={e => setAssetForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Asset Condition</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={assetForm.condition}
                    onChange={e => setAssetForm(prev => ({ ...prev, condition: e.target.value }))}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              {/* Financial & Warranty Details */}
              <div className="bg-surface-container-low dark:bg-surface-container p-4 rounded-xl border border-outline-variant/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Purchase Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white dark:bg-surface-container text-xs text-on-surface outline-none"
                    value={assetForm.purchaseDate}
                    onChange={e => setAssetForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Purchase Cost ($)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white dark:bg-surface-container text-xs text-on-surface outline-none"
                    value={assetForm.purchaseCost}
                    onChange={e => setAssetForm(prev => ({ ...prev, purchaseCost: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Warranty Expiration</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white dark:bg-surface-container text-xs text-on-surface outline-none"
                    value={assetForm.warranty}
                    onChange={e => setAssetForm(prev => ({ ...prev, warranty: e.target.value }))}
                  />
                </div>
              </div>

              {/* Assignments & Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Department</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={assetForm.department}
                    onChange={e => setAssetForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="None">None</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Location</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    placeholder="e.g. Suite 400"
                    value={assetForm.location}
                    onChange={e => setAssetForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Assigned Employee</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    placeholder="e.g. John Doe"
                    value={assetForm.assignedTo}
                    onChange={e => setAssetForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  />
                </div>
              </div>

              {/* Dynamic custom field inputs based on selected category */}
              {selectedCategoryFields.length > 0 && (
                <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-low dark:bg-surface-container-high/40 space-y-4">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Category Custom Fields</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCategoryFields.map((field) => (
                      <div key={field.name} className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant capitalize">{field.name}{field.required && ' *'}</label>
                        {field.type === 'boolean' ? (
                          <div className="pt-2">
                            <input 
                              type="checkbox"
                              checked={!!assetForm.customValues[field.name]}
                              onChange={e => setAssetForm(prev => ({
                                ...prev,
                                customValues: { ...prev.customValues, [field.name]: e.target.checked }
                              }))}
                              className="rounded border-outline-variant text-primary w-4 h-4 cursor-pointer"
                            />
                          </div>
                        ) : field.type === 'date' ? (
                          <input 
                            type="date"
                            className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-white dark:bg-surface-container text-sm text-on-surface outline-none"
                            value={assetForm.customValues[field.name] || ''}
                            onChange={e => setAssetForm(prev => ({
                              ...prev,
                              customValues: { ...prev.customValues, [field.name]: e.target.value }
                            }))}
                          />
                        ) : field.type === 'number' ? (
                          <input 
                            type="number"
                            className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-white dark:bg-surface-container text-sm text-on-surface outline-none"
                            value={assetForm.customValues[field.name] || ''}
                            onChange={e => setAssetForm(prev => ({
                              ...prev,
                              customValues: { ...prev.customValues, [field.name]: e.target.value }
                            }))}
                          />
                        ) : (
                          <input 
                            type="text"
                            className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-white dark:bg-surface-container text-sm text-on-surface outline-none"
                            value={assetForm.customValues[field.name] || ''}
                            onChange={e => setAssetForm(prev => ({
                              ...prev,
                              customValues: { ...prev.customValues, [field.name]: e.target.value }
                            }))}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookability Flag */}
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="bookable"
                  className="rounded border-outline-variant text-primary w-5 h-5 cursor-pointer"
                  checked={assetForm.bookable}
                  onChange={e => setAssetForm(prev => ({ ...prev, bookable: e.target.checked }))}
                />
                <label htmlFor="bookable" className="font-semibold text-sm text-on-surface select-none cursor-pointer">Allow this asset to be booked/scheduled</label>
              </div>

              {/* drag & drop upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo uploader */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Photos</label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'photos')}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container-high/50'}`}
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-3xl">add_a_photo</span>
                    <p className="text-xs text-on-surface font-semibold mt-2">Drag photos here or click</p>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={e => handleFileSelect(e, 'photos')}
                      className="hidden" 
                      id="photo-input"
                    />
                    <label htmlFor="photo-input" className="text-[10px] text-primary hover:underline mt-1">Select from computer</label>
                  </div>
                  {uploadedPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {uploadedPhotos.map((p, i) => (
                        <span key={i} className="bg-surface-container px-2 py-0.5 rounded text-[10px] flex items-center gap-1 text-on-surface border border-outline-variant/30">
                          {p}
                          <button onClick={() => setUploadedPhotos(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-bold">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Document uploader */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Documents</label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'docs')}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container-high/50'}`}
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-3xl">upload_file</span>
                    <p className="text-xs text-on-surface font-semibold mt-2">Drag files here or click</p>
                    <input 
                      type="file" 
                      multiple 
                      onChange={e => handleFileSelect(e, 'docs')}
                      className="hidden" 
                      id="doc-input"
                    />
                    <label htmlFor="doc-input" className="text-[10px] text-primary hover:underline mt-1">Select from computer</label>
                  </div>
                  {uploadedDocs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {uploadedDocs.map((d, i) => (
                        <span key={i} className="bg-surface-container px-2 py-0.5 rounded text-[10px] flex items-center gap-1 text-on-surface border border-outline-variant/30">
                          {d}
                          <button onClick={() => setUploadedDocs(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-bold">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
                >
                  {editingAsset ? 'Save Configuration' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR SCAN MODAL */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowScanModal(false)}>
          <div className="bg-white dark:bg-surface-container-high border border-outline-variant max-w-md w-full rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low dark:bg-surface-container-high/40">
              <h3 className="font-bold text-on-surface text-lg">QR Code Scan Viewer</h3>
              <button onClick={() => setShowScanModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 flex flex-col items-center justify-center text-center">
              {!scanResult ? (
                <div className="space-y-4">
                  <div className="w-56 h-56 border-4 border-primary rounded-xl relative flex items-center justify-center overflow-hidden bg-surface-container-low dark:bg-surface-container shadow-inner">
                    {/* Simulated laser scan bar */}
                    <div className="absolute w-full h-1 bg-primary left-0 animate-bounce top-1/2 shadow-lg shadow-primary"></div>
                    <span className="material-symbols-outlined text-[72px] text-on-surface-variant/30">qr_code_2</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">Simulating Camera Frame Scanner...</p>
                  <p className="text-xs text-on-surface-variant">Scanning tags in workspace. Focus tag within scan brackets.</p>
                </div>
              ) : (
                <div className="animate-scaleIn w-full space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200 rounded-full flex items-center justify-center border border-green-200 mb-2 mx-auto shadow-sm">
                    <span className="material-symbols-outlined text-[36px]">check_circle</span>
                  </div>
                  <h4 className="font-bold text-on-surface text-lg">Scan Match Found</h4>

                  <div className="bg-surface-container-low dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-4 text-left max-w-xs mx-auto space-y-2 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold font-mono text-xs">{scanResult.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${scanResult.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {scanResult.status}
                      </span>
                    </div>
                    <p className="font-bold text-on-surface">{scanResult.name}</p>
                    <p className="text-xs text-on-surface-variant">Category: {scanResult.category}</p>
                    <p className="text-xs text-on-surface-variant">Location: {scanResult.location || 'HQ'}</p>
                    <p className="text-xs text-on-surface-variant">Serial: {scanResult.serialNumber || 'SN-N/A'}</p>
                  </div>

                  <div className="flex justify-center gap-2 pt-2">
                    <button 
                      onClick={() => { setShowScanModal(false); handleOpenEdit(scanResult); }}
                      className="px-4.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 shadow-md shadow-primary/10"
                    >
                      Configure Asset
                    </button>
                    <button 
                      onClick={() => setShowScanModal(false)}
                      className="px-4.5 py-2 bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold hover:bg-outline-variant"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
