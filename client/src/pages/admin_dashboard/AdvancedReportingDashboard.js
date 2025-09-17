import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AdvancedReportingDashboard.css';

const AdvancedReportingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    overview: null,
    attendance: null,
    productivity: null,
    financial: null,
    staff: null
  });

  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const endpoints = {
        overview: '/api/admin/reports/overview',
        attendance: '/api/admin/reports/attendance',
        productivity: '/api/admin/reports/productivity',
        financial: '/api/admin/reports/financial',
        staff: '/api/admin/reports/staff'
      };

      const response = await fetch(`${base}${endpoints[activeTab]}?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(prev => ({ ...prev, [activeTab]: result.data }));
      } else {
        throw new Error('Failed to load data');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const response = await fetch(`${base}/api/admin/reports/export?type=${activeTab}&format=${format}&start=${dateRange.start}&end=${dateRange.end}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}-report-${dateRange.start}-to-${dateRange.end}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-pie' },
    { id: 'attendance', label: 'Attendance', icon: 'fas fa-user-clock' },
    { id: 'productivity', label: 'Productivity', icon: 'fas fa-chart-line' },
    { id: 'financial', label: 'Financial', icon: 'fas fa-dollar-sign' },
    { id: 'staff', label: 'Staff Analytics', icon: 'fas fa-users' }
  ];

  const renderOverviewTab = () => {
    const overview = data.overview;
    if (!overview) return <div className="loading">Loading overview data...</div>;

    return (
      <div className="overview-dashboard">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="metric-content">
              <h3>{overview.totalStaff || 0}</h3>
              <p>Total Staff</p>
              <span className="metric-change positive">+{overview.staffChange || 0} this month</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="metric-content">
              <h3>{overview.avgAttendance || 0}%</h3>
              <p>Avg Attendance</p>
              <span className="metric-change positive">+{overview.attendanceChange || 0}% vs last month</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="metric-content">
              <h3>{overview.productivity || 0}%</h3>
              <p>Productivity</p>
              <span className="metric-change positive">+{overview.productivityChange || 0}% vs last month</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="metric-content">
              <h3>₹{overview.totalPayroll || 0}</h3>
              <p>Total Payroll</p>
              <span className="metric-change negative">+{overview.payrollChange || 0}% vs last month</span>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h4>Attendance Trend</h4>
            <div className="chart-placeholder">
              <i className="fas fa-chart-area"></i>
              <p>Attendance trend chart will be displayed here</p>
            </div>
          </div>

          <div className="chart-card">
            <h4>Staff Distribution</h4>
            <div className="chart-placeholder">
              <i className="fas fa-chart-pie"></i>
              <p>Staff distribution pie chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAttendanceTab = () => {
    const attendance = data.attendance;
    if (!attendance) return <div className="loading">Loading attendance data...</div>;

    return (
      <div className="attendance-dashboard">
        <div className="attendance-summary">
          <div className="summary-card">
            <h4>Daily Attendance Rate</h4>
            <div className="attendance-rate">
              <span className="rate-value">{attendance.dailyRate || 0}%</span>
              <div className="rate-bar">
                <div 
                  className="rate-fill" 
                  style={{ width: `${attendance.dailyRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h4>Late Arrivals</h4>
            <div className="late-arrivals">
              <span className="late-count">{attendance.lateArrivals || 0}</span>
              <span className="late-percentage">
                {attendance.latePercentage || 0}% of total
              </span>
            </div>
          </div>

          <div className="summary-card">
            <h4>Absentees</h4>
            <div className="absentees">
              <span className="absent-count">{attendance.absentees || 0}</span>
              <span className="absent-percentage">
                {attendance.absentPercentage || 0}% of total
              </span>
            </div>
          </div>
        </div>

        <div className="attendance-table">
          <h4>Staff Attendance Details</h4>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Late Days</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {(attendance.staffDetails || []).map((staff, index) => (
                  <tr key={index}>
                    <td>{staff.name}</td>
                    <td>{staff.presentDays}</td>
                    <td>{staff.absentDays}</td>
                    <td>{staff.lateDays}</td>
                    <td>
                      <span className={`attendance-percentage ${staff.attendancePercentage >= 90 ? 'good' : staff.attendancePercentage >= 75 ? 'average' : 'poor'}`}>
                        {staff.attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderProductivityTab = () => {
    const productivity = data.productivity;
    if (!productivity) return <div className="loading">Loading productivity data...</div>;

    return (
      <div className="productivity-dashboard">
        <div className="productivity-metrics">
          <div className="metric-card">
            <h4>Average Daily Output</h4>
            <div className="metric-value">
              <span className="value">{productivity.avgDailyOutput || 0}</span>
              <span className="unit">units/day</span>
            </div>
          </div>

          <div className="metric-card">
            <h4>Efficiency Rate</h4>
            <div className="metric-value">
              <span className="value">{productivity.efficiencyRate || 0}</span>
              <span className="unit">%</span>
            </div>
          </div>

          <div className="metric-card">
            <h4>Quality Score</h4>
            <div className="metric-value">
              <span className="value">{productivity.qualityScore || 0}</span>
              <span className="unit">/100</span>
            </div>
          </div>
        </div>

        <div className="productivity-charts">
          <div className="chart-card">
            <h4>Output Trend</h4>
            <div className="chart-placeholder">
              <i className="fas fa-chart-line"></i>
              <p>Output trend chart will be displayed here</p>
            </div>
          </div>

          <div className="chart-card">
            <h4>Top Performers</h4>
            <div className="top-performers">
              {(productivity.topPerformers || []).map((performer, index) => (
                <div key={index} className="performer-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{performer.name}</span>
                  <span className="score">{performer.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialTab = () => {
    const financial = data.financial;
    if (!financial) return <div className="loading">Loading financial data...</div>;

    return (
      <div className="financial-dashboard">
        <div className="financial-summary">
          <div className="summary-card">
            <h4>Total Payroll Cost</h4>
            <div className="cost-breakdown">
              <div className="cost-item">
                <span className="label">Daily Wages:</span>
                <span className="value">₹{financial.dailyWages || 0}</span>
              </div>
              <div className="cost-item">
                <span className="label">Monthly Salaries:</span>
                <span className="value">₹{financial.monthlySalaries || 0}</span>
              </div>
              <div className="cost-item">
                <span className="label">Overtime:</span>
                <span className="value">₹{financial.overtime || 0}</span>
              </div>
              <div className="cost-item total">
                <span className="label">Total:</span>
                <span className="value">₹{financial.total || 0}</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h4>Cost per Employee</h4>
            <div className="cost-per-employee">
              <span className="cost-value">₹{financial.costPerEmployee || 0}</span>
              <span className="cost-period">per month</span>
            </div>
          </div>
        </div>

        <div className="financial-charts">
          <div className="chart-card">
            <h4>Payroll Trend</h4>
            <div className="chart-placeholder">
              <i className="fas fa-chart-area"></i>
              <p>Payroll trend chart will be displayed here</p>
            </div>
          </div>

          <div className="chart-card">
            <h4>Cost Distribution</h4>
            <div className="chart-placeholder">
              <i className="fas fa-chart-pie"></i>
              <p>Cost distribution pie chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStaffTab = () => {
    const staff = data.staff;
    if (!staff) return <div className="loading">Loading staff analytics...</div>;

    return (
      <div className="staff-dashboard">
        <div className="staff-overview">
          <div className="overview-card">
            <h4>Staff Distribution</h4>
            <div className="distribution">
              <div className="dist-item">
                <span className="label">Field Staff:</span>
                <span className="value">{staff.fieldStaff || 0}</span>
              </div>
              <div className="dist-item">
                <span className="label">Company Staff:</span>
                <span className="value">{staff.companyStaff || 0}</span>
              </div>
              <div className="dist-item">
                <span className="label">Admins:</span>
                <span className="value">{staff.admins || 0}</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <h4>Staff Turnover</h4>
            <div className="turnover">
              <span className="turnover-rate">{staff.turnoverRate || 0}%</span>
              <span className="turnover-period">this year</span>
            </div>
          </div>
        </div>

        <div className="staff-analytics">
          <div className="analytics-card">
            <h4>Performance Distribution</h4>
            <div className="performance-distribution">
              <div className="perf-item excellent">
                <span className="label">Excellent (90%+):</span>
                <span className="value">{staff.excellent || 0}</span>
              </div>
              <div className="perf-item good">
                <span className="label">Good (75-89%):</span>
                <span className="value">{staff.good || 0}</span>
              </div>
              <div className="perf-item average">
                <span className="label">Average (60-74%):</span>
                <span className="value">{staff.average || 0}</span>
              </div>
              <div className="perf-item poor">
                <span className="label">Needs Improvement (&lt;60%):</span>
                <span className="value">{staff.poor || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'attendance':
        return renderAttendanceTab();
      case 'productivity':
        return renderProductivityTab();
      case 'financial':
        return renderFinancialTab();
      case 'staff':
        return renderStaffTab();
      default:
        return <div>Select a tab to view data</div>;
    }
  };

  return (
    <div className="advanced-reporting-dashboard">
      <div className="dashboard-header">
        <h2>Advanced Reporting Dashboard</h2>
        <div className="header-controls">
          <div className="date-range">
            <label>Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div className="export-buttons">
            <button 
              className="btn btn-outline-primary"
              onClick={() => exportReport('pdf')}
            >
              <i className="fas fa-file-pdf"></i> Export PDF
            </button>
            <button 
              className="btn btn-outline-success"
              onClick={() => exportReport('excel')}
            >
              <i className="fas fa-file-excel"></i> Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            Loading data...
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default AdvancedReportingDashboard;
