import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './UnifiedStaffSalary.css';

const UnifiedStaffSalary = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('current');
  const [salaryData, setSalaryData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Salary table data - initially empty, will be populated by manager
  const [salaryTableData, setSalaryTableData] = useState([]);

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

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="unified-salary-container">
      <div className="salary-card-wrapper">
        <div className="salary-main-card">
          <div className="salary-header">
            <h3>{viewTitle}</h3>
            <div className="view-toggle-group">
                  <button
                className={`view-toggle-btn ${activeView === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveView('current')}
                  >
                    Current Period
                  </button>
                  <button
                className={`view-toggle-btn ${activeView === 'table' ? 'active' : ''}`}
                    onClick={() => setActiveView('table')}
                  >
                    Salary Table
                  </button>
                  <button
                className={`view-toggle-btn ${activeView === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveView('history')}
                  >
                    History
                  </button>
              </div>
            </div>

          <div className="salary-body">
              {/* Role-based salary type indicator */}
            <div className="salary-type-info">
                <h5><i className="fas fa-info-circle"></i> Your Salary Type</h5>
              <p>
                  <strong>Role:</strong> {user?.role?.replace('_', ' ').toUpperCase()} |
                  <strong> Payment Type:</strong> {salaryType === 'daily' ? 'Daily Wage' : 'Monthly Salary'}
                </p>
              <small>
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
                <div className="no-data-message">
                    <h5>No Salary Data Available</h5>
                    <p>Please contact HR to set up your salary structure.</p>
                  </div>
                )
              ) : activeView === 'table' ? (
                <SalaryTableView salaryTableData={salaryTableData} />
              ) : (
                <UnifiedSalaryHistoryView history={history} salaryType={salaryType} />
              )}
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
      <div className="salary-cards-grid">
        <div className="salary-detail-card">
          <h5>💰 Daily Wage Details</h5>
          <div className="salary-row">
            <span className="salary-label">Working Days</span>
            <span className="salary-value">{salaryData.salary?.workingDays || 0}</span>
          </div>
          <div className="salary-row">
            <span className="salary-label">Daily Wage</span>
            <span className="salary-value">₹{salaryData.salary?.dailyWage?.toLocaleString() || '0'}</span>
          </div>
          <div className="salary-row">
            <span className="salary-label">Gross Salary</span>
            <span className="salary-value positive">₹{salaryData.salary?.grossSalary?.toLocaleString() || '0'}</span>
          </div>
          {salaryData.salary?.totalBenefits > 0 && (
            <div className="salary-row">
              <span className="salary-label">Total Benefits</span>
              <span className="salary-value positive">₹{salaryData.salary.totalBenefits?.toLocaleString()}</span>
            </div>
              )}
            </div>
        <div className="salary-detail-card">
          <h5>📊 Payment Summary</h5>
          <div className="salary-row">
            <span className="salary-label">Received</span>
            <span className="salary-value positive">₹{salaryData.salary?.receivedAmount?.toLocaleString() || '0'}</span>
          </div>
          <div className="salary-row">
            <span className="salary-label">Advance</span>
            <span className="salary-value">₹{salaryData.salary?.advanceAmount?.toLocaleString() || '0'}</span>
        </div>
          <div className="salary-row">
            <span className="salary-label">Bonus</span>
            <span className="salary-value positive">₹{salaryData.salary?.bonusAmount?.toLocaleString() || '0'}</span>
            </div>
          <div className="salary-row">
            <span className="salary-label">Deductions</span>
            <span className="salary-value negative">₹{salaryData.salary?.deductionAmount?.toLocaleString() || '0'}</span>
            </div>
          <hr className="salary-divider" />
          <div className="salary-row salary-total-row">
            <span className="salary-label">Pending</span>
            <span className="salary-value">₹{salaryData.salary?.pendingAmount?.toLocaleString() || '0'}</span>
          </div>
        </div>
      </div>
    );
  } else {
    // Monthly salary view
    return (
      <div className="salary-cards-grid">
        <div className="salary-detail-card">
          <h5>💰 Salary Breakdown</h5>
          <div className="salary-row">
            <span className="salary-label">Basic Salary</span>
            <span className="salary-value">₹{salaryData.salary?.basicSalary?.toLocaleString() || '0'}</span>
            </div>
          <div className="salary-row">
            <span className="salary-label">House Rent Allowance</span>
            <span className="salary-value">₹{salaryData.salary?.houseRentAllowance?.toLocaleString() || '0'}</span>
                </div>
          <div className="salary-row">
            <span className="salary-label">Medical Allowance</span>
            <span className="salary-value">₹{salaryData.salary?.medicalAllowance?.toLocaleString() || '0'}</span>
                </div>
          <div className="salary-row">
            <span className="salary-label">Transport Allowance</span>
            <span className="salary-value">₹{salaryData.salary?.transportAllowance?.toLocaleString() || '0'}</span>
                </div>
          <div className="salary-row">
            <span className="salary-label">Special Allowance</span>
            <span className="salary-value">₹{salaryData.salary?.specialAllowance?.toLocaleString() || '0'}</span>
                </div>
          <div className="salary-row">
            <span className="salary-label">Bonus</span>
            <span className="salary-value positive">₹{salaryData.salary?.bonus?.toLocaleString() || '0'}</span>
                </div>
          <div className="salary-row">
            <span className="salary-label">Overtime</span>
            <span className="salary-value positive">₹{salaryData.salary?.overtime?.toLocaleString() || '0'}</span>
                </div>
          <hr className="salary-divider" />
          <div className="salary-row salary-total-row">
            <span className="salary-label">Gross Salary</span>
            <span className="salary-value positive">₹{salaryData.salary?.grossSalary?.toLocaleString() || '0'}</span>
          </div>
        </div>
        <div className="salary-detail-card">
          <h5>📉 Deductions & Net Salary</h5>
          <div className="salary-row">
            <span className="salary-label">Provident Fund</span>
            <span className="salary-value negative">₹{salaryData.salary?.providentFund?.toLocaleString() || '0'}</span>
            </div>
          <div className="salary-row">
            <span className="salary-label">Professional Tax</span>
            <span className="salary-value negative">₹{salaryData.salary?.professionalTax?.toLocaleString() || '0'}</span>
                </div>
          <div className="salary-row">
            <span className="salary-label">Income Tax</span>
            <span className="salary-value negative">₹{salaryData.salary?.incomeTax?.toLocaleString() || '0'}</span>
                </div>
          <div className="salary-row">
            <span className="salary-label">Other Deductions</span>
            <span className="salary-value negative">₹{salaryData.salary?.otherDeductions?.toLocaleString() || '0'}</span>
                </div>
          <hr className="salary-divider" />
          <div className="salary-row salary-total-row">
            <span className="salary-label">Net Salary</span>
            <span className="salary-value positive">₹{salaryData.salary?.netSalary?.toLocaleString() || '0'}</span>
                </div>
          <span className={`salary-status-badge ${salaryData.salary?.status === 'paid' ? 'paid' : salaryData.salary?.status === 'approved' ? 'approved' : 'draft'}`}>
                    Status: {salaryData.salary?.status?.toUpperCase() || 'DRAFT'}
                  </span>
        </div>
      </div>
    );
  }
};

