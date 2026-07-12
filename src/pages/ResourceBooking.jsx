import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function ResourceBooking() {
  const {
    bookings,
    addBooking,
    updateBooking,
    assets,
    user,
    addNotification
  } = useContext(AppContext);

  const [view, setView] = useState('calendar');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form state
  const [form, setForm] = useState({
    resourceId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    recurrence: 'None',
    reminderMinutes: '15',
    purpose: ''
  });

  const bookableAssets = assets.filter(a => a.bookable);

  // Overlap Detection Helper
  const checkOverlap = (resourceId, date, startStr, endStr) => {
    const startNum = parseInt(startStr.replace(':', ''));
    const endNum = parseInt(endStr.replace(':', ''));

    return bookings.some(b => {
      if (b.resourceId !== resourceId || b.status === 'Cancelled') return false;
      
      const bDate = b.startDate.split('T')[0];
      if (bDate !== date) return false;

      const bStartStr = b.startDate.split('T')[1].slice(0, 5);
      const bEndStr = b.endDate.split('T')[1].slice(0, 5);
      
      const bStartNum = parseInt(bStartStr.replace(':', ''));
      const bEndNum = parseInt(bEndStr.replace(':', ''));

      // Check overlap: (StartA < EndB) and (EndA > StartB)
      return startNum < bEndNum && endNum > bStartNum;
    });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!form.resourceId) return;

    const resourceName = assets.find(a => a.id === form.resourceId)?.name || 'Unknown Resource';

    // Conflict Check
    const hasConflict = checkOverlap(form.resourceId, form.date, form.startTime, form.endTime);
    if (hasConflict) {
      alert(`Conflict Detected! ${resourceName} is already booked during this time slot.`);
      addNotification({
        title: "Booking Conflict",
        message: `${resourceName} has an overlapping booking on ${form.date}.`,
        type: "error"
      });
      return;
    }

    const payload = {
      resourceName,
      resourceId: form.resourceId,
      employeeId: user?.email || 'unassigned@assetflow.com',
      employeeName: user?.name || 'Unassigned Staff',
      startDate: `${form.date}T${form.startTime}:00`,
      endDate: `${form.date}T${form.endTime}:00`,
      recurrence: form.recurrence,
      reminderMinutes: parseInt(form.reminderMinutes),
      status: 'Upcoming'
    };

    addBooking(payload);
    addNotification({
      title: "Booking Confirmed",
      message: `${resourceName} successfully scheduled for ${form.date}.`,
      type: "success"
    });

    setShowBookModal(false);
  };

  const handleCancelBooking = (bookingId) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      updateBooking(bookingId, { status: 'Cancelled' });
      addNotification({
        title: "Booking Cancelled",
        message: "Your resource reservation has been cancelled.",
        type: "info"
      });
    }
  };

  // Helper to determine booking status tag style
  const getStatusChip = (status) => {
    switch (status) {
      case 'Upcoming':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Upcoming</span>;
      case 'Ongoing':
        return <span className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Ongoing</span>;
      case 'Completed':
        return <span className="bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Completed</span>;
      case 'Cancelled':
        return <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Resource Booking</h1>
          <p className="text-sm text-on-surface-variant mt-1">Book shared enterprise assets, rooms, or vehicles with automated conflict prevention.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Toggles */}
          <div className="flex items-center bg-surface-container-high rounded-xl p-1 shrink-0">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'calendar' ? 'bg-white dark:bg-surface-container text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              Calendar View
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white dark:bg-surface-container text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[16px]">list</span>
              List View
            </button>
          </div>

          <button
            onClick={() => {
              setForm({
                resourceId: bookableAssets[0]?.id || '',
                date: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                endTime: '10:00',
                recurrence: 'None',
                reminderMinutes: '15',
                purpose: ''
              });
              setShowBookModal(true);
            }}
            disabled={bookableAssets.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Booking
          </button>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bookable Resources', value: bookableAssets.length, icon: 'meeting_room', color: 'text-primary bg-primary/10' },
          { label: 'Upcoming Bookings', value: bookings.filter(b => b.status === 'Upcoming').length, icon: 'schedule', color: 'text-amber-600 bg-amber-100' },
          { label: 'Active Reservations', value: bookings.filter(b => b.status === 'Ongoing').length, icon: 'today', color: 'text-green-600 bg-green-100' },
          { label: 'Cancelled Bookings', value: bookings.filter(b => b.status === 'Cancelled').length, icon: 'cancel', color: 'text-red-600 bg-red-100' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main View Area */}
      {view === 'calendar' ? (
        /* Weekly/Monthly Grid calendar view */
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <h3 className="font-bold text-on-surface text-lg">Calendar Schedule</h3>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
              <span className="text-xs text-on-surface-variant mr-4">Upcoming</span>
              <span className="w-3 h-3 bg-red-400 rounded-full inline-block"></span>
              <span className="text-xs text-on-surface-variant">Cancelled</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Simple grid mockup of a schedule calendar */}
          <div className="grid grid-cols-7 gap-2 min-h-[300px]">
            {Array.from({ length: 28 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-07-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const dayBookings = bookings.filter(b => b.startDate.startsWith(dateStr));
              
              return (
                <div key={i} className="border border-outline-variant/25 rounded-xl p-2 bg-surface-container-low dark:bg-surface-container-high/40 flex flex-col justify-between min-h-[96px] hover:border-primary/50 transition-colors">
                  <span className="font-semibold text-xs text-on-surface-variant text-left">{dayNum}</span>
                  <div className="space-y-1.5 my-2 flex-1 flex flex-col justify-end">
                    {dayBookings.map((b, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedBooking(b)}
                        className={`text-[9px] font-bold p-1 rounded cursor-pointer truncate ${b.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 line-through' : 'bg-primary-container text-on-primary-container border-l-2 border-primary'}`}
                        title={`${b.resourceName} (${b.employeeName})`}
                      >
                        {b.resourceName.slice(0, 10)}...
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List / Table View */
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                  <th className="p-4">ID</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Reserved By</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Recurrence</th>
                  <th className="p-4">Reminder</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-on-surface-variant font-medium">
                      No bookings logged in the system.
                    </td>
                  </tr>
                ) : bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low/30 transition-colors text-on-surface">
                    <td className="p-4 font-mono text-xs font-bold text-on-surface-variant">{b.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-sm">{b.resourceName}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{b.resourceId}</p>
                    </td>
                    <td className="p-4 font-medium">{b.employeeName}</td>
                    <td className="p-4">
                      <p className="font-semibold text-xs">{b.startDate.split('T')[0]}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">
                        {b.startDate.split('T')[1].slice(0, 5)} - {b.endDate.split('T')[1].slice(0, 5)}
                      </p>
                    </td>
                    <td className="p-4 text-xs font-medium text-on-surface-variant">{b.recurrence}</td>
                    <td className="p-4 text-xs text-on-surface-variant">{b.reminderMinutes} mins before</td>
                    <td className="p-4">{getStatusChip(b.status)}</td>
                    <td className="p-4 text-right">
                      {b.status === 'Upcoming' && (
                        <button 
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE BOOKING MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBookModal(false)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-xl">Schedule Resource Booking</h3>
              <button onClick={() => setShowBookModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Select Resource *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface font-semibold"
                  value={form.resourceId}
                  onChange={e => setForm(prev => ({ ...prev, resourceId: e.target.value }))}
                  required
                >
                  <option value="">Choose Resource...</option>
                  {bookableAssets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id}) - {a.location || 'HQ'}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Booking Date *</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Recurrence Pattern</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    value={form.recurrence}
                    onChange={e => setForm(prev => ({ ...prev, recurrence: e.target.value }))}
                  >
                    <option value="None">No Recurrence</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Start Time *</label>
                  <input 
                    type="time"
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface font-mono"
                    value={form.startTime}
                    onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">End Time *</label>
                  <input 
                    type="time"
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface font-mono"
                    value={form.endTime}
                    onChange={e => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Alert Notification Settings</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  value={form.reminderMinutes}
                  onChange={e => setForm(prev => ({ ...prev, reminderMinutes: e.target.value }))}
                >
                  <option value="5">5 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Purpose / Notes</label>
                <textarea 
                  rows={2} 
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface resize-none"
                  placeholder="e.g. Design review presentation or Fleet assignment..."
                  value={form.purpose}
                  onChange={e => setForm(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowBookModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS DIALOG */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-on-surface text-lg">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3.5 text-sm text-on-surface">
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Resource:</span>
                <span className="font-bold">{selectedBooking.resourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Booked By:</span>
                <span className="font-semibold">{selectedBooking.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Schedule:</span>
                <span className="font-semibold">{selectedBooking.startDate.split('T')[0]} ({selectedBooking.startDate.split('T')[1].slice(0, 5)} - {selectedBooking.endDate.split('T')[1].slice(0, 5)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Recurrence:</span>
                <span className="font-semibold">{selectedBooking.recurrence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Reminder Alert:</span>
                <span className="font-semibold">{selectedBooking.reminderMinutes} mins before</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Status:</span>
                {getStatusChip(selectedBooking.status)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30 mt-6">
              {selectedBooking.status === 'Upcoming' && (
                <button 
                  onClick={() => { handleCancelBooking(selectedBooking.id); setSelectedBooking(null); }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:opacity-90"
                >
                  Cancel Reservation
                </button>
              )}
              <button 
                onClick={() => setSelectedBooking(null)}
                className="px-4.5 py-2 bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold hover:bg-outline-variant"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
