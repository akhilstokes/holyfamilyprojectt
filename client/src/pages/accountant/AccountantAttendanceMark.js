import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';

const AccountantAttendanceMark = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    checkInAt: '',
    checkOutAt: '',
    status: 'present',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/users?role=staff,delivery_staff,lab`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStaff(data.users || data || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = {
        staffId: selectedStaff,
        date: formData.date,
        checkInAt: formData.checkInAt ? `${formData.date}T${formData.checkInAt}:00` : null,
        checkOutAt: formData.checkOutAt ? `${formData.date}T${formData.checkOutAt}:00` : null,
        notes: formData.notes,
        verified: true
      };

      const response = await fetch(`${base}/api/workers/attendance/admin-mark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Attendance marked successfully');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          checkInAt: '',
          checkOutAt: '',
          status: 'present',
          notes: ''
        });
        setSelectedStaff('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Mark Attendance</h1>
        <p className="text-slate-600 mt-1">Manually mark attendance for staff members</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="attendance-staff-select" className="block text-sm font-medium text-slate-700 mb-1">Staff Member *</label>
              <select
                id="attendance-staff-select"
                required
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                aria-label="Select staff member"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select staff member</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="attendance-date-input" className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                id="attendance-date-input"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                aria-label="Select attendance date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="attendance-checkin-time" className="block text-sm font-medium text-slate-700 mb-1">Check In Time</label>
              <input
                id="attendance-checkin-time"
                type="time"
                value={formData.checkInAt}
                onChange={(e) => setFormData({ ...formData, checkInAt: e.target.value })}
                aria-label="Enter check in time"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="attendance-checkout-time" className="block text-sm font-medium text-slate-700 mb-1">Check Out Time</label>
              <input
                id="attendance-checkout-time"
                type="time"
                value={formData.checkOutAt}
                onChange={(e) => setFormData({ ...formData, checkOutAt: e.target.value })}
                aria-label="Enter check out time"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="attendance-status-select" className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
              <select
                id="attendance-status-select"
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                aria-label="Select attendance status"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half Day</option>
                <option value="leave">On Leave</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder="Additional notes or remarks..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? 'Marking...' : 'Mark Attendance'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  checkInAt: '',
                  checkOutAt: '',
                  status: 'present',
                  notes: ''
                });
                setSelectedStaff('');
              }}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountantAttendanceMark;

