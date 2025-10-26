import React, { useEffect, useState, useCallback } from 'react';

const AttendanceMarking = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userShift, setUserShift] = useState(null);
  const [canMarkAttendance, setCanMarkAttendance] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(''); // 'on_time', 'late', 'absent'
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load user's shift and today's attendance
  const loadAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user's shift information
      const shiftRes = await fetch(`${base}/api/attendance/shift`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (shiftRes.ok) {
        const shiftData = await shiftRes.json();
        setUserShift(shiftData);
      }
      
      // Get today's attendance
      const attendanceRes = await fetch(`${base}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);
      }
      
    } catch (err) {
      console.error('Error loading attendance data:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [base, token]);

  useEffect(() => {
    if (token) {
      loadAttendanceData();
    }
  }, [token, loadAttendanceData]);

  // Check if user can mark attendance based on shift timing
  useEffect(() => {
    if (userShift && currentTime) {
      const now = new Date();
      const shiftStart = new Date(now.toDateString() + ' ' + userShift.startTime);
      const gracePeriodEnd = new Date(shiftStart.getTime() + 5 * 60 * 1000); // 5 minutes grace
      
      // Check if within grace period
      if (now >= shiftStart && now <= gracePeriodEnd) {
        setCanMarkAttendance(true);
        setAttendanceStatus('on_time');
      } else if (now > gracePeriodEnd && now <= new Date(shiftStart.getTime() + 2 * 60 * 60 * 1000)) {
        // Allow marking up to 2 hours after shift start as late
        setCanMarkAttendance(true);
        setAttendanceStatus('late');
      } else {
        setCanMarkAttendance(false);
      }
    }
  }, [userShift, currentTime]);

  const markAttendance = async (type) => {
    try {
      setError('');
      setSuccess('');
      
      const res = await fetch(`${base}/api/attendance/mark`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          type,
          location: location.trim(),
          notes: notes.trim(),
          timestamp: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        setSuccess('Attendance marked successfully!');
        await loadAttendanceData();
        setLocation('');
        setNotes('');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance. Please try again.');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getShiftStatus = () => {
    if (!userShift) return 'No shift assigned';
    
    const now = new Date();
    const shiftStart = new Date(now.toDateString() + ' ' + userShift.startTime);
    const shiftEnd = new Date(now.toDateString() + ' ' + userShift.endTime);
    const gracePeriodEnd = new Date(shiftStart.getTime() + 5 * 60 * 1000);
    
    if (now < shiftStart) {
      return `Shift starts at ${userShift.startTime}`;
    } else if (now >= shiftStart && now <= gracePeriodEnd) {
      return `On time period (${userShift.startTime} - ${formatTime(gracePeriodEnd)})`;
    } else if (now > gracePeriodEnd && now <= shiftEnd) {
      return `Late period (after ${formatTime(gracePeriodEnd)})`;
    } else {
      return 'Shift ended';
    }
  };

  const getStatusColor = () => {
    if (!userShift) return '#6c757d';
    
    const now = new Date();
    const shiftStart = new Date(now.toDateString() + ' ' + userShift.startTime);
    const gracePeriodEnd = new Date(shiftStart.getTime() + 5 * 60 * 1000);
    
    if (now < shiftStart) return '#17a2b8'; // Info - before shift
    if (now >= shiftStart && now <= gracePeriodEnd) return '#28a745'; // Success - on time
    if (now > gracePeriodEnd && now <= new Date(shiftStart.getTime() + 2 * 60 * 60 * 1000)) return '#ffc107'; // Warning - late
    return '#dc3545'; // Danger - too late or ended
  };

  if (!token) {
    return (
      <div style={{ padding: 16 }}>
        <h3>Attendance Marking</h3>
        <div style={{ color: 'crimson', marginTop: 8 }}>
          Please log in to mark attendance.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div>Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3>Mark Attendance</h3>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#495057' }}>
            {formatTime(currentTime)}
          </div>
          <div style={{ fontSize: 14, color: '#6c757d' }}>
            {currentTime.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {error && <div style={{ color: 'crimson', marginBottom: 16, padding: 12, backgroundColor: '#f8d7da', borderRadius: 4 }}>{error}</div>}
      {success && <div style={{ color: '#155724', marginBottom: 16, padding: 12, backgroundColor: '#d4edda', borderRadius: 4 }}>{success}</div>}

      {/* Shift Information */}
      {userShift && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ marginBottom: 12, color: '#495057' }}>Your Shift Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Shift Name</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#495057' }}>{userShift.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Start Time</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#495057' }}>{userShift.startTime}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>End Time</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#495057' }}>{userShift.endTime}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Status</div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: getStatusColor()
              }}>
                {getShiftStatus()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Attendance Status */}
      {attendance && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          backgroundColor: attendance.status === 'present' ? '#d4edda' : '#fff3cd', 
          borderRadius: 8,
          border: `1px solid ${attendance.status === 'present' ? '#c3e6cb' : '#ffeaa7'}`
        }}>
          <h4 style={{ marginBottom: 12, color: '#495057' }}>Today's Attendance</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Status</div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: attendance.status === 'present' ? '#28a745' : '#ffc107',
                textTransform: 'capitalize'
              }}>
                {attendance.status || 'Not marked'}
              </div>
            </div>
            {attendance.checkIn && (
              <div>
                <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Check In</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#495057' }}>
                  {formatTime(new Date(attendance.checkIn))}
                </div>
              </div>
            )}
            {attendance.checkOut && (
              <div>
                <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Check Out</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#495057' }}>
                  {formatTime(new Date(attendance.checkOut))}
                </div>
              </div>
            )}
            {attendance.location && (
              <div>
                <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Location</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#495057' }}>
                  {attendance.location}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance Marking Form */}
      {canMarkAttendance && !attendance?.checkIn && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          backgroundColor: '#e3f2fd', 
          borderRadius: 8,
          border: '1px solid #bbdefb'
        }}>
          <h4 style={{ marginBottom: 16, color: '#495057' }}>
            {attendanceStatus === 'on_time' ? 'Mark On-Time Attendance' : 'Mark Late Attendance'}
          </h4>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Location (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your current location"
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Notes (Optional)
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-success"
              onClick={() => markAttendance('check_in')}
              style={{ 
                backgroundColor: attendanceStatus === 'on_time' ? '#28a745' : '#ffc107',
                borderColor: attendanceStatus === 'on_time' ? '#28a745' : '#ffc107'
              }}
            >
              {attendanceStatus === 'on_time' ? 'Mark On-Time' : 'Mark Late'}
            </button>
          </div>
        </div>
      )}

      {/* Check Out Option */}
      {attendance?.checkIn && !attendance?.checkOut && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          backgroundColor: '#fff3cd', 
          borderRadius: 8,
          border: '1px solid #ffeaa7'
        }}>
          <h4 style={{ marginBottom: 16, color: '#495057' }}>Check Out</h4>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Notes (Optional)
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="End of day notes..."
            />
          </div>
          
          <button
            className="btn btn-warning"
            onClick={() => markAttendance('check_out')}
          >
            Check Out
          </button>
        </div>
      )}

      {/* Cannot Mark Attendance Message */}
      {!canMarkAttendance && !attendance?.checkIn && (
        <div style={{ 
          padding: 16, 
          backgroundColor: '#f8d7da', 
          borderRadius: 8,
          border: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#721c24', marginBottom: 8 }}>Cannot Mark Attendance</h4>
          <p style={{ color: '#721c24', margin: 0 }}>
            {!userShift ? 'No shift assigned. Please contact your manager.' : 
             'Attendance marking is not available at this time. Please check your shift timing.'}
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button 
          className="btn btn-outline-primary"
          onClick={loadAttendanceData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceMarking;


