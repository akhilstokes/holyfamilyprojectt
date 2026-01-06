import React, { useState } from 'react';
import './ShiftManagement.css';

const ShiftManagement = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [shifts, setShifts] = useState([
    { id: 1, name: 'Morning Shift', time: '09:00 - 17:00', staff: 'John Doe', type: 'morning' },
    { id: 2, name: 'Evening Shift', time: '18:00 - 22:00', staff: 'Jane Smith', type: 'evening' },
  ]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="shift-management">
      <div className="shift-header">
        <h1>
          <i className="fas fa-calendar-alt"></i>
          Shift Planning
        </h1>
        <p>Plan staff shifts</p>
      </div>

      <div className="shift-grid">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="day-column">
            <div className="day-header">
              <h3>{day}</h3>
            </div>
            <div className="shift-slots">
              <div className="shift-slot morning">
                <div className="shift-time">09:00 - 17:00</div>
                <div className="shift-type">Morning</div>
                <select className="staff-select">
                  <option>Select staff...</option>
                  <option>John Doe</option>
                  <option>Jane Smith</option>
                  <option>Mike Johnson</option>
                </select>
                <button className="assign-btn">
                  <i className="fas fa-check"></i>
                  Assign
                </button>
              </div>
              
              <div className="shift-slot evening">
                <div className="shift-time">18:00 - 22:00</div>
                <div className="shift-type">Evening</div>
                <select className="staff-select">
                  <option>Select staff...</option>
                  <option>John Doe</option>
                  <option>Jane Smith</option>
                  <option>Mike Johnson</option>
                </select>
                <button className="assign-btn">
                  <i className="fas fa-check"></i>
                  Assign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="save-section">
        <button className="save-btn">
          <i className="fas fa-save"></i>
          Save Schedule
        </button>
      </div>
    </div>
  );
};

export default ShiftManagement;