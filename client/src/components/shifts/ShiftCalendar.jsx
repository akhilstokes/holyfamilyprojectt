import React, { useState, useEffect } from 'react';
import './ShiftCalendar.css';

const ShiftCalendar = ({ onShiftSelect, selectedDate, onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [shifts, setShifts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchShiftsAndAssignments();
  }, [currentDate, viewMode]);

  const fetchShiftsAndAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Get date range based on view mode
      const { startDate, endDate } = getDateRange();

      // Fetch shifts and assignments in parallel
      const [shiftsRes, assignmentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/shifts/template/weekly`, { headers }),
        fetch(`${API_BASE}/api/shift-assignments/range/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`, { headers })
      ]);

      if (shiftsRes.ok) {
        const shiftsData = await shiftsRes.json();
        setShifts(shiftsData);
      }

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData);
      }
    } catch (error) {
      console.error('Error fetching shifts and assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'week') {
      // Get start of week (Monday)
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      
      // Get end of week (Sunday)
      end.setDate(start.getDate() + 6);
    } else {
      // Get start of month
      start.setDate(1);
      
      // Get end of month
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    return { startDate: start, endDate: end };
  };

  const getDaysInRange = () => {
    const { startDate, endDate } = getDateRange();
    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getShiftsForDay = (date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return shifts[dayName] || [];
  };

  const getAssignmentsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return assignments.filter(assignment => 
      assignment.date.split('T')[0] === dateStr
    );
  };

  const getAssignmentsForShift = (date, shiftId) => {
    const dayAssignments = getAssignmentsForDay(date);
    return dayAssignments.filter(assignment => 
      assignment.shift._id === shiftId
    );
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    
    setCurrentDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const formatDateHeader = () => {
    if (viewMode === 'week') {
      const { startDate, endDate } = getDateRange();
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3b82f6',
      confirmed: '#10b981',
      in_progress: '#f59e0b',
      completed: '#059669',
      cancelled: '#ef4444',
      no_show: '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const handleShiftClick = (shift, date, assignments) => {
    if (onShiftSelect) {
      onShiftSelect({
        shift,
        date,
        assignments
      });
    }
  };

  if (loading) {
    return (
      <div className="shift-calendar-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shift-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            className="nav-btn"
            onClick={() => navigateDate(-1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="date-display">
            <h2>{formatDateHeader()}</h2>
          </div>
          
          <button 
            className="nav-btn"
            onClick={() => navigateDate(1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="calendar-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>

          <button 
            className="today-btn"
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              if (onDateChange) onDateChange(today);
            }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`calendar-grid ${viewMode}`}>
        {/* Day Headers */}
        <div className="day-headers">
          {getDaysInRange().slice(0, viewMode === 'week' ? 7 : 7).map((date, index) => (
            <div key={index} className="day-header">
              <div className="day-name">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="day-number">
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="calendar-body">
          {getDaysInRange().map((date, dayIndex) => {
            const dayShifts = getShiftsForDay(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            return (
              <div 
                key={dayIndex} 
                className={`day-column ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              >
                <div className="day-shifts">
                  {dayShifts.map((shift) => {
                    const shiftAssignments = getAssignmentsForShift(date, shift._id);
                    const assignedCount = shiftAssignments.length;
                    const maxStaff = shift.maxStaff;
                    const fillPercentage = (assignedCount / maxStaff) * 100;

                    return (
                      <div
                        key={shift._id}
                        className="shift-block"
                        style={{ borderLeftColor: shift.color }}
                        onClick={() => handleShiftClick(shift, date, shiftAssignments)}
                      >
                        <div className="shift-header">
                          <div className="shift-name">{shift.name}</div>
                          <div className="shift-time">
                            {shift.startTime} - {shift.endTime}
                          </div>
                        </div>

                        <div className="shift-details">
                          <div className="staff-count">
                            <i className="fas fa-users"></i>
                            <span>{assignedCount}/{maxStaff}</span>
                          </div>

                          <div className="shift-category">
                            {shift.category}
                          </div>
                        </div>

                        {/* Staff Fill Indicator */}
                        <div className="staff-fill-indicator">
                          <div 
                            className="fill-bar"
                            style={{ 
                              width: `${Math.min(fillPercentage, 100)}%`,
                              backgroundColor: fillPercentage >= 100 ? '#10b981' : fillPercentage >= 80 ? '#f59e0b' : '#3b82f6'
                            }}
                          ></div>
                        </div>

                        {/* Assignment Status Dots */}
                        {shiftAssignments.length > 0 && (
                          <div className="assignment-status-dots">
                            {shiftAssignments.slice(0, 5).map((assignment, index) => (
                              <div
                                key={index}
                                className="status-dot"
                                style={{ backgroundColor: getStatusColor(assignment.status) }}
                                title={`${assignment.staff.name} - ${assignment.status}`}
                              ></div>
                            ))}
                            {shiftAssignments.length > 5 && (
                              <div className="more-assignments">
                                +{shiftAssignments.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {dayShifts.length === 0 && (
                    <div className="no-shifts">
                      <i className="fas fa-calendar-times"></i>
                      <span>No shifts</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-title">Status Legend:</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Scheduled</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#10b981' }}></div>
            <span>Confirmed</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>In Progress</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#059669' }}></div>
            <span>Completed</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCalendar;