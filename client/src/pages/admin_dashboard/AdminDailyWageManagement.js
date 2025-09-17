import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminDailyWageManagement = () => {
  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [activeTab, setActiveTab] = useState('workers');
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState('');

  // Daily wage form state
  const [wageForm, setWageForm] = useState({
    dailyWage: ''
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: 'received',
    note: ''
  });

  // Salary calculation state
  const [salaryCalculation, setSalaryCalculation] = useState(null);

  // Statistics state
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadWorkers();
    loadStats();
  }, [currentYear, currentMonth]);

  useEffect(() => {
    if (selectedWorker) {
      loadSalaryCalculation();
    }
  }, [selectedWorker, currentYear, currentMonth]);

  const loadWorkers = async () => {
    try {
      const response = await fetch(`${base}/api/daily-wage/workers?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setWorkers(data.data || []);
    } catch (error) {
      toast.error('Failed to load workers');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${base}/api/daily-wage/stats?year=${currentYear}&month=${currentMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadSalaryCalculation = async () => {
    try {
      const response = await fetch(`${base}/api/daily-wage/calculate/${selectedWorker}?year=${currentYear}&month=${currentMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSalaryCalculation(data.data);
    } catch (error) {
      console.error('Failed to load salary calculation:', error);
    }
  };

  const handleSetDailyWage = async (e) => {
    e.preventDefault();
    if (!selectedWorker || !wageForm.dailyWage) {
      toast.error('Please select a worker and enter daily wage');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/daily-wage/wage/${selectedWorker}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(wageForm)
      });

      if (response.ok) {
        toast.success('Daily wage updated successfully');
        setWageForm({ dailyWage: '' });
        loadWorkers();
        loadSalaryCalculation();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update daily wage');
      }
    } catch (error) {
      toast.error('Failed to update daily wage');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedWorker || !paymentForm.amount) {
      toast.error('Please select a worker and enter amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/daily-wage/payment/${selectedWorker}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          year: currentYear,
          month: currentMonth,
          ...paymentForm
        })
      });

      if (response.ok) {
        toast.success('Payment recorded successfully');
        setPaymentForm({ amount: '', type: 'received', note: '' });
        loadSalaryCalculation();
        loadStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to record payment');
      }
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdateWages = async (updates) => {
    setLoading(true);
    try {
      const response = await fetch(`${base}/api/daily-wage/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadWorkers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update wages');
      }
    } catch (error) {
      toast.error('Failed to update wages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Daily Wage Management</h3>
              <div className="card-tools">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${activeTab === 'workers' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('workers')}
                  >
                    Workers
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeTab === 'wages' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('wages')}
                  >
                    Set Wages
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('payments')}
                  >
                    Record Payments
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('stats')}
                  >
                    Statistics
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Workers Tab */}
              {activeTab === 'workers' && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h4>Daily Wage Workers</h4>
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search workers..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setTimeout(() => loadWorkers(), 500);
                        }}
                      />
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Contact</th>
                          <th>Daily Wage</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workers.map((worker) => (
                          <tr key={worker._id}>
                            <td>{worker.name}</td>
                            <td>{worker.user?.email}</td>
                            <td>{worker.contactNumber}</td>
                            <td>₹{worker.dailyWage?.toLocaleString()}</td>
                            <td>
                              <span className={`badge ${worker.isActive ? 'badge-success' : 'badge-danger'}`}>
                                {worker.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setSelectedWorker(worker._id);
                                  setWageForm({ dailyWage: worker.dailyWage });
                                  setActiveTab('wages');
                                }}
                              >
                                Set Wage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Set Wages Tab */}
              {activeTab === 'wages' && (
                <div>
                  <h4>Set Daily Wage</h4>
                  <form onSubmit={handleSetDailyWage}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Select Worker</label>
                          <select
                            className="form-control"
                            value={selectedWorker}
                            onChange={(e) => {
                              setSelectedWorker(e.target.value);
                              const worker = workers.find(w => w._id === e.target.value);
                              if (worker) {
                                setWageForm({ dailyWage: worker.dailyWage });
                              }
                            }}
                            required
                          >
                            <option value="">Select Worker</option>
                            {workers.map((worker) => (
                              <option key={worker._id} value={worker._id}>
                                {worker.name} - Current: ₹{worker.dailyWage}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Daily Wage (₹)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={wageForm.dailyWage}
                            onChange={(e) => setWageForm({...wageForm, dailyWage: e.target.value})}
                            required
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Daily Wage'}
                    </button>
                  </form>
                </div>
              )}

              {/* Record Payments Tab */}
              {activeTab === 'payments' && (
                <div>
                  <h4>Record Payment</h4>
                  <form onSubmit={handleRecordPayment}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Select Worker</label>
                          <select
                            className="form-control"
                            value={selectedWorker}
                            onChange={(e) => setSelectedWorker(e.target.value)}
                            required
                          >
                            <option value="">Select Worker</option>
                            {workers.map((worker) => (
                              <option key={worker._id} value={worker._id}>
                                {worker.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Year</label>
                          <input
                            type="number"
                            className="form-control"
                            value={currentYear}
                            onChange={(e) => setCurrentYear(Number(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Month</label>
                          <select
                            className="form-control"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(Number(e.target.value))}
                            required
                          >
                            {Array.from({length: 12}, (_, i) => (
                              <option key={i+1} value={i+1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Payment Type</label>
                          <select
                            className="form-control"
                            value={paymentForm.type}
                            onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                            required
                          >
                            <option value="received">Payment Received</option>
                            <option value="advance">Advance Payment</option>
                            <option value="bonus">Bonus</option>
                            <option value="deduction">Deduction</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Amount (₹)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                            required
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Note</label>
                          <input
                            type="text"
                            className="form-control"
                            value={paymentForm.note}
                            onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})}
                            placeholder="Optional note"
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-success" disabled={loading}>
                      {loading ? 'Recording...' : 'Record Payment'}
                    </button>
                  </form>

                  {/* Salary Calculation Display */}
                  {salaryCalculation && (
                    <div className="mt-4">
                      <h5>Salary Calculation for {salaryCalculation.worker.name}</h5>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6>Current Month Details</h6>
                              <p><strong>Working Days:</strong> {salaryCalculation.month.workingDays}</p>
                              <p><strong>Daily Wage:</strong> ₹{salaryCalculation.month.dailyWage}</p>
                              <p><strong>Gross Salary:</strong> ₹{salaryCalculation.month.grossSalary}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6>Payment Summary</h6>
                              <p><strong>Received:</strong> ₹{salaryCalculation.month.receivedAmount}</p>
                              <p><strong>Advance:</strong> ₹{salaryCalculation.month.advanceAmount}</p>
                              <p><strong>Bonus:</strong> ₹{salaryCalculation.month.bonusAmount}</p>
                              <p><strong>Deductions:</strong> ₹{salaryCalculation.month.deductionAmount}</p>
                              <p><strong>Pending:</strong> ₹{salaryCalculation.month.pendingAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'stats' && (
                <div>
                  <h4>Daily Wage Statistics</h4>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control d-inline-block"
                        style={{width: '100px'}}
                        value={currentYear}
                        onChange={(e) => setCurrentYear(Number(e.target.value))}
                      />
                      <select
                        className="form-control d-inline-block ml-2"
                        style={{width: '120px'}}
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(Number(e.target.value))}
                      >
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={i+1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {stats && (
                    <div className="row">
                      <div className="col-md-3">
                        <div className="card bg-primary text-white">
                          <div className="card-body">
                            <h5>Total Workers</h5>
                            <h3>{stats.totalWorkers}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-info text-white">
                          <div className="card-body">
                            <h5>Avg Daily Wage</h5>
                            <h3>₹{stats.avgDailyWage}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-success text-white">
                          <div className="card-body">
                            <h5>Total Gross Salary</h5>
                            <h3>₹{stats.currentMonth.totalGrossSalary?.toLocaleString()}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-warning text-white">
                          <div className="card-body">
                            <h5>Total Pending</h5>
                            <h3>₹{stats.currentMonth.totalPending?.toLocaleString()}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDailyWageManagement;






