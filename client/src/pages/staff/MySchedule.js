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


    const [viewMode, setViewMode] = useState('week'); // 'week' or 'list'


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


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const getWeekDates = (weekStart) => {
        const start = new Date(weekStart);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const getDayOfWeek = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const getShiftIcon = (shiftType) => {
        if (shiftType === 'Morning') return 'fa-sun';
        if (shiftType === 'Evening') return 'fa-moon';
        return 'fa-calendar-times';
    };

    const getShiftColor = (shiftType) => {
        if (shiftType === 'Morning') return '#ffc107';
        if (shiftType === 'Evening') return '#6f42c1';
        return '#6c757d';
    };


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

                fetchRequests(); // Refresh requests list

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ffa500';
            case 'approved': return '#28a745';
            case 'rejected': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="my-schedule">
                <div className="loading">Loading schedule...</div>

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

            <div className="my-schedule">
                <div className="error">{error}</div>
                <button onClick={fetchSchedule} className="retry-btn">Retry</button>

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

        <div className="my-schedule">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <h2>
                            <i className="fas fa-calendar-alt"></i>
                            My Shift Schedule
                        </h2>
                        <p className="header-subtitle">View and manage your work schedule</p>
                    </div>
                    <div className="header-actions">
                        <button onClick={fetchSchedule} className="refresh-btn" title="Refresh schedule">
                            <i className="fas fa-sync-alt"></i>
                            <span className="btn-text">Refresh</span>
                        </button>
                        <button 
                            onClick={() => setShowRequestForm(!showRequestForm)} 
                            className="request-btn"
                            title="Request a schedule change"
                        >
                            <i className="fas fa-calendar-plus"></i>
                            <span className="btn-text">Request Change</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Schedule Display */}
            {!schedule || !schedule.myAssignment ? (
                <div className="no-schedule-container">
                    <div className="no-schedule">
                        <div className="no-schedule-icon">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <h3>No Shift Assigned</h3>
                        <p className="no-schedule-message">You haven't been assigned to any shift for this week yet.</p>
                        <div className="no-schedule-action">
                            <p>Please contact your administrator for shift assignment.</p>
                            <button onClick={fetchSchedule} className="retry-action-btn">
                                <i className="fas fa-redo"></i> Check Again
                            </button>
                        </div>

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

                    {/* Quick Stats */}
                    <div className="quick-stats">
                        <div className="stat-card highlight-card">
                            <div className="stat-icon" style={{ color: getShiftColor(schedule.myAssignment.shiftType) }}>
                                <i className={`fas ${getShiftIcon(schedule.myAssignment.shiftType)}`}></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Current Shift</div>
                                <div className="stat-value">{schedule.myAssignment.shiftType}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ color: '#28a745' }}>
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Shift Hours</div>
                                <div className="stat-value">
                                    {schedule.myAssignment.startTime} - {schedule.myAssignment.endTime}
                                </div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ color: '#007bff' }}>
                                <i className="fas fa-calendar-week"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">This Week</div>
                                <div className="stat-value">
                                    {new Date(schedule.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}

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

                    {/* Weekly Calendar View */}
                    <div className="week-calendar">
                        <div className="week-header">
                            <h3>
                                <i className="fas fa-calendar-week"></i>
                                Week of {formatDate(schedule.weekStart)}
                            </h3>
                            <div className="view-toggle">
                                <button 
                                    className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
                                    onClick={() => setViewMode('week')}
                                    title="Week view"
                                >
                                    <i className="fas fa-calendar-week"></i>
                                </button>
                                <button 
                                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List view"
                                >
                                    <i className="fas fa-list"></i>
                                </button>
                            </div>
                        </div>
                        
                        {viewMode === 'week' ? (
                            <div className="week-grid">
                                {getWeekDates(schedule.weekStart).map((date, index) => {
                                    const isTodayDate = isToday(date);
                                    return (
                                        <div key={index} className={`day-card ${isTodayDate ? 'today' : ''}`}>
                                            <div className="day-header">
                                                <div className="day-name">
                                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                                <div className="day-number">{date.getDate()}</div>
                                                {isTodayDate && <span className="today-badge">Today</span>}
                                            </div>
                                            <div className="day-content">
                                                <div className="shift-badge" style={{ 
                                                    background: `${getShiftColor(schedule.myAssignment.shiftType)}20`,
                                                    borderLeft: `3px solid ${getShiftColor(schedule.myAssignment.shiftType)}`
                                                }}>
                                                    <i className={`fas ${getShiftIcon(schedule.myAssignment.shiftType)}`} 
                                                       style={{ color: getShiftColor(schedule.myAssignment.shiftType) }}></i>
                                                    <span>{schedule.myAssignment.shiftType}</span>
                                                </div>
                                                <div className="shift-time">
                                                    {schedule.myAssignment.startTime} - {schedule.myAssignment.endTime}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="week-list">
                                {getWeekDates(schedule.weekStart).map((date, index) => {
                                    const isTodayDate = isToday(date);
                                    return (
                                        <div key={index} className={`list-item ${isTodayDate ? 'today' : ''}`}>
                                            <div className="list-date">
                                                <div className="date-circle">{date.getDate()}</div>
                                                <div className="date-info">
                                                    <div className="date-day">{getDayOfWeek(date)}</div>
                                                    <div className="date-month">
                                                        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                {isTodayDate && <span className="today-badge">Today</span>}
                                            </div>
                                            <div className="list-shift">
                                                <div className="shift-type-badge" style={{ color: getShiftColor(schedule.myAssignment.shiftType) }}>
                                                    <i className={`fas ${getShiftIcon(schedule.myAssignment.shiftType)}`}></i>
                                                    {schedule.myAssignment.shiftType} Shift
                                                </div>
                                                <div className="shift-timing">
                                                    <i className="fas fa-clock"></i>
                                                    {schedule.myAssignment.startTime} - {schedule.myAssignment.endTime}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* All Shift Times (for reference) */}
                    <div className="shift-reference">
                        <h3>
                            <i className="fas fa-info-circle"></i>
                            All Available Shifts
                        </h3>
                        <div className="shifts-grid">
                            <div className="shift-card morning-shift">
                                <div className="shift-card-header">
                                    <i className="fas fa-sun"></i>
                                    <span>Morning Shift</span>
                                </div>
                                <div className="shift-card-time">
                                    <i className="fas fa-clock"></i>
                                    {schedule.morningStart} - {schedule.morningEnd}
                                </div>
                                {schedule.myAssignment.shiftType === 'Morning' && (
                                    <div className="current-shift-badge">
                                        <i className="fas fa-check-circle"></i> Your Shift
                                    </div>
                                )}
                            </div>
                            <div className="shift-card evening-shift">
                                <div className="shift-card-header">
                                    <i className="fas fa-moon"></i>
                                    <span>Evening Shift</span>
                                </div>
                                <div className="shift-card-time">
                                    <i className="fas fa-clock"></i>
                                    {schedule.eveningStart} - {schedule.eveningEnd}
                                </div>
                                {schedule.myAssignment.shiftType === 'Evening' && (
                                    <div className="current-shift-badge">
                                        <i className="fas fa-check-circle"></i> Your Shift
                                    </div>

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

            {/* Schedule Change Request Form */}
            {showRequestForm && (
                <div className="request-form-overlay">
                    <div className="request-form">
                        <div className="form-header">

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

                        <form onSubmit={handleRequestSubmit}>
                            <div className="form-group">
                                <label>Date for Change:</label>

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

                                    max={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                    required
                                />
                                <small>You can request changes up to 2 weeks in advance</small>
                            </div>

                            <div className="form-group">
                                <label>Current Shift:</label>

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

                                <label>Requested Shift:</label>

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

                                <label>Reason for Change:</label>
                                <textarea
                                    value={requestForm.reason}
                                    onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                                    placeholder="Please provide a reason for the schedule change request..."

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



            {/* My Schedule Change Requests */}
            <div className="my-requests">
                <div className="section-header">
                    <h3>
                        <i className="fas fa-exchange-alt"></i>
                        My Schedule Change Requests
                    </h3>
                    {requests.length > 0 && (
                        <span className="requests-count">
                            {requests.filter(r => r.status === 'pending').length} Pending
                        </span>
                    )}
                </div>
                {requests.length === 0 ? (
                    <div className="no-requests">
                        <i className="fas fa-inbox"></i>
                        <p>You haven't submitted any schedule change requests yet.</p>
                        <button 
                            onClick={() => setShowRequestForm(true)}
                            className="quick-request-btn"
                        >
                            <i className="fas fa-plus-circle"></i>
                            Submit Your First Request
                        </button>
                    </div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => (
                            <div key={request._id} className={`request-card status-${request.status}`}>
                                <div className="request-status-indicator" style={{ background: getStatusColor(request.status) }}></div>
                                <div className="request-content">
                                    <div className="request-header">
                                        <div className="request-date">
                                            <i className="fas fa-calendar"></i>
                                            <span>{formatDate(request.requestDate)}</span>
                                        </div>
                                        <span 
                                            className={`status-badge ${request.status}`}
                                        >
                                            <i className={`fas ${
                                                request.status === 'pending' ? 'fa-clock' :
                                                request.status === 'approved' ? 'fa-check-circle' :
                                                'fa-times-circle'
                                            }`}></i>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="request-details">
                                        <div className="shift-change-info">
                                            <div className="shift-item from">
                                                <span className="label">From</span>
                                                <span className="value">
                                                    <i className={`fas ${getShiftIcon(request.currentShift)}`}></i>
                                                    {request.currentShift} Shift
                                                </span>
                                            </div>
                                            <i className="fas fa-long-arrow-alt-right arrow-icon"></i>
                                            <div className="shift-item to">
                                                <span className="label">To</span>
                                                <span className="value">
                                                    <i className={`fas ${request.requestedShift === 'Off' ? 'fa-calendar-times' : getShiftIcon(request.requestedShift)}`}></i>
                                                    {request.requestedShift === 'Off' ? 'Day Off' : `${request.requestedShift} Shift`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="request-reason">
                                            <div className="reason-label">
                                                <i className="fas fa-comment"></i>
                                                Reason
                                            </div>
                                            <div className="reason-text">{request.reason}</div>
                                        </div>
                                        {request.managerResponse && (
                                            <div className="manager-response">
                                                <div className="response-label">
                                                    <i className="fas fa-reply"></i>
                                                    Manager Response
                                                </div>
                                                <div className="response-text">{request.managerResponse}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="request-footer">
                                        <div className="request-date-submitted">
                                            <i className="fas fa-clock"></i>
                                            Submitted {new Date(request.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Help & Guidelines */}
            <div className="help-section">
                <div className="help-header">
                    <h4>
                        <i className="fas fa-lightbulb"></i>
                        Schedule Guidelines & Tips
                    </h4>
                </div>
                <div className="help-grid">
                    <div className="help-card">
                        <div className="help-icon">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="help-content">
                            <h5>Advance Notice</h5>
                            <p>Submit requests at least 24 hours in advance</p>
                        </div>
                    </div>
                    <div className="help-card">
                        <div className="help-icon">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="help-content">
                            <h5>Planning Ahead</h5>
                            <p>Request changes up to 2 weeks in advance</p>
                        </div>
                    </div>
                    <div className="help-card">
                        <div className="help-icon">
                            <i className="fas fa-user-check"></i>
                        </div>
                        <div className="help-content">
                            <h5>Approval Required</h5>
                            <p>All requests need manager approval</p>
                        </div>
                    </div>
                    <div className="help-card">
                        <div className="help-icon">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <div className="help-content">
                            <h5>Emergencies</h5>
                            <p>Contact your manager directly for urgent changes</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MySchedule;



















