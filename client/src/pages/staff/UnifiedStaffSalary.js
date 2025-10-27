import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const UnifiedStaffSalary = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('current');
  const [salaryData, setSalaryData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Determine salary type based on user role
  const getSalaryType = (role) => {
    switch (role) {
      case 'delivery_staff':
        return 'daily';
      case 'field_staff':
        return 'daily';
      case 'lab':
      case 'lab_staff':
      case 'lab_manager':
        return 'monthly';
      default:
        return 'monthly'; // Default to monthly for admin, manager, accountant, etc.
    }
  };

  const getSalaryViewTitle = (role) => {
    switch (role) {
      case 'delivery_staff':
        return 'Daily Wage System';
      case 'field_staff':
        return 'Daily Wage System';
      case 'lab':
      case 'lab_staff':
      case 'lab_manager':
        return 'Monthly Salary System';
      default:
        return 'Salary System';
    }
  };

  const salaryType = getSalaryType(user?.role);
  const viewTitle = getSalaryViewTitle(user?.role);

  useEffect(() => {
    const loadSalaryData = async () => {
      if (!user?._id) return;

      setLoading(true);
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');

        const res = await fetch(`${base}/api/unified-salary/unified`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setSalaryData(data.data);
        }
      } catch (error) {
        console.error('Error loading salary data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSalaryData();
  }, [user]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?._id) return;

      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');

        const res = await fetch(`${base}/api/unified-salary/unified/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setHistory(data.data || []);
        }
      } catch (error) {
        console.error('Error loading salary history:', error);
      }
    };

    loadHistory();
  }, [user]);

  if (loading) return <div className="text-center"><div className="spinner-border"></div></div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{viewTitle}</h3>
              <div className="card-tools">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${activeView === 'current' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveView('current')}
                  >
                    Current Period
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeView === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveView('history')}
                  >
                    History
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Role-based salary type indicator */}
              <div className="alert alert-info mb-4">
                <h5><i className="fas fa-info-circle"></i> Your Salary Type</h5>
                <p className="mb-0">
                  <strong>Role:</strong> {user?.role?.replace('_', ' ').toUpperCase()} |
                  <strong> Payment Type:</strong> {salaryType === 'daily' ? 'Daily Wage' : 'Monthly Salary'}
                </p>
                <small className="text-muted">
                  {salaryType === 'daily'
                    ? 'Your salary is calculated based on daily attendance and wage rate.'
                    : 'Your salary is calculated based on monthly salary template and allowances.'
                  }
                </small>
              </div>

              {/* Render appropriate salary view based on role */}
              {activeView === 'current' ? (
                salaryData ? (
                  <CurrentSalaryView salaryData={salaryData} salaryType={salaryType} />
                ) : (
                  <div className="alert alert-info">
                    <h5>No Salary Data Available</h5>
                    <p>Please contact HR to set up your salary structure.</p>
                  </div>
                )
              ) : (
                <UnifiedSalaryHistoryView history={history} salaryType={salaryType} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Current Salary View Component
const CurrentSalaryView = ({ salaryData, salaryType }) => {
  if (salaryType === 'daily') {
    return (
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Daily Wage Details</h5>
            </div>
            <div className="card-body">
              <p><strong>Working Days:</strong> {salaryData.salary?.workingDays || 0}</p>
              <p><strong>Daily Wage:</strong> ₹{salaryData.salary?.dailyWage?.toLocaleString() || '0'}</p>
              <p><strong>Gross Salary:</strong> ₹{salaryData.salary?.grossSalary?.toLocaleString() || '0'}</p>
              {salaryData.salary?.totalBenefits > 0 && (
                <p><strong>Total Benefits:</strong> ₹{salaryData.salary.totalBenefits?.toLocaleString()}</p>
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
              <p><strong>Received:</strong> ₹{salaryData.salary?.receivedAmount?.toLocaleString() || '0'}</p>
              <p><strong>Advance:</strong> ₹{salaryData.salary?.advanceAmount?.toLocaleString() || '0'}</p>
              <p><strong>Bonus:</strong> ₹{salaryData.salary?.bonusAmount?.toLocaleString() || '0'}</p>
              <p><strong>Deductions:</strong> ₹{salaryData.salary?.deductionAmount?.toLocaleString() || '0'}</p>
              <p><strong>Pending:</strong> ₹{salaryData.salary?.pendingAmount?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Monthly salary view
    return (
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Salary Breakdown</h5>
            </div>
            <div className="card-body">
              <div className="salary-breakdown">
                <div className="d-flex justify-content-between">
                  <span>Basic Salary:</span>
                  <span>₹{salaryData.salary?.basicSalary?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>House Rent Allowance:</span>
                  <span>₹{salaryData.salary?.houseRentAllowance?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Medical Allowance:</span>
                  <span>₹{salaryData.salary?.medicalAllowance?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Transport Allowance:</span>
                  <span>₹{salaryData.salary?.transportAllowance?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Special Allowance:</span>
                  <span>₹{salaryData.salary?.specialAllowance?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Bonus:</span>
                  <span>₹{salaryData.salary?.bonus?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Overtime:</span>
                  <span>₹{salaryData.salary?.overtime?.toLocaleString() || '0'}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between font-weight-bold">
                  <span>Gross Salary:</span>
                  <span>₹{salaryData.salary?.grossSalary?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Deductions & Net Salary</h5>
            </div>
            <div className="card-body">
              <div className="deductions-net">
                <div className="d-flex justify-content-between text-danger">
                  <span>Provident Fund:</span>
                  <span>₹{salaryData.salary?.providentFund?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between text-danger">
                  <span>Professional Tax:</span>
                  <span>₹{salaryData.salary?.professionalTax?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between text-danger">
                  <span>Income Tax:</span>
                  <span>₹{salaryData.salary?.incomeTax?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between text-danger">
                  <span>Other Deductions:</span>
                  <span>₹{salaryData.salary?.otherDeductions?.toLocaleString() || '0'}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between font-weight-bold text-success">
                  <span>Net Salary:</span>
                  <span>₹{salaryData.salary?.netSalary?.toLocaleString() || '0'}</span>
                </div>
                <div className="mt-2">
                  <span className={`badge badge-${salaryData.salary?.status === 'paid' ? 'success' : salaryData.salary?.status === 'approved' ? 'info' : 'warning'}`}>
                    Status: {salaryData.salary?.status?.toUpperCase() || 'DRAFT'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Unified Salary History View
const UnifiedSalaryHistoryView = ({ history, salaryType }) => {
  return (
    <div>
      <h4>Salary History ({salaryType === 'daily' ? 'Daily Wage' : 'Monthly Salary'})</h4>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Period</th>
              <th>Type</th>
              <th>Working Days</th>
              <th>Gross Amount</th>
              <th>Net Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={record._id || `history-${record.month}-${record.year}-${index}`}>
                <td>
                  {salaryType === 'daily'
                    ? `${record.month}/${record.year}`
                    : new Date(record.year, record.month - 1).toLocaleString('default', {
                        month: 'short',
                        year: 'numeric'
                      })
                  }
                </td>
                <td>{salaryType === 'daily' ? 'Daily Wage' : 'Monthly Salary'}</td>
                <td>{record.workingDays || '-'}</td>
                <td>₹{record.grossSalary?.toLocaleString() || '-'}</td>
                <td>₹{record.netSalary?.toLocaleString() || record.pendingAmount?.toLocaleString() || '-'}</td>
                <td>
                  <span className={`badge badge-${record.status === 'paid' ? 'success' : record.status === 'approved' ? 'info' : 'warning'}`}>
                    {record.status?.toUpperCase() || 'PENDING'}
                  </span>
                </td>
                <td>
                  {(record.status === 'paid' || record.status === 'approved') && (
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="fas fa-download"></i> Download
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No salary history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnifiedStaffSalary;
