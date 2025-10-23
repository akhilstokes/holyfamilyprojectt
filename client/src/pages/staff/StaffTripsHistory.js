import React, { useState } from 'react';

const demoTrips = [
  { id: 'T1001', date: '2025-09-25', routeName: 'Route A', totalStops: 6, completed: 5, status: 'in_progress' },
  { id: 'T1000', date: '2025-09-24', routeName: 'Route B', totalStops: 4, completed: 4, status: 'done' },
];

const StaffTripsHistory = () => {
  const [rows] = useState(demoTrips);

  return (
    <div className="user-rate-history">
      <div className="header">
        <h1>🗺️ Trips History</h1>
        <p>Review past and current trips and completion status</p>
      </div>

      <div className="rates-table-container">
        <table className="rates-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Date</th>
              <th>Route</th>
              <th>Total Stops</th>
              <th>Completed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.date}</td>
                <td>{t.routeName}</td>
                <td>{t.totalStops}</td>
                <td>{t.completed}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTripsHistory;