// Salary Table View Component
const SalaryTableView = ({ salaryTableData }) => {
  return (
    <div className="salary-table-container">
      <div className="salary-table-header-section">
        <h4>💰 My Salary Table</h4>
        <p className="salary-table-description">
          View your salary history with date created, amount, and month details
        </p>
      </div>
      
      <div className="salary-table-wrapper">
        <div className="simple-salary-table">
          <div className="simple-table-header">
            <div className="simple-table-cell header-date">
              <i className="fas fa-calendar-alt"></i>
              <span>Date Created</span>
            </div>
            <div className="simple-table-cell header-amount">
              <i className="fas fa-rupee-sign"></i>
              <span>Amount</span>
            </div>
            <div className="simple-table-cell header-month">
              <i className="fas fa-calendar-check"></i>
              <span>Month</span>
            </div>
          </div>
          
          {salaryTableData && salaryTableData.length > 0 ? (
            <div className="table-body">
              {salaryTableData.map((row, index) => (
                <div key={index} className="simple-table-row">
                  <div className="simple-table-cell data-cell">
                    <span className="cell-label">Date:</span>
                    <span className="cell-value">{row.dateCreated}</span>
                  </div>
                  <div className="simple-table-cell data-cell amount-cell">
                    <span className="cell-label">Amount:</span>
                    <span className="cell-value amount-value">₹{row.amount.toLocaleString()}</span>
                  </div>
                  <div className="simple-table-cell data-cell">
                    <span className="cell-label">Month:</span>
                    <span className="cell-value month-value">{row.month}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-salary-data">
              <div className="no-data-message-table">
                <div className="no-data-icon">
                  <i className="fas fa-inbox"></i>
                </div>
                <h5>No Salary Data Available</h5>
                <p>Salary information will be updated by the manager.</p>
                <p>Please contact HR or your manager for salary details.</p>
                <div className="contact-info">
                  <button className="contact-btn">
                    <i className="fas fa-phone"></i>
                    Contact HR
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Unified Salary History View
const UnifiedSalaryHistoryView = ({ history, salaryType }) => {
  return (
    <div className="history-container">
      <h4>📋 Salary History ({salaryType === 'daily' ? 'Daily Wage' : 'Monthly Salary'})</h4>
      <div className="table-responsive">
        <table className="salary-history-table">
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
            {history.map((record) => (
              <tr key={record._id}>
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
                  <span className={`table-badge ${record.status === 'paid' ? 'success' : record.status === 'approved' ? 'info' : 'warning'}`}>
                    {record.status?.toUpperCase() || 'PENDING'}
                  </span>
                </td>
                <td>
                  {(record.status === 'paid' || record.status === 'approved') && (
                    <button className="download-btn">
                      <i className="fas fa-download"></i> Download
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-history-message">
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
