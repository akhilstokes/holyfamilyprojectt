import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const AdminMonthlyWageManagement = () => {
  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  const [salaryForm, setSalaryForm] = useState({ monthlySalary: '' });
  const [calculation, setCalculation] = useState(null);
  const [stats, setStats] = useState(null);
  const [wageTypeFilter, setWageTypeFilter] = useState('monthly'); // 'monthly' | 'daily' | 'all'

  useEffect(() => {
    loadWorkers();
    loadStats();
  }, [searchTerm, currentYear, currentMonth, wageTypeFilter]);

  useEffect(() => {
    if (selectedWorker) calculate();
  }, [selectedWorker, currentYear, currentMonth]);

  const loadWorkers = async () => {
    try {
      const res = await fetch(`${base}/api/monthly-wage/workers?search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      let list = data.data || [];
      if (wageTypeFilter !== 'all') {
        list = list.filter(w => (w.wageType || 'monthly') === wageTypeFilter);
      }
      setWorkers(list);
    } catch (e) {
      toast.error('Failed to load workers');
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${base}/api/monthly-wage/stats?year=${currentYear}&month=${currentMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data.data || null);
    } catch (e) {
      // ignore
    }
  };

  const calculate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/monthly-wage/calculate/${selectedWorker}?year=${currentYear}&month=${currentMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCalculation(data.data || null);
    } catch (e) {
      toast.error('Failed to calculate salary');
    } finally {
      setLoading(false);
    }
  };

  const handleSetMonthly = async (e) => {
    e.preventDefault();
    if (!selectedWorker || !salaryForm.monthlySalary) {
      toast.error('Select worker and enter monthly salary');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/monthly-wage/salary/${selectedWorker}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monthlySalary: Number(salaryForm.monthlySalary) })
      });
      if (res.ok) {
        toast.success('Monthly salary updated');
        setSalaryForm({ monthlySalary: '' });
        loadWorkers();
        calculate();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to set salary');
      }
    } catch (e) {
      toast.error('Failed to set salary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top controls */}
      <div className="row mb-3 align-items-center">
        <div className="col-lg-4 col-md-12 mb-2 mb-lg-0">
          <h4 style={{ margin: 0 }}>Monthly Wage Workers</h4>
        </div>
        <div className="col-lg-8 col-md-12">
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <input
              className="form-control"
              placeholder="Search workers"
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              style={{ minWidth: 220 }}
            />
            <select className="form-control" style={{ width: 160 }} value={wageTypeFilter} onChange={(e)=>setWageTypeFilter(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
              <option value="all">All</option>
            </select>
            <input type="number" className="form-control" style={{ width: 110 }} value={currentYear} onChange={(e)=>setCurrentYear(Number(e.target.value))} />
            <select className="form-control" style={{ width: 160 }} value={currentMonth} onChange={(e)=>setCurrentMonth(Number(e.target.value))}>
              {Array.from({length:12}, (_,i)=> <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('default',{month:'long'})}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card"><div className="card-body"><div className="muted">Total Workers</div><div style={{ fontSize: 18, fontWeight: 700 }}>{stats?.totalWorkers || 0}</div></div></div>
        </div>
        <div className="col-md-3">
          <div className="card"><div className="card-body"><div className="muted">Avg Monthly Salary</div><div style={{ fontSize: 18, fontWeight: 700 }}>₹{stats?.avgMonthlySalary ? Math.round(stats.avgMonthlySalary) : 0}</div></div></div>
        </div>
        <div className="col-md-6">
          <div className="card"><div className="card-body" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><div className="muted">Gross</div><div style={{ fontWeight: 700 }}>₹{stats?.currentMonth?.totalGrossSalary || 0}</div></div>
            <div><div className="muted">Received</div><div style={{ fontWeight: 700, color: '#059669' }}>₹{stats?.currentMonth?.totalReceived || 0}</div></div>
            <div><div className="muted">Pending</div><div style={{ fontWeight: 700, color: '#b91c1c' }}>₹{stats?.currentMonth?.totalPending || 0}</div></div>
          </div></div>
        </div>
      </div>

      <div className="row">
        {/* Worker list and set salary */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header"><h5 style={{ margin: 0 }}>Select Worker</h5></div>
            <div className="card-body">
              <select className="form-control" value={selectedWorker} onChange={(e)=>setSelectedWorker(e.target.value)}>
                <option value="">Select</option>
                {workers.map(w => (
                  <option key={w._id} value={w._id}>{w.name} — ₹{w.monthlySalary || 0}/mo</option>
                ))}
              </select>

              <form className="mt-3" onSubmit={handleSetMonthly}>
                <label className="muted" style={{ fontWeight: 600 }}>Set Monthly Salary</label>
                <div className="d-flex" style={{ gap: 8 }}>
                  <input type="number" className="form-control" value={salaryForm.monthlySalary} onChange={(e)=>setSalaryForm({ monthlySalary: e.target.value })} placeholder="₹ per month" />
                  <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>

              {/* Workers table */}
              <div className="table-responsive mt-3">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Salary</th>
                      <th>Type</th>
                      <th>Origin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.slice(0, 8).map(w => (
                      <tr key={w._id} style={{ cursor: 'pointer' }} onClick={()=>setSelectedWorker(w._id)}>
                        <td>{w.name}</td>
                        <td>₹{w.monthlySalary || 0}</td>
                        <td>
                          <span className={`badge ${ (w.wageType||'monthly') === 'monthly' ? 'badge-primary' : 'badge-info'}`}>
                            {(w.wageType||'monthly').toUpperCase()}
                          </span>
                        </td>
                        <td>{w.origin}</td>
                      </tr>
                    ))}
                    {workers.length === 0 && <tr><td colSpan={4}>No workers found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation panel */}
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header"><h5 style={{ margin: 0 }}>Monthly Calculation</h5></div>
            <div className="card-body">
              {calculation ? (
                <div className="row">
                  <div className="col-md-6">
                    <div className="dash-card" style={{ padding: 12 }}>
                      <p><strong>Working Days:</strong> {calculation.calculation?.workingDays}</p>
                      <p><strong>Base Salary:</strong> ₹{calculation.calculation?.baseSalary}</p>
                      <p><strong>Gross Salary:</strong> ₹{calculation.calculation?.grossSalary}</p>
                      <p><strong>Net Salary:</strong> ₹{calculation.calculation?.netSalary}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="dash-card" style={{ padding: 12 }}>
                      <p><strong>Benefits:</strong> ₹{calculation.calculation?.totalBenefits || 0}</p>
                      <p><strong>Bonuses:</strong> ₹{calculation.calculation?.totalBonuses || 0}</p>
                      <p><strong>Deductions:</strong> ₹{calculation.calculation?.totalDeductions || 0}</p>
                      <button className="btn btn-outline-secondary" onClick={calculate} disabled={loading}>Recalculate</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-info">Select a worker to see monthly calculation.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMonthlyWageManagement;


