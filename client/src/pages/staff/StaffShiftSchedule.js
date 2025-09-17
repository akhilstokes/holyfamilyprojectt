import React, { useState, useEffect } from 'react';
import './StaffShiftSchedule.css';

const StaffShiftSchedule = () => {
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchShiftSchedule();
    }, []);

    const fetchShiftSchedule = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch('/api/workers/field/shift-schedule', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            <div className="staff-shift-schedule">
                <div className="loading">Loading shift schedule...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="staff-shift-schedule">
                <div className="error">{error}</div>
                <button onClick={fetchShiftSchedule} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="staff-shift-schedule">
            <div className="header">
                <h2>My Shift Schedule</h2>
                <button onClick={fetchShiftSchedule} className="refresh-btn">
                    <i className="fas fa-sync-alt"></i> Refresh
                </button>
            </div>

            {!schedule || !schedule.myAssignment ? (
                <div className="no-schedule">
                    <div className="no-schedule-icon">
                        <i className="fas fa-calendar-times"></i>
                    </div>
                    <h3>No Shift Assigned</h3>
                    <p>You haven't been assigned to any shift for this week yet.</p>
                    <p>Please contact your administrator for shift assignment.</p>
                </div>
            ) : (
                <div className="schedule-content">
                    {/* Current Week Info */}
                    <div className="week-info">
                        <h3>Week of {formatDate(schedule.weekStart)}</h3>
                        <div className="week-dates">
                            {getWeekDates(schedule.weekStart).map((date, index) => (
                                <div key={index} className={`day ${date.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                                    <div className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    <div className="day-number">{date.getDate()}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Assignment */}
                    <div className="my-assignment">
                        <h3>My Shift Assignment</h3>
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
                                <span className="duration-value">
                                    {(() => {
                                        const start = schedule.myAssignment.startTime.split(':');
                                        const end = schedule.myAssignment.endTime.split(':');
                                        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
                                        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
                                        const duration = endMinutes - startMinutes;
                                        const hours = Math.floor(duration / 60);
                                        const minutes = duration % 60;
                                        return `${hours}h ${minutes}m`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* All Shift Times (for reference) */}
                    <div className="all-shifts">
                        <h3>All Shift Times This Week</h3>
                        <div className="shifts-grid">
                            <div className="shift-info">
                                <div className="shift-header">
                                    <i className="fas fa-sun"></i>
                                    <span>Morning Shift</span>
                                </div>
                                <div className="shift-time">{schedule.morningStart} - {schedule.morningEnd}</div>
                            </div>
                            <div className="shift-info">
                                <div className="shift-header">
                                    <i className="fas fa-moon"></i>
                                    <span>Evening Shift</span>
                                </div>
                                <div className="shift-time">{schedule.eveningStart} - {schedule.eveningEnd}</div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="notes">
                        <h4><i className="fas fa-info-circle"></i> Important Notes</h4>
                        <ul>
                            <li>You have a 15-minute grace period after your shift start time</li>
                            <li>Please check in before your shift start time to avoid being marked late</li>
                            <li>Contact your administrator if you need to change your shift</li>
                            <li>Shift schedules are set weekly by administrators</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffShiftSchedule;




