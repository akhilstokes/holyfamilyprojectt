import React, { useState, useEffect } from 'react';
import './MySchedule.css';

const MySchedule = () => {
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestForm, setRequestForm] = useState({
        requestDate: '',
        currentShift: '',
        requestedShift: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState([]);

    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    // Fetch current schedule
    const fetchSchedule = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${base}/api/workers/field/shift-schedule`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSchedule(data);
            } else {
                setError(data.message || 'Failed to load shift schedule');
            }
        } catch (error) {
            console.error('Error fetching shift schedule:', error);
            setError('Failed to load shift schedule');
        } finally {
            setLoading(false);
        }
    };

    // Fetch schedule change requests
    const fetchRequests = async () => {
        try {
            const response = await fetch(`${base}/api/workers/schedule-change-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    useEffect(() => {
        fetchSchedule();
        fetchRequests();
    }, []);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const response = await fetch(`${base}/api/workers/schedule-change-requests`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestForm)
            });

            if (response.ok) {
                alert('Schedule change request submitted successfully!');
                setShowRequestForm(false);
                setRequestForm({
                    requestDate: '',
                    currentShift: '',
                    requestedShift: '',
                    reason: ''
                });
                fetchRequests();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="schedule-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your schedule...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="schedule-page">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Unable to Load Schedule</h3>
                    <p>{error}</p>
                    <button onClick={fetchSchedule} className="retry-btn">
                        <i className="fas fa-redo"></i>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="schedule-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-calendar-alt"></i>
                        My Shift Schedule
                    </h1>
                    <p>View and manage your work schedule</p>
                </div>
                <div className="header-actions">
                    <button onClick={fetchSchedule} className="refresh-btn">
                        <i className="fas fa-sync-alt"></i>
                        Refresh
                    </button>
                    <button 
                        onClick={() => setShowRequestForm(true)} 
                        className="request-btn"
                    >
                        <i className="fas fa-plus"></i>
                        Request Change
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {!schedule || !schedule.myAssignment ? (
                <div className="no-schedule">
                    <div className="no-schedule-content">
                        <div className="no-schedule-icon">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <h2>No Shift Assigned</h2>
                        <p>You haven't been assigned to any shift for this week yet.</p>
                        <p>Please contact your administrator for shift assignment.</p>
                        <button onClick={fetchSchedule} className="check-again-btn">
                            <i className="fas fa-redo"></i>
                            Check Again
                        </button>
                    </div>
                </div>
            ) : (
                <div className="schedule-content">
                    {/* Current Shift Info */}
                    <div className="current-shift-card">
                        <div className="shift-header">
                            <div className="shift-icon">
                                <i className={`fas ${schedule.myAssignment.shiftType === 'Morning' ? 'fa-sun' : 'fa-moon'}`}></i>
                            </div>
                            <div className="shift-info">
                                <h3>{schedule.myAssignment.shiftType} Shift</h3>
                                <p>Your current assignment</p>
                            </div>
                        </div>
                        <div className="shift-details">
                            <div className="time-info">
                                <div className="time-item">
                                    <span className="label">Start Time</span>
                                    <span className="value">{schedule.myAssignment.startTime}</span>
                                </div>
                                <div className="time-item">
                                    <span className="label">End Time</span>
                                    <span className="value">{schedule.myAssignment.endTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="weekly-schedule">
                        <h3>
                            <i className="fas fa-calendar-week"></i>
                            This Week's Schedule
                        </h3>
                        <div className="week-grid">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                                <div key={index} className="day-card">
                                    <div className="day-name">{day}</div>
                                    <div className="day-shift">
                                        <i className={`fas ${schedule.myAssignment.shiftType === 'Morning' ? 'fa-sun' : 'fa-moon'}`}></i>
                                        <span>{schedule.myAssignment.shiftType}</span>
                                    </div>
                                    <div className="day-time">
                                        {schedule.myAssignment.startTime} - {schedule.myAssignment.endTime}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Available Shifts Reference */}
                    <div className="shifts-reference">
                        <h3>
                            <i className="fas fa-info-circle"></i>
                            Available Shifts
                        </h3>
                        <div className="shifts-grid">
                            <div className="shift-ref-card morning">
                                <div className="shift-ref-header">
                                    <i className="fas fa-sun"></i>
                                    <span>Morning Shift</span>
                                </div>
                                <div className="shift-ref-time">
                                    {schedule.morningStart} - {schedule.morningEnd}
                                </div>
                                {schedule.myAssignment.shiftType === 'Morning' && (
                                    <div className="current-badge">Your Shift</div>
                                )}
                            </div>
                            <div className="shift-ref-card evening">
                                <div className="shift-ref-header">
                                    <i className="fas fa-moon"></i>
                                    <span>Evening Shift</span>
                                </div>
                                <div className="shift-ref-time">
                                    {schedule.eveningStart} - {schedule.eveningEnd}
                                </div>
                                {schedule.myAssignment.shiftType === 'Evening' && (
                                    <div className="current-badge">Your Shift</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Change Requests */}
            {requests.length > 0 && (
                <div className="requests-section">
                    <h3>
                        <i className="fas fa-exchange-alt"></i>
                        My Requests
                    </h3>
                    <div className="requests-list">
                        {requests.slice(0, 3).map((request) => (
                            <div key={request._id} className={`request-item ${request.status}`}>
                                <div className="request-info">
                                    <div className="request-date">
                                        {new Date(request.requestDate).toLocaleDateString()}
                                    </div>
                                    <div className="request-change">
                                        {request.currentShift} → {request.requestedShift}
                                    </div>
                                </div>
                                <div className={`request-status ${request.status}`}>
                                    {request.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Request Form Modal */}
            {showRequestForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Request Schedule Change</h3>
                            <button 
                                onClick={() => setShowRequestForm(false)}
                                className="close-btn"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleRequestSubmit} className="request-form">
                            <div className="form-group">
                                <label>Date for Change</label>
                                <input
                                    type="date"
                                    value={requestForm.requestDate}
                                    onChange={(e) => setRequestForm({...requestForm, requestDate: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Current Shift</label>
                                <select
                                    value={requestForm.currentShift}
                                    onChange={(e) => setRequestForm({...requestForm, currentShift: e.target.value})}
                                    required
                                >
                                    <option value="">Select current shift</option>
                                    <option value="Morning">Morning Shift</option>
                                    <option value="Evening">Evening Shift</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Requested Shift</label>
                                <select
                                    value={requestForm.requestedShift}
                                    onChange={(e) => setRequestForm({...requestForm, requestedShift: e.target.value})}
                                    required
                                >
                                    <option value="">Select requested shift</option>
                                    <option value="Morning">Morning Shift</option>
                                    <option value="Evening">Evening Shift</option>
                                    <option value="Off">Day Off</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Reason for Change</label>
                                <textarea
                                    value={requestForm.reason}
                                    onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                                    placeholder="Please provide a reason for the schedule change..."
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setShowRequestForm(false)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="submit-btn"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySchedule;















