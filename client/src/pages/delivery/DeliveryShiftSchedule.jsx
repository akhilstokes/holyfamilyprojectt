import React, { useState, useEffect } from 'react';
import './DeliveryShiftSchedule.css';

const DeliveryShiftSchedule = () => {
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    const fetchShiftSchedule = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${base}/api/delivery/shift-schedule`, {
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

    useEffect(() => {
        fetchShiftSchedule();
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

    if (loading) {
        return (
            <div className="delivery-shift-schedule">
                <div className="loading">Loading shift schedule...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="delivery-shift-schedule">
                <div className="error">Error: {error}</div>
                <button onClick={fetchShiftSchedule} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    if (!schedule) {
        return (
            <div className="delivery-shift-schedule">
                <div className="no-data">No shift schedule available</div>
            </div>
        );
    }

    const weekDates = getWeekDates(schedule.weekStart);

    return (
        <div className="delivery-shift-schedule">
            <div className="schedule-header">
                <h2>My Shift Schedule</h2>
                <div className="week-info">
                    <span className="week-range">
                        {formatDate(schedule.weekStart)} - {formatDate(schedule.weekEnd)}
                    </span>
                </div>
            </div>

            {/* My Assignment */}
            <div className="my-assignment">
                <h3>My Shift Assignment</h3>
                {schedule.myAssignment ? (
                    <div className="assignment-card">
                        <div className="shift-type">
                            <i className={`fas ${schedule.myAssignment.shiftType === 'Morning' ? 'fa-sun' : 'fa-moon'}`}></i>
                            <span className="shift-name">{schedule.myAssignment.shiftType} Shift</span>
                        </div>
                        <div className="shift-times">
                            <div className="time-slot">
                                <span className="time-label">Start Time:</span>
                                <span className="time-value">{schedule.myAssignment.startTime}</span>
                            </div>
                            <div className="time-slot">
                                <span className="time-label">End Time:</span>
                                <span className="time-value">{schedule.myAssignment.endTime}</span>
                            </div>
                        </div>
                        <div className="shift-duration">
                            <span className="duration-label">Duration:</span>
                            <span className="duration-value">{schedule.myAssignment.duration}</span>
                        </div>
                        {schedule.myAssignment.description && (
                            <div className="shift-description">
                                <span className="description-label">Description:</span>
                                <span className="description-value">{schedule.myAssignment.description}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="no-assignment">
                        <i className="fas fa-calendar-times"></i>
                        <span>No shift assigned for this week</span>
                    </div>
                )}
            </div>

            {/* All Shifts */}
            <div className="all-shifts">
                <h3>All Available Shifts</h3>
                <div className="shifts-grid">
                    {schedule.allShifts && schedule.allShifts.length > 0 ? (
                        schedule.allShifts.map((shift, index) => (
                            <div key={index} className="shift-info">
                                <div className="shift-header">
                                    <h4>{shift.name}</h4>
                                    <span className={`shift-status ${shift.isActive ? 'active' : 'inactive'}`}>
                                        {shift.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="shift-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Time:</span>
                                        <span className="detail-value">{shift.startTime} - {shift.endTime}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Duration:</span>
                                        <span className="detail-value">{shift.duration}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Grace Period:</span>
                                        <span className="detail-value">{shift.gracePeriod} minutes</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Assigned Staff:</span>
                                        <span className="detail-value">{shift.assignedStaffCount || 0}</span>
                                    </div>
                                </div>
                                {shift.description && (
                                    <div className="shift-description">
                                        <span className="description-text">{shift.description}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-shifts">
                            <i className="fas fa-calendar-alt"></i>
                            <span>No shifts available</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Calendar */}
            <div className="weekly-calendar">
                <h3>Weekly Calendar</h3>
                <div className="calendar-grid">
                    {weekDates.map((date, index) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                            <div key={index} className={`day ${isToday ? 'today' : ''}`}>
                                <div className="day-name">
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className="day-number">
                                    {date.getDate()}
                                </div>
                                <div className="day-shift">
                                    {schedule.myAssignment && schedule.myAssignment.days && schedule.myAssignment.days.includes(index) ? (
                                        <div className="assigned-shift">
                                            <i className="fas fa-clock"></i>
                                            <span>{schedule.myAssignment.shiftType}</span>
                                        </div>
                                    ) : (
                                        <div className="no-shift">
                                            <i className="fas fa-minus"></i>
                                            <span>Off</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DeliveryShiftSchedule;
