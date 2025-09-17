import React, { useEffect, useState } from 'react';

export default function StaffProfileView({ staffUserId }) {
  const [worker, setWorker] = useState(null);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [summary, setSummary] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWorker = async () => {
      // fetch by user link
      const res = await fetch(`/api/workers?q=&active=true`, { headers: { Authorization: `Bearer ${token}` } });
      const list = await res.json();
      const found = list.find(w => w.user && w.user._id === staffUserId);
      setWorker(found || null);
    };
    fetchWorker();
  }, [staffUserId, token]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!staffUserId) return;
      const [y, m] = month.split('-');
      const res = await fetch(`/api/workers/${staffUserId}/salary-summary?year=${y}&month=${Number(m)}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setSummary(json);
    };
    fetchSummary();
  }, [staffUserId, month, token]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Staff Profile (Admin View)</h2>
      {worker ? (
        <div>
          <div><strong>Name:</strong> {worker.name}</div>
          <div><strong>User Email:</strong> {worker.user?.email}</div>
          <div><strong>Daily Wage:</strong> ₹ {worker.dailyWage || 0}</div>
          <div><strong>Origin:</strong> {worker.origin}</div>
          <div><strong>Contact:</strong> {worker.contactNumber || '-'}</div>
        </div>
      ) : <div>Loading staff profile...</div>}

      <div style={{ marginTop: 16 }}>
        <label>Month: </label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <div style={{ marginTop: 8 }}>
        <h3>Salary Summary</h3>
        {summary ? (
          <ul>
            <li><strong>Working Days:</strong> {summary.workingDays}</li>
            <li><strong>Daily Wage:</strong> ₹ {summary.dailyWage}</li>
            <li><strong>Gross Salary:</strong> ₹ {summary.grossSalary}</li>
            <li><strong>Received:</strong> ₹ {summary.receivedAmount}</li>
            <li><strong>Advance:</strong> ₹ {summary.advanceAmount}</li>
            <li><strong>Pending:</strong> ₹ {summary.pendingAmount}</li>
          </ul>
        ) : <div>Loading summary...</div>}
      </div>
    </div>
  );
}