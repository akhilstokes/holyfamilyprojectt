import React, { useState } from 'react';
import StaffSalaryView from './StaffSalaryView';

const StaffSalary = ({ defaultView }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeView, setActiveView] = useState(defaultView || (user.role === 'field_staff' ? 'daily' : 'staff'));

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Salary</h3>
              <div className="card-tools">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${activeView === 'staff' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveView('staff')}
                    disabled={user.role === 'field_staff'}
                  >
                    Staff Salary
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeView === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveView('daily')}
                  >
                    Daily Wage
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeView === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveView('monthly')}
                  >
                    Monthly Wage
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {activeView === 'staff' ? (
                <StaffSalaryView />
              ) : (
                activeView === 'daily' ? <DailyWageView /> : <MonthlyWageView />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Daily Wage View Component for field staff
const DailyWageView = () => {
  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [ledger, setLedger] = useState([]);

  const loadSummary = async () => {
    const [y, m] = month.split('-');
    const res = await fetch(`${base}/api/workers/me/salary-summary?year=${y}&month=${Number(m)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setSummary(await res.json());
    const res2 = await fetch(`${base}/api/workers/me/payroll?year=${y}&month=${Number(m)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res2.ok) setLedger(await res2.json());
  };

  const loadHistory = async () => {
    const res = await fetch(`${base}/api/workers/me/salary-history`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setHistory(await res.json());
  };

  React.useEffect(() => { loadHistory(); }, [loadHistory]);
  React.useEffect(() => { loadSummary(); }, [month, loadSummary]);

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
                <p><strong>Working Days:</strong> {summary.workingDays}</p>
                <p><strong>Daily Wage:</strong> ₹{summary.dailyWage}</p>
                <p><strong>Gross Salary:</strong> ₹{summary.grossSalary}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Payment Summary</h5>
              </div>
              <div className="card-body">
                <p><strong>Received:</strong> ₹{summary.receivedAmount}</p>
                <p><strong>Advance:</strong> ₹{summary.advanceAmount}</p>
                <p><strong>Bonus:</strong> ₹{summary.bonusAmount || 0}</p>
                <p><strong>Deductions:</strong> ₹{summary.deductionAmount || 0}</p>
                <p><strong>Pending:</strong> ₹{summary.pendingAmount}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">Loading summary...</div>
      )}

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
                    <td>₹{e.amount}</td>
                    <td>{e.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  <td>{h.workingDays}</td>
                  <td>₹{h.grossSalary}</td>
                  <td>₹{h.receivedAmount}</td>
                  <td>₹{h.advanceAmount}</td>
                  <td>₹{h.pendingAmount}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={7}>No history</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Monthly Wage View mirrors the daily wage layout but uses monthly salary endpoints
const MonthlyWageView = () => {
  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [calc, setCalc] = useState(null);
  const [history, setHistory] = useState([]);

  const calculate = async () => {
    const [y, m] = month.split('-');
    // workerId is typically in worker profile; fallback to user._id if API expects workerId as user id mapping
    const workerId = user.workerId || user._id;
    if (!workerId) return;
    const res = await fetch(`${base}/api/monthly-wage/calculate/${workerId}?year=${y}&month=${Number(m)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      setCalc(json.data || null);
    }
  };

  const loadHistory = async () => {
    // Reuse salary history from salary summary endpoint if available for monthly
    const res = await fetch(`${base}/api/workers/me/salary-history`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setHistory(await res.json());
  };

  React.useEffect(() => { loadHistory(); }, [loadHistory]);
  React.useEffect(() => { calculate(); }, [month, calculate]);
  const calculation = calc?.calculation;

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-6">
          <h4>Monthly Wage Summary</h4>
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

      {calculation ? (
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header"><h5>Current Month Details</h5></div>
              <div className="card-body">
                <p><strong>Working Days:</strong> {calculation.workingDays}</p>
                <p><strong>Base Salary:</strong> ₹{calculation.baseSalary}</p>
                <p><strong>Gross Salary:</strong> ₹{calculation.grossSalary}</p>
                <p><strong>Net Salary:</strong> ₹{calculation.netSalary}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header"><h5>Payment Summary</h5></div>
              <div className="card-body">
                <p><strong>Benefits:</strong> ₹{calculation.totalBenefits || 0}</p>
                <p><strong>Bonuses:</strong> ₹{calculation.totalBonuses || 0}</p>
                <p><strong>Deductions:</strong> ₹{calculation.totalDeductions || 0}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">Loading summary...</div>
      )}

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
                  <td>{h.workingDays}</td>
                  <td>₹{h.grossSalary}</td>
                  <td>₹{h.receivedAmount}</td>
                  <td>₹{h.advanceAmount}</td>
                  <td>₹{h.pendingAmount}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={7}>No history</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffSalary;





