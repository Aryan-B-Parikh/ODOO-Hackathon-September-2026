import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function MaintenanceKanban() {
  const { tickets, addTicket, moveTicketColumn, searchQuery } = useContext(AppContext);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states for new ticket
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newAssigned, setNewAssigned] = useState("Unassigned");

  // Kanban Columns
  const columns = [
    { name: "Backlog", title: "Backlog", color: "bg-surface-container/30" },
    { name: "In Progress", title: "In Progress", color: "bg-primary-container/5" },
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
    }
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    addTicket({
      title: newTitle,
      priority: newPriority,
      status: "Backlog",
      assignedTo: newAssigned,
      avatar: newAssigned !== "Unassigned" ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDt7tL9ibZBz8c0A5CvVnksjhaHMzqPezM-2YeZud_qzNvuDVgTjsXUwqIEpQubRmPDIU39Era0vinxxkKnRRKiicjCYE6rCayZf4ZseJnu1u4mVsRcA4z3Z1ppeTwlMjUop1LMLJXKDa_YjLJEdZPEymiKj67CUkUECAhnZU9mxV2OBWddyiCNbX7aiApVAZ8d3jw2Q0RCsT7hG5_7X5J59rWoZ8z7skHh7fPaUtGH9rhIXeJct0d2NvQ5D10LxJ8E02JpyEM4nxXB" : ""
    });

    // Reset Form
    setNewTitle("");
    setNewPriority("Medium");
    setNewAssigned("Unassigned");
    setShowAddModal(false);
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

  // Filter tickets by search query
  const filteredTickets = tickets.filter(t => {
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.priority.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col space-y-stack-gap animate-fadeIn">
      {/* Board Toolbar */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Maintenance Board</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-200 overflow-hidden" title="Alex Rivera">
                <img className="w-full h-full object-cover" alt="Alex Rivera" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3EJztPAmwgCdk6DfbHF8CmG-JdrvP2vxAsI2WhERYmNhq1OCA72tC4ILCh1_i_nSp9wU8AzpsDCw7sGHvpJAnlt6Onzv5G7bEsSuXrlp6xBpronQ6VfSip5jNQyWergFEB0Wm20dsumsBBYCpnYP3VNpjYmWnQwNan5TPJGA2VHpoSkPbXSlCdlvF-ldr2x9PiT5zzmC0jQarO192DntYgzg9NQQ70WWDl04DM54Xtt2mogcc9OAtVJpooWV21EHeKR8fGiXjQTut" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-200 overflow-hidden" title="Jordan Smith">
                <img className="w-full h-full object-cover" alt="Jordan Smith" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvcxSu8csAbk__qE1BoDdSs2YFHC6AHgmung7MxlwOHQWilTBFc6aDlZd-JgGVMDXJV9fTBQzh90C7P3W3jYGt33BzVlirlwABSCQRYHK9z07Wce2586uTfDuVpw4qhEC1oAZB9gT8uSOys3Xwiu6egSv75jnLkTHyOTUbKwiGLUaQjQbgaLkmXkT9ACgkh1HL-rUByXDeCLJqYxmrwYuwRsmFRk2_knFT2iYWraKnfu6mWh0vEVyA-AcCj2tUvc3OoIhFNKofOKUn" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-200 overflow-hidden" title="Sam Chen">
                <img className="w-full h-full object-cover" alt="Sam Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW6n3gOoyXFrvdQDZw8W5AzDjAFStj-81SuhQzkmz57fjAg7qbeBwP8ZXIoZHhcu-n0o7wic_nkpGhteZKWJ2qNDOVtSpPPnjRTvsunOYgC-p36L5nv_iuDeBylzTfAO4ls-dwrKaAqjHu1AHnF0vxBG6aQuoUPF4VXIinEkyFg92mW589ufG6X6kC-WJ9vBvfM_EI2zRtsZNMMXfB_2aKX6b2nIfDe2mjmPvyO3WVyBqDGSA9qdEM1h2Ctunxnt78Iev031hnWeKG" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container text-on-primary flex items-center justify-center text-[10px] font-bold">
                +12
              </div>
            </div>
            <span className="h-4 w-px bg-outline-variant/50"></span>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-high rounded-lg text-body-md text-on-surface-variant hover:bg-outline-variant transition-all">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                <span>Priority</span>
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-high rounded-lg text-body-md text-on-surface-variant hover:bg-outline-variant transition-all">
                <span className="material-symbols-outlined text-[18px]">category</span>
                <span>Asset Type</span>
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-body-lg text-body-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold"
        >
          <span className="material-symbols-outlined">add</span>
          <span>New Ticket</span>
        </button>
      </section>

      {/* Kanban Board Surface */}
      <section className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full min-h-[550px] items-start min-w-[950px]">
          {columns.map((col) => {
            const colTickets = filteredTickets.filter(t => t.status === col.name);
            return (
              <div 
                key={col.name}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.name)}
                className={`flex-1 min-w-[240px] flex flex-col h-full rounded-2xl p-4 border border-outline-variant/30 ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-bold">{col.title}</h3>
                    <span className="px-2.5 py-0.5 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant">
                      {colTickets.length}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-surface-container-high rounded transition-all text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                  </button>
                </div>

                {/* Column Cards Container */}
                <div className="space-y-4 flex-1 overflow-y-auto pr-1 pb-6 max-h-[500px] custom-scrollbar">
                  {colTickets.length > 0 ? (
                    colTickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-surface-container-lowest border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing group ${
                          ticket.status === 'In Progress' 
                            ? 'border-primary/20 border-l-4 border-l-primary' 
                            : 'border-outline-variant'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-2.5">
                          {getPriorityBadge(ticket.priority)}
                          <span className={`font-label-caps text-[10px] font-bold ${
                            ticket.status === 'In Progress' ? 'text-primary' : 'text-outline'
                          }`}>
                            {ticket.id}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-body-md text-body-md text-on-surface mb-3 group-hover:text-primary transition-colors font-semibold">
                          {ticket.title}
                        </h4>

                        {/* Progress Bar (Visible for In Progress/Backlog/Review) */}
                        {ticket.status !== 'Completed' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-bold ${ticket.status === 'In Progress' ? 'text-primary' : 'text-outline'}`}>
                                {ticket.progress}% Complete
                              </span>
                              <span className="text-[10px] text-outline font-medium">{ticket.due}</span>
                            </div>
                            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  ticket.status === 'In Progress' ? 'bg-primary' : 'bg-outline-variant'
                                }`} 
                                style={{ width: `${ticket.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Card Footer */}
                        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20 mt-2">
                          <div className="flex items-center gap-2">
                            {ticket.avatar ? (
                              <div className={`w-6 h-6 rounded-full overflow-hidden ${
                                ticket.status === 'In Progress' ? 'ring-2 ring-primary/20' : ''
                              }`}>
                                <img className="w-full h-full object-cover" alt={ticket.assignedTo} src={ticket.avatar} />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-[8px] font-bold text-on-surface-variant border border-outline-variant">
                                UN
                              </div>
                            )}
                            <span className={`text-[11px] font-semibold ${
                              ticket.status === 'In Progress' ? 'text-primary' : 'text-on-surface-variant'
                            }`}>
                              {ticket.assignedTo}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Actions on Card */}
                            {ticket.status === 'Review' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTicketColumn(ticket.id, 'Completed');
                                }}
                                className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded hover:bg-primary/20 transition-all"
                              >
                                Approve
                              </button>
                            )}
                            
                            {ticket.comments > 0 && (
                              <div className="flex items-center gap-0.5 text-outline">
                                <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                                <span className="text-[10px] font-bold">{ticket.comments}</span>
                              </div>
                            )}
                            <span className="material-symbols-outlined text-[16px] text-outline">attachment</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-on-surface-variant/50 text-[12px] italic border-2 border-dashed border-outline-variant/30 rounded-xl">
                      Empty column.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Column Placeholder */}
          <button className="flex flex-col items-center justify-center min-w-[150px] h-[300px] border-2 border-dashed border-outline-variant/50 rounded-2xl text-outline hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group">
            <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">add_circle</span>
            <span className="font-label-caps text-[10px] mt-2 font-bold uppercase tracking-widest">Add Column</span>
          </button>
        </div>
      </section>

      {/* New Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-outline-variant max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-[18px] text-on-surface font-bold">New Ticket</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-body-md font-semibold text-on-surface block">Ticket Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Inspect Backup Generator 2"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-body-md font-semibold text-on-surface block">Priority</label>
                <select 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer text-on-surface"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-body-md font-semibold text-on-surface block">Assigned Technician</label>
                <select 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer text-on-surface"
                  value={newAssigned}
                  onChange={(e) => setNewAssigned(e.target.value)}
                >
                  <option>Unassigned</option>
                  <option>Alex Rivera</option>
                  <option>Jordan Smith</option>
                  <option>Sam Chen</option>
                  <option>Maria G.</option>
                </select>
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
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
