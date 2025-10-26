import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DailyWageView = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });

  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [y, m] = month.split('-');

      // Load salary summary
      const summaryRes = await fetch(`${base}/api/daily-wage/calculate/${user._id}?year=${y}&month=${Number(m)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }

      // Load payroll ledger
      const ledgerRes = await fetch(`${base}/api/workers/me/payroll?year=${y}&month=${Number(m)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ledgerRes.ok) {
        setLedger(await ledgerRes.json());
      }

      // Load history
      const historyRes = await fetch(`${base}/api/workers/me/salary-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        setHistory(await historyRes.json());
      }

    } catch (error) {
      console.error('Error loading daily wage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) loadData();
  }, [month, user]);

  if (loading) return <div className="text-center"><div className="spinner-border"></div></div>;

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-6">
          <h4>Daily Wage Summary</h4>
        </div>
        <div className="col-md-6">
          <input
            type="month"
            className="form-control"
            value={month}
            onChange={(e)=>setMonth(e.target.value)}
          />
        </div>
      </div>

      {summary ? (
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Current Month Details</h5>
              </div>
              <div className="card-body">
                <p><strong>Working Days:</strong> {summary.workingDays || 0}</p>
                <p><strong>Daily Wage:</strong> ₹{summary.dailyWage?.toLocaleString() || '0'}</p>
                <p><strong>Base Salary:</strong> ₹{summary.baseSalary?.toLocaleString() || '0'}</p>
                <p><strong>Overtime Pay:</strong> ₹{summary.overtimePay?.toLocaleString() || '0'}</p>
                <p><strong>Gross Salary:</strong> ₹{summary.grossSalary?.toLocaleString() || '0'}</p>
                {summary.totalBenefits > 0 && (
                  <p><strong>Total Benefits:</strong> ₹{summary.totalBenefits?.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Payment Summary</h5>
              </div>
              <div className="card-body">
                <p><strong>Received:</strong> ₹{summary.receivedAmount?.toLocaleString() || '0'}</p>
                <p><strong>Advance:</strong> ₹{summary.advanceAmount?.toLocaleString() || '0'}</p>
                <p><strong>Bonus:</strong> ₹{summary.bonusAmount?.toLocaleString() || '0'}</p>
                <p><strong>Deductions:</strong> ₹{summary.deductionAmount?.toLocaleString() || '0'}</p>
                <p><strong>Pending:</strong> ₹{summary.pendingAmount?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">No data available for selected month</div>
      )}

      {/* Payment Ledger */}
      {ledger.length > 0 && (
        <div className="mt-4">
          <h5>Payment Ledger</h5>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((e) => (
                  <tr key={e._id}>
                    <td>{new Date(e.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${e.type === 'received' ? 'success' : e.type === 'advance' ? 'warning' : e.type === 'bonus' ? 'info' : 'danger'}`}>
                        {e.type}
                      </span>
                    </td>
                    <td>₹{e.amount?.toLocaleString()}</td>
                    <td>{e.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salary History */}
      <div className="mt-4">
        <h5>Salary History</h5>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Year</th>
                <th>Month</th>
                <th>Working Days</th>
                <th>Gross</th>
                <th>Received</th>
                <th>Advance</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={`${h.year}-${h.month}`}>
                  <td>{h.year}</td>
                  <td>{h.month}</td>
                  <td>{h.workingDays || 0}</td>
                  <td>₹{h.grossSalary?.toLocaleString() || '0'}</td>
                  <td>₹{h.receivedAmount?.toLocaleString() || '0'}</td>
                  <td>₹{h.advanceAmount?.toLocaleString() || '0'}</td>
                  <td>₹{h.pendingAmount?.toLocaleString() || '0'}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={7}>No history available</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyWageView;
