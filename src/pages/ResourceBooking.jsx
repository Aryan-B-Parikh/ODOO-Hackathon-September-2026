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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 12)); // Defaults to July 12, 2026
  const [calendarSubView, setCalendarSubView] = useState('Month'); // Month, Week, Day

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

  // Date Navigation Handlers
  const handlePrev = () => {
    const newD = new Date(currentDate);
    if (calendarSubView === 'Month') {
      newD.setMonth(currentDate.getMonth() - 1);
    } else if (calendarSubView === 'Week') {
      newD.setDate(currentDate.getDate() - 7);
    } else if (calendarSubView === 'Day') {
      newD.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newD);
  };

  const handleNext = () => {
    const newD = new Date(currentDate);
    if (calendarSubView === 'Month') {
      newD.setMonth(currentDate.getMonth() + 1);
    } else if (calendarSubView === 'Week') {
      newD.setDate(currentDate.getDate() + 7);
    } else if (calendarSubView === 'Day') {
      newD.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newD);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 6, 12)); // July 12, 2026
  };

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
      startDate: `${form.date}T${form.startTime}:00Z`,
      endDate: `${form.date}T${form.endTime}:00Z`,
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
        /* Weekly/Monthly/Daily Grid calendar view */
        <div className="bg-white dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          {/* Sub-view headers & Navigation Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-surface-container-high hover:bg-outline-variant transition-colors flex items-center justify-center border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button 
                onClick={handleToday}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-xs font-bold hover:bg-outline-variant transition-colors border border-outline-variant/30 text-on-surface"
              >
                Today
              </button>
              <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-xl bg-surface-container-high hover:bg-outline-variant transition-colors flex items-center justify-center border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
              <h2 className="font-bold text-on-surface text-lg ml-2">
                {calendarSubView === 'Month' && currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                {calendarSubView === 'Week' && `Week of ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString('default', { month: 'short', day: 'numeric' })}, ${currentDate.getFullYear()}`}
                {calendarSubView === 'Day' && currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container-high rounded-xl p-1 shrink-0 self-stretch md:self-auto justify-between">
              {['Month', 'Week', 'Day'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCalendarSubView(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${calendarSubView === type ? 'bg-white dark:bg-surface-container text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Render Month View */}
          {calendarSubView === 'Month' && (() => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
            const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0, Sun = 6

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>

                <div className="grid grid-cols-7 gap-2 min-h-[350px]">
                  {/* Empty cells before month start */}
                  {Array.from({ length: offset }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="rounded-xl bg-surface-container-low/20 border border-transparent min-h-[96px]" />
                  ))}

                  {/* Calendar Days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const dayBookings = bookings.filter(b => b.startDate.startsWith(dateStr));

                    return (
                      <div 
                        key={`day-${dayNum}`}
                        onClick={() => {
                          setCurrentDate(new Date(year, month, dayNum));
                          setCalendarSubView('Day');
                        }}
                        className="border border-outline-variant/25 rounded-xl p-2 bg-surface-container-low dark:bg-surface-container-high/40 flex flex-col justify-between min-h-[96px] hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <span className="font-semibold text-xs text-on-surface-variant text-left">{dayNum}</span>
                        <div className="space-y-1 my-2 flex-1 flex flex-col justify-end">
                          {dayBookings.slice(0, 3).map((b, bIdx) => (
                            <div 
                              key={bIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(b);
                              }}
                              className={`text-[9px] font-bold p-1 rounded cursor-pointer truncate ${b.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 line-through' : 'bg-primary-container text-on-primary-container border-l-2 border-primary'}`}
                              title={`${b.resourceName} (${b.employeeName})`}
                            >
                              {b.resourceName}
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div className="text-[8px] text-on-surface-variant font-bold text-center">
                              +{dayBookings.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Render Week View */}
          {calendarSubView === 'Week' && (() => {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1)); // Mon start

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-3 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>

                <div className="grid grid-cols-7 gap-3 min-h-[350px]">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(startOfWeek.getDate() + i);
                    const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                    const dayBookings = bookings.filter(b => b.startDate.startsWith(dateStr));

                    return (
                      <div 
                        key={i}
                        onClick={() => {
                          setCurrentDate(dayDate);
                          setCalendarSubView('Day');
                        }}
                        className="border border-outline-variant/25 rounded-xl p-3 bg-surface-container-low dark:bg-surface-container-high/40 flex flex-col min-h-[250px] hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="font-bold text-sm text-on-surface">{dayDate.getDate()}</span>
                          <span className="text-[10px] text-on-surface-variant">{dayDate.toLocaleDateString('default', { month: 'short' })}</span>
                        </div>
                        <div className="space-y-1.5 flex-1 overflow-y-auto">
                          {dayBookings.map((b, bIdx) => (
                            <div 
                              key={bIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(b);
                              }}
                              className={`text-[9px] font-bold p-1.5 rounded cursor-pointer ${b.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 line-through' : 'bg-primary-container text-on-primary-container border-l-2 border-primary'}`}
                              title={`${b.resourceName} (${b.employeeName})`}
                            >
                              <div className="truncate">{b.resourceName}</div>
                              <div className="text-[8px] opacity-75 font-mono">{b.startDate.split('T')[1].slice(0, 5)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Render Day View */}
          {calendarSubView === 'Day' && (() => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            const dayBookings = bookings.filter(b => b.startDate.startsWith(dateStr));
            const hours = Array.from({ length: 11 }).map((_, i) => 8 + i); // 8 AM to 6 PM

            return (
              <div className="border border-outline-variant/30 rounded-xl divide-y divide-outline-variant/20 overflow-hidden bg-surface-container-low/20">
                {hours.map((hour) => {
                  const timeStr = `${String(hour).padStart(2, '0')}:00`;
                  const hourBookings = dayBookings.filter(b => {
                    const startHour = parseInt(b.startDate.split('T')[1].split(':')[0]);
                    const endHour = parseInt(b.endDate.split('T')[1].split(':')[0]);
                    return hour >= startHour && hour < endHour;
                  });

                  return (
                    <div key={hour} className="flex min-h-[64px] hover:bg-surface-container-low/50 transition-colors">
                      <div className="w-20 p-3 text-right text-xs font-bold text-on-surface-variant font-mono border-r border-outline-variant/20 flex items-center justify-end bg-surface-container-low">
                        {hour > 12 ? `${hour - 12} PM` : (hour === 12 ? '12 PM' : `${hour} AM`)}
                      </div>
                      <div className="flex-1 p-2 flex gap-2 overflow-x-auto">
                        {hourBookings.map((b, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedBooking(b)}
                            className={`flex-1 min-w-[200px] max-w-[400px] p-2.5 rounded-lg border-l-4 shadow-sm flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.01] ${b.status === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-400 line-through dark:bg-red-950/20' : 'bg-primary-container text-on-primary-container border-primary'}`}
                          >
                            <div>
                              <div className="text-xs font-bold truncate">{b.resourceName}</div>
                              <div className="text-[10px] opacity-80 mt-0.5">Reserved by: {b.employeeName}</div>
                            </div>
                            <div className="text-[9px] opacity-75 font-mono mt-1">
                              {b.startDate.split('T')[1].slice(0, 5)} - {b.endDate.split('T')[1].slice(0, 5)}
                            </div>
                          </div>
                        ))}
                        {hourBookings.length === 0 && (
                          <div className="flex-1 flex items-center px-4 text-xs text-on-surface-variant/40 italic">
                            No reservations scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
