import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function MaintenanceKanban() {
  const { 
    tickets, 
    addTicket, 
    updateTicket, 
    moveTicketColumn, 
    searchQuery,
    users,
    assets,
    addNotification
  } = useContext(AppContext);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form states for new ticket
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newAssigned, setNewAssigned] = useState("Unassigned");
  const [newAssetId, setNewAssetId] = useState("");
  const [newEstimatedCost, setNewEstimatedCost] = useState("0");

  // Detail Modal inline comment state
  const [newComment, setNewComment] = useState("");

  // Kanban Columns
  const columns = [
    { name: "Backlog", title: "Backlog", color: "bg-surface-container/30" },
    { name: "In Progress", title: "In Progress", color: "bg-primary-container/5 border-l-4 border-l-primary" },
    { name: "Review", title: "Review", color: "bg-surface-container/30" },
    { name: "Completed", title: "Completed", color: "bg-surface-container/10" }
  ];

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, ticketId) => {
    e.dataTransfer.setData('text/plain', ticketId);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnName) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');
    if (ticketId) {
      moveTicketColumn(ticketId, columnName);
      addNotification({
        title: "Ticket Status Updated",
        message: `Ticket ${ticketId} moved to ${columnName}.`,
        type: "info"
      });
    }
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const matchedAsset = assets.find(a => a.id === newAssetId);
    const techUser = users.find(u => u.name === newAssigned);

    addTicket({
      title: newTitle,
      priority: newPriority,
      status: "Backlog",
      assignedTo: newAssigned,
      assetId: newAssetId,
      assetName: matchedAsset?.name || 'None',
      estimatedCost: parseFloat(newEstimatedCost) || 0,
      avatar: techUser?.avatar || ''
    });

    addNotification({
      title: "Maintenance Ticket Logged",
      message: `Created ticket: "${newTitle}"`,
      type: "success"
    });

    // Reset Form
    setNewTitle("");
    setNewPriority("Medium");
    setNewAssigned("Unassigned");
    setNewAssetId("");
    setNewEstimatedCost("0");
    setShowAddModal(false);
  };

  // Add Comment inside detail view
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;

    const commentObj = {
      author: users[0]?.name || 'Current User',
      text: newComment.trim(),
      date: new Date().toLocaleString()
    };

    const updatedComments = [...(selectedTicket.comments || []), commentObj];
    updateTicket(selectedTicket.id, { comments: updatedComments });
    
    // Update local state in modal too
    setSelectedTicket(prev => ({
      ...prev,
      comments: updatedComments
    }));
    setNewComment("");
  };

  // Update details from modal
  const handleUpdateTicketDetails = (fields) => {
    if (!selectedTicket) return;
    updateTicket(selectedTicket.id, fields);
    setSelectedTicket(prev => ({ ...prev, ...fields }));
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded-md flex items-center gap-1 border border-error/15">
            <span className="material-symbols-outlined text-[14px]">priority_high</span>
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded-md flex items-center gap-1 border border-tertiary-container/15">
            <span className="material-symbols-outlined text-[14px]">low_priority</span>
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-md flex items-center gap-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
            Low
          </span>
        );
      case 'Done':
      case 'Completed':
        return (
          <span className="px-2 py-0.5 bg-secondary-container/50 text-on-secondary-container text-[10px] font-bold rounded-md flex items-center gap-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Done
          </span>
        );
      default:
        return <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-md">{priority}</span>;
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.priority.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-6">
      {/* Board Toolbar */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Maintenance Board</h2>
          <p className="text-sm text-on-surface-variant mt-1">Track maintenance orders, log technician labor, resolve issues, and monitor costs.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          <span>New Ticket</span>
        </button>
      </section>

      {/* Kanban Board Surface */}
      <section className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 min-h-[550px] items-start min-w-[1000px]">
          {columns.map((col) => {
            const colTickets = filteredTickets.filter(t => t.status === col.name);
            return (
              <div 
                key={col.name}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.name)}
                className={`flex-1 min-w-[240px] flex flex-col rounded-2xl p-4 border border-outline-variant/30 bg-white dark:bg-surface-container shadow-sm`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 border-b border-outline-variant/20 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">{col.title}</h3>
                    <span className="px-2 py-0.5 bg-surface-container-high rounded-full text-[10px] font-bold text-on-surface-variant">
                      {colTickets.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards Container */}
                <div className="space-y-4 flex-1 min-h-[400px]">
                  {colTickets.length > 0 ? (
                    colTickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`bg-surface-container-lowest dark:bg-surface-container-high border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group border-outline-variant`}
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-2.5">
                          {getPriorityBadge(ticket.priority)}
                          <span className="font-mono text-[10px] font-bold text-on-surface-variant">
                            {ticket.id}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-sm text-on-surface mb-2 group-hover:text-primary transition-colors">
                          {ticket.title}
                        </h4>

                        {/* Progress Bar (Visible for In Progress/Backlog/Review) */}
                        {ticket.status !== 'Completed' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-on-surface-variant font-medium">
                                {ticket.progress}% Complete
                              </span>
                            </div>
                            <div className="w-full bg-surface-container rounded-full h-1 overflow-hidden">
                              <div 
                                className="h-1 rounded-full transition-all bg-primary" 
                                style={{ width: `${ticket.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Card Footer */}
                        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20 mt-2 text-xs">
                          <div className="flex items-center gap-2">
                            {ticket.avatar ? (
                              <img className="w-6 h-6 rounded-full object-cover border border-outline-variant/30" alt={ticket.assignedTo} src={ticket.avatar} />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-[8px] font-bold text-on-surface-variant border border-outline-variant">
                                UN
                              </div>
                            )}
                            <span className="font-semibold text-on-surface-variant">
                              {ticket.assignedTo}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-on-surface-variant text-[10px]">
                            {ticket.comments && ticket.comments.length > 0 && (
                              <div className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                                <span>{ticket.comments.length}</span>
                              </div>
                            )}
                            <span className="material-symbols-outlined text-[16px]">attachment</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-on-surface-variant/40 text-xs italic border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-low/50">
                      Drag tickets here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW TICKET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-xl">Create Maintenance Ticket</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Ticket Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Inspect Backup Generator 2"
                  className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Select Asset</label>
                <select 
                  className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                >
                  <option value="">None / Unspecified</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Priority</label>
                  <select 
                    className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Estimated Cost ($)</label>
                  <input 
                    type="number"
                    className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={newEstimatedCost}
                    onChange={e => setNewEstimatedCost(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Assigned Technician</label>
                <select 
                  className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={newAssigned}
                  onChange={(e) => setNewAssigned(e.target.value)}
                >
                  <option value="Unassigned">Unassigned</option>
                  {users.map(u => (
                    <option key={u.email} value={u.name}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAILS MODAL (FULL WORK LOG, COMMENTS, ATTACHMENTS) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-scaleUp" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary font-bold">{selectedTicket.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  selectedTicket.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>{selectedTicket.status}</span>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Properties & Editing */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{selectedTicket.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Asset Ref: {selectedTicket.assetName} ({selectedTicket.assetId || 'N/A'})</p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Technician</label>
                    <select 
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                      value={selectedTicket.assignedTo}
                      onChange={e => handleUpdateTicketDetails({ assignedTo: e.target.value })}
                    >
                      <option value="Unassigned">Unassigned</option>
                      {users.map(u => (
                        <option key={u.email} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Priority</label>
                    <select 
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                      value={selectedTicket.priority}
                      onChange={e => handleUpdateTicketDetails({ priority: e.target.value })}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Labor Hours</label>
                    <input 
                      type="number" 
                      className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                      value={selectedTicket.laborHours || 0}
                      onChange={e => handleUpdateTicketDetails({ laborHours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Est. Cost ($)</label>
                    <input 
                      type="number" 
                      className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                      value={selectedTicket.estimatedCost || 0}
                      onChange={e => handleUpdateTicketDetails({ estimatedCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Actual Cost ($)</label>
                    <input 
                      type="number" 
                      className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                      value={selectedTicket.actualCost || 0}
                      onChange={e => handleUpdateTicketDetails({ actualCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Resolution / Work Log Notes</label>
                  <textarea 
                    rows={3} 
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none resize-none font-medium"
                    placeholder="Log maintenance actions, inspections, or details..."
                    value={selectedTicket.resolutionNotes || ""}
                    onChange={e => handleUpdateTicketDetails({ resolutionNotes: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column: Comments & Attachments */}
              <div className="space-y-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-6">
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    Activity Feed ({selectedTicket.comments?.length || 0})
                  </h4>
                  
                  {/* Comments Log */}
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 text-xs">
                    {!selectedTicket.comments || selectedTicket.comments.length === 0 ? (
                      <p className="text-on-surface-variant italic text-center py-4">No comments logged yet.</p>
                    ) : (
                      selectedTicket.comments.map((comment, index) => (
                        <div key={index} className="bg-surface-container-low dark:bg-surface-container p-2.5 rounded-xl border border-outline-variant/20 space-y-1">
                          <div className="flex justify-between font-bold text-[10px] text-on-surface-variant">
                            <span>{comment.author}</span>
                            <span>{comment.date}</span>
                          </div>
                          <p className="text-on-surface">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment */}
                  <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
                    <input 
                      type="text" 
                      className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none"
                      placeholder="Type a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="bg-primary text-on-primary px-3 rounded-lg text-xs font-bold hover:opacity-90">
                      Send
                    </button>
                  </form>
                </div>

                {/* Attachments Section */}
                <div className="pt-4 border-t border-outline-variant/20">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Attachments</h4>
                  <div className="border border-dashed border-outline-variant rounded-xl p-3 text-center bg-surface-container-low dark:bg-surface-container">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">upload_file</span>
                    <p className="text-[10px] text-on-surface-variant mt-1">Drag files or click to add manuals/receipts</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10"
              >
                Close Ticket details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
