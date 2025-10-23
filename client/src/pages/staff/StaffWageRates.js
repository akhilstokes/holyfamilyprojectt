import React from 'react';

const StaffWageRates = () => {
  // Placeholder UI. Later, fetch from API: GET /api/rates or similar
  const sampleRates = [
    { role: 'Tapper', daily: 900, hourly: 120 },
    { role: 'Loader', daily: 800, hourly: 105 },
    { role: 'Driver', daily: 1100, hourly: 150 },
  ];

  return (
    <div>
      <h2>Wage Rates</h2>
      <p>These are indicative rates. Actual rates may vary based on policy updates.</p>
      <div className="rates-table" style={{ overflowX: 'auto', marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Daily Rate</th>
              <th>Hourly Rate</th>
            </tr>
          </thead>
          <tbody>
            {sampleRates.map((r) => (
              <tr key={r.role}>
                <td>{r.role}</td>
                <td>₹{r.daily}</td>
                <td>₹{r.hourly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffWageRates;
