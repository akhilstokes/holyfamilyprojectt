import React, { useEffect, useState } from 'react';
import { useConfirm } from '../../components/common/ConfirmDialog';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

const AccountantSalaries = () => {
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const doConfirm = useConfirm();
  const [showCalc, setShowCalc] = useState(true);
  const [calc, setCalc] = useState({
    dailyWage: '',
    days: '',
    overtimeHours: '',
    overtimeRate: '',
    allowance: '',
    providentFund: '',
    professionalTax: '',
    incomeTax: '',
    otherDeductions: ''
  });
  const resetCalc = () => setCalc({
    dailyWage: '', days: '', overtimeHours: '', overtimeRate: '', allowance: '',
    providentFund: '', professionalTax: '', incomeTax: '', otherDeductions: ''
  });
  const copyNet = (value) => {
    try { navigator.clipboard.writeText(String(value)); } catch (_) { /* ignore */ }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadSalaries(selected);
  }, [selected, year]);

  const loadStaff = async () => {
    try {
      const res = await fetch(`${API}/api/users`, { headers: authHeaders() });
      const data = await res.json();
      const arr = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data)
        ? data
        : [];
      setStaff(arr.filter(u => u.role === 'delivery_staff' || u.role === 'lab'));
    } catch {
      setStaff([]);
    }
  };

  const loadSalaries = async staffId => {
    if (!staffId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/salary/history/${staffId}?year=${year}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setEntries(list);
    } catch (e) {
      setError(e?.message || 'Failed to load salaries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    if (!selected) {
      setError('Select a staff');
      return;
    }
    const ok = await doConfirm('Generate Salary', `Generate salary for ${month}/${year}?`);
    if (!ok) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API}/api/salary/generate/${selected}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ month, year }),
      });
      if (!res.ok) throw new Error(`Generate failed (${res.status})`);
      await loadSalaries(selected);
    } catch (e) {
      setError(e?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const approve = async salaryId => {
    const ok = await doConfirm('Approve Salary', 'Mark this salary as approved?');
    if (!ok) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API}/api/salary/approve/${salaryId}`, {
        method: 'PUT',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Approve failed (${res.status})`);
      await loadSalaries(selected);
    } catch (e) {
      setError(e?.message || 'Approve failed');
    } finally {
      setLoading(false);
    }
  };

  const pay = async salaryId => {
    const method = window.prompt('Enter payment method (e.g., cash, bank, upi)');
    if (!method) return;
    const ref = window.prompt('Payment reference (optional)') || '';
    const ok = await doConfirm('Mark as Paid', `Mark this salary as PAID via ${method}?`);
    if (!ok) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API}/api/salary/pay/${salaryId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ paymentMethod: method, paymentReference: ref }),
      });
      if (!res.ok) throw new Error(`Pay failed (${res.status})`);
      await loadSalaries(selected);
    } catch (e) {
      setError(e?.message || 'Pay failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Salaries (Delivery + Lab)</h2>

      {error && <div style={{ color: 'tomato', marginBottom: 8 }}>{error}</div>}

      <div className="dash-card" style={{ padding: 12, marginBottom: 12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Wage Calculator</h3>
          <button className="btn btn-outline" onClick={()=>setShowCalc(s=>!s)}>{showCalc ? 'Hide' : 'Show'}</button>
        </div>
        {showCalc && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="dash-card" style={{ padding: 12 }}>
                <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 14 }}>Earnings</h4>
                <div style={{ display:'grid', gap: 8 }}>
                  <label>Daily Wage
                    <input type="number" min="0" step="0.01" title="Amount per working day"
                      value={calc.dailyWage} onChange={e=>setCalc(c=>({...c, dailyWage:e.target.value}))} placeholder="0.00" />
                  </label>
                  <label>Days
                    <input type="number" min="0" step="1" title="Count of payable days"
                      value={calc.days} onChange={e=>setCalc(c=>({...c, days:e.target.value}))} placeholder="0" />
                  </label>
                  <label>OT Hours
                    <input type="number" min="0" step="0.25" title="Total overtime hours"
                      value={calc.overtimeHours} onChange={e=>setCalc(c=>({...c, overtimeHours:e.target.value}))} placeholder="0" />
                  </label>
                  <label>OT Rate
                    <input type="number" min="0" step="0.01" title="Amount per OT hour"
                      value={calc.overtimeRate} onChange={e=>setCalc(c=>({...c, overtimeRate:e.target.value}))} placeholder="0.00" />
                  </label>
                  <label>Allowance
                    <input type="number" min="0" step="0.01" title="Fixed allowances for the period"
                      value={calc.allowance} onChange={e=>setCalc(c=>({...c, allowance:e.target.value}))} placeholder="0.00" />
                  </label>
                </div>
              </div>
              <div className="dash-card" style={{ padding: 12 }}>
                <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 14 }}>Deductions</h4>
                <div style={{ display:'grid', gap: 8 }}>
                  <label>PF
                    <input type="number" min="0" step="0.01" title="Provident Fund"
                      value={calc.providentFund} onChange={e=>setCalc(c=>({...c, providentFund:e.target.value}))} placeholder="0.00" />
                  </label>
                  <label>Professional Tax
                    <input type="number" min="0" step="0.01" title="Professional tax"
                      value={calc.professionalTax} onChange={e=>setCalc(c=>({...c, professionalTax:e.target.value}))} placeholder="0.00" />
                  </label>
                  <label>Income Tax
                    <input type="number" min="0" step="0.01" title="Income tax"
                      value={calc.incomeTax} onChange={e=>setCalc(c=>({...c, incomeTax:e.target.value}))} placeholder="0.00" />
                  </label>
                  <label>Other Deductions
                    <input type="number" min="0" step="0.01" title="Any other deductions"
                      value={calc.otherDeductions} onChange={e=>setCalc(c=>({...c, otherDeductions:e.target.value}))} placeholder="0.00" />
                  </label>
                </div>
              </div>
            </div>
            {(() => {
              const n = v => Number(v) || 0;
              const gross = n(calc.dailyWage) * n(calc.days) + n(calc.overtimeHours) * n(calc.overtimeRate) + n(calc.allowance);
              const deductions = n(calc.providentFund) + n(calc.professionalTax) + n(calc.incomeTax) + n(calc.otherDeductions);
              const net = gross - deductions;
              return (
                <div style={{ display:'flex', gap:16, marginTop:12, flexWrap:'wrap', alignItems:'center' }}>
                  <div className="dash-card" style={{ minWidth: 160 }}>
                    <div>Gross</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{gross.toFixed(2)}</div>
                  </div>
                  <div className="dash-card" style={{ minWidth: 160 }}>
                    <div>Deductions</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{deductions.toFixed(2)}</div>
                  </div>
                  <div className="dash-card" style={{ minWidth: 160 }}>
                    <div>Net</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{net.toFixed(2)}</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-outline" type="button" onClick={resetCalc}>Reset</button>
                    <button className="btn" type="button" onClick={()=>copyNet(net.toFixed(2))} title="Copy net to clipboard">Copy Net</button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select Staff</option>
          {staff.map(s => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.role})
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          style={{ width: 90 }}
        />
        <input
          type="number"
          min="2020"
          max="2100"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ width: 110 }}
        />
        <button className="btn" onClick={generate} disabled={loading}>
          Generate
        </button>
      </div>

      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 980 }}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Net</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => {
              const deductions =
                (e.providentFund || 0) +
                (e.professionalTax || 0) +
                (e.incomeTax || 0) +
                (e.otherDeductions || 0);
              return (
                <tr key={e._id || idx}>
                  <td>{e.month}</td>
                  <td>{e.year}</td>
                  <td>{e.grossSalary || '-'}</td>
                  <td>{deductions}</td>
                  <td>{e.netSalary ?? e.netPay ?? '-'}</td>
                  <td>
                    <span className={`badge status-${(e.status || 'draft').toLowerCase()}`}>
                      {e.status || 'draft'}
                    </span>
                  </td>
                  <td>{e.updatedAt ? new Date(e.updatedAt).toLocaleString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {e.status === 'draft' && (
                        <button className="btn" onClick={() => approve(e._id)}>
                          Approve
                        </button>
                      )}
                      {e.status === 'approved' && (
                        <>
                          <button className="btn" onClick={() => pay(e._id)}>
                            Mark Paid
                          </button>
                          <a
                            className="btn"
                            href={`${API}/api/salary/payslip/${e._id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Payslip
                          </a>
                        </>
                      )}
                      {e.status === 'paid' && (
                        <>
                          <span style={{ color: '#16a34a' }}>Paid</span>
                          <a
                            className="btn"
                            href={`${API}/api/salary/payslip/${e._id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Payslip
                          </a>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {entries.length === 0 && !loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: '#6b7280' }}>
                  No salary records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountantSalaries;
