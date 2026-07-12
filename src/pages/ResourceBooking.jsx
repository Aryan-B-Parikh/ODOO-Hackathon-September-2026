import React, { useState } from 'react';

const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9AM to 5PM
const DAYS = ['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18', 'Sat 19', 'Sun 20'];

const bookings = [
  { id: 'BK-001', resource: 'Conference Room A', day: 1, startHour: 9, duration: 2, by: 'Elena V.', color: 'bg-blue-400 text-white' },
  { id: 'BK-002', resource: 'Conference Room A', day: 3, startHour: 14, duration: 1, by: 'Alex C.', color: 'bg-purple-400 text-white' },
  { id: 'BK-003', resource: 'Projector Unit 3', day: 2, startHour: 10, duration: 3, by: 'Sarah J.', color: 'bg-green-400 text-white' },
  { id: 'BK-004', resource: 'Dev Workstation 5', day: 0, startHour: 11, duration: 2, by: 'Jordan S.', color: 'bg-orange-400 text-white' },
  { id: 'BK-005', resource: 'Conference Room B', day: 4, startHour: 13, duration: 2, by: 'Maria G.', color: 'bg-cyan-400 text-white' },
];

const resources = [
  { id: 'RES-001', name: 'Conference Room A', type: 'Room', capacity: 20, available: true, icon: 'meeting_room' },
  { id: 'RES-002', name: 'Conference Room B', type: 'Room', capacity: 10, available: false, icon: 'meeting_room' },
  { id: 'RES-003', name: 'Projector Unit 3', type: 'Equipment', capacity: null, available: true, icon: 'tv' },
  { id: 'RES-004', name: 'Dev Workstation 5', type: 'Workstation', capacity: null, available: true, icon: 'computer' },
  { id: 'RES-005', name: 'Fleet Car – Tesla 02', type: 'Vehicle', capacity: 5, available: true, icon: 'directions_car' },
];

export default function ResourceBooking() {
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [view, setView] = useState('calendar');

  const handleBook = (resource) => {
    setSelectedResource(resource);
    setShowBookModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Resource Booking</h1>
          <p className="text-sm text-on-surface-variant mt-1">Book rooms, equipment, and shared assets with real-time availability</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container rounded-xl p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">calendar_month</span>Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'list' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">list</span>List
            </button>
          </div>
          <button
            onClick={() => setShowBookModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Booking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Available Now', value: '4', icon: 'check_circle', color: 'text-green-600 bg-green-100' },
          { label: 'Currently Booked', value: '1', icon: 'schedule', color: 'text-orange-600 bg-orange-100' },
          { label: "Today's Bookings", value: '7', icon: 'today', color: 'text-primary bg-primary/10' },
          { label: 'This Week', value: '23', icon: 'date_range', color: 'text-purple-600 bg-purple-100' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {view === 'calendar' ? (
        /* Calendar View */
        <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant/20">
            <h2 className="font-bold text-on-surface">Week of July 14 – 20, 2026</h2>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-surface-container rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_left</span>
              </button>
              <button className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">Today</button>
              <button className="p-1.5 hover:bg-surface-container rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-outline-variant/20">
                <div className="py-3 px-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"></div>
                {DAYS.map((d, i) => (
                  <div key={i} className={`py-3 text-center text-xs font-semibold ${i === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Hour Rows */}
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-outline-variant/10 min-h-[48px]">
                  <div className="py-2 px-3 text-[10px] text-on-surface-variant font-semibold pt-2">
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const booking = bookings.find(b => b.day === dayIdx && b.startHour === hour);
                    return (
                      <div key={dayIdx} className="border-l border-outline-variant/10 relative p-0.5">
                        {booking && (
                          <div
                            className={`${booking.color} rounded-lg p-1.5 text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
                            style={{ height: `${booking.duration * 48 - 4}px` }}
                            title={`${booking.resource} - ${booking.by}`}
                          >
                            <p className="truncate">{booking.resource}</p>
                            <p className="opacity-80">{booking.by}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List / Resource View */
        <div className="space-y-3">
          {resources.map((res) => (
            <div key={res.id} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${res.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  <span className="material-symbols-outlined text-[24px]">{res.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">{res.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full font-bold">{res.type}</span>
                    {res.capacity && <span className="text-[10px] text-on-surface-variant">Capacity: {res.capacity}</span>}
                    <span className="text-[10px] font-bold">{res.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${res.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {res.available ? '● Available' : '● In Use'}
                </span>
                <button
                  onClick={() => handleBook(res)}
                  disabled={!res.available}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${res.available ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'}`}
                >
                  {res.available ? 'Book Now' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBookModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface text-lg">New Resource Booking</h3>
              <button onClick={() => setShowBookModal(false)} className="p-1.5 hover:bg-surface-container rounded-lg">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Resource</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  {resources.filter(r => r.available).map(r => <option key={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Duration</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>Half day</option>
                    <option>Full day</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Start Time</label>
                  <input type="time" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="09:00" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">End Time</label>
                  <input type="time" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="10:00" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Purpose</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="What is this booking for?" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowBookModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={() => setShowBookModal(false)} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-all">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
